import { Client, Role, GuildMember } from "discord.js";
import { REST as RestClient } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { isNil } from "lodash";

import { EnvVars } from "@core/env-vars";
import { ChannelLogs } from "@tools/channel-logs/channel-logs-manager";
import { Injectable } from "@infrastructure/dependency-injection/injectable";
import {
  LegibleRedis,
  NftPurchaseRewardPayload,
} from "@infrastructure/redis/legible-redis";
import { MessageFormat } from "@infrastructure/helpers/message-format";
import { retrieveFaulty } from "@infrastructure/helpers/faulty-pair";

import CommandRegistry from "@command/command.registry";
import EventRegistry from "@event/event.registry";

@Injectable()
export class Bot {
  constructor(
    private readonly client: Client,
    private readonly restClient: RestClient,
    private readonly legibleRedis: LegibleRedis
  ) {}

  private readonly config = {
    token: EnvVars.DISCORD_TOKEN,
  };

  private commandRegistry: CommandRegistry;
  private eventRegistry: EventRegistry;

  public addCommandRegistry(commandRegistry: CommandRegistry): void {
    if (this.commandRegistry) {
      throw new Error("CommandRegistry was already provided.");
    }

    this.commandRegistry = commandRegistry;
  }

  public addEventRegistry(eventRegistry: EventRegistry): void {
    if (this.eventRegistry) {
      throw new Error("EventRegistry was already provided");
    }

    this.eventRegistry = eventRegistry;
  }

  public async start(): Promise<void> {
    this.applyEventRegistry();
    await this.listen();
    await this.applyCommandRegistry();
    await this.handleCommunication();
  }

  private async listen(): Promise<void> {
    await this.client.login(this.config.token);
  }

  private async handleCommunication() {
    await this.legibleRedis.sub<NftPurchaseRewardPayload>(
      //  TODO: Extract this to separate file
      async ({ type, payload }) => {
        if (type === "nft_purchase_reward") {
          const { guildId, roleId, destinationUserId } = payload;

          //  TODO: Make it not possible to be undefined, maybe handle guild delete and send it to CreatorsHub via webhook?
          const guild = await this.client.guilds.fetch(guildId);
          const logsManager = new ChannelLogs(guild);

          const [role, roleError] = await retrieveFaulty<Role>(
            guild.roles.fetch(roleId)
          );

          if (isNil(role) || roleError) {
            await logsManager.log(
              `Could not find reward ${MessageFormat.code(
                roleId
              )} role on the ${MessageFormat.code(
                guild.name
              )}. Aborted reward role ${MessageFormat.bold("assign")} process.`,
              "warning"
            );
            return;
          }

          const [member, memberError] = await retrieveFaulty<GuildMember>(
            guild.members.fetch(destinationUserId)
          );

          if (isNil(member) || memberError) {
            logsManager.log(
              `Could not find member (${MessageFormat.user(
                destinationUserId
              )}) that would ${MessageFormat.bold(
                "receive reward"
              )} on the ${MessageFormat.code(
                guild.name
              )}. Aborted reward role assign process.`,
              "warning"
            );
            return;
          }

          try {
            await member.roles.add(role);

            await logsManager.log(
              `Successfully ${MessageFormat.bold(
                "assigned"
              )} ${MessageFormat.role(roleId)} to ${MessageFormat.user(
                destinationUserId
              )} on ${MessageFormat.code(guild.name)}`,
              "success"
            );
          } catch (error) {
            await logsManager.log(
              `Could not ${MessageFormat.bold("assign")} ${MessageFormat.role(
                roleId
              )} reward role to ${MessageFormat.user(
                destinationUserId
              )} on the ${MessageFormat.code(guild.name)}.`,
              "error"
            );

            await logsManager.log(
              `Stack trace for error above.\n${MessageFormat.codeMultiline(
                JSON.stringify(error, null, 2),
                "json"
              )}`,
              "error"
            );
          }
        } else if (type === "nft_reward_revoke") {
          const { guildId, roleId, destinationUserId } = payload;

          //  TODO: Make it not possible to be undefined, maybe handle guild delete and send it to CreatorsHub via webhook?
          const guild = await this.client.guilds.fetch(guildId);
          const logsManager = new ChannelLogs(guild);

          const [role, roleError] = await retrieveFaulty<Role>(
            guild.roles.fetch(roleId)
          );

          if (isNil(role) || roleError) {
            await logsManager.log(
              `Could not find reward ${MessageFormat.code(
                roleId
              )} role on the ${MessageFormat.code(
                guild.name
              )}. Aborted reward role ${MessageFormat.bold("revoke")} process.`,
              "warning"
            );
            return;
          }

          const [member, memberError] = await retrieveFaulty<GuildMember>(
            guild.members.fetch(destinationUserId)
          );

          if (isNil(member) || memberError) {
            logsManager.log(
              `Could not find member (${MessageFormat.user(
                destinationUserId
              )}) that would have reward role ${MessageFormat.bold(
                "revoked"
              )} ${MessageFormat.code(
                guild.name
              )}. Aborted reward role ${MessageFormat.bold("revoke")} process.`,
              "warning"
            );
            return;
          }

          try {
            await member.roles.remove(role);

            await logsManager.log(
              `Successfully ${MessageFormat.bold(
                "revoked"
              )} ${MessageFormat.role(roleId)} from ${MessageFormat.user(
                destinationUserId
              )} on ${MessageFormat.code(guild.name)}`,
              "success"
            );
          } catch (error) {
            await logsManager.log(
              `Could not ${MessageFormat.bold("revoke")} ${MessageFormat.role(
                roleId
              )} reward role from ${MessageFormat.user(
                destinationUserId
              )} on the ${MessageFormat.code(guild.name)}.`,
              "error"
            );

            await logsManager.log(
              `Stack trace for error above.\n${MessageFormat.codeMultiline(
                JSON.stringify(error, null, 2),
                "json"
              )}`,
              "error"
            );
          }
        }
      }
    );
  }

  private applyEventRegistry(): void {
    if (!this.eventRegistry || this.eventRegistry.view().length === 0) {
      throw new Error("EventRegistry does not exist or is empty.");
    }

    for (const eventStrategy of this.eventRegistry.view()) {
      this.client.on(
        eventStrategy.name,
        eventStrategy.callback.bind(eventStrategy)
      );
    }
  }

  private async applyCommandRegistry(): Promise<void> {
    if (!this.commandRegistry || this.commandRegistry.view().length === 0) {
      throw new Error("CommandRegistry does not exist or is empty.");
    }

    if (!this.client.application) {
      await this.client.application.fetch();
    }

    const slashCommandsMetadata = await Promise.all(
      this.commandRegistry
        .view()
        .map(async ({ metadata: { name, description, options } }) => ({
          name,
          description,
          options,
        }))
    );

    if (EnvVars.MODE === "development") {
      await this.restClient.put(
        Routes.applicationGuildCommands(
          EnvVars.DISCORD_CLIENT_ID,
          EnvVars.DISCORD_TEST_GUILD_ID
        ),
        { body: slashCommandsMetadata }
      );
    } else if (EnvVars.MODE === "production") {
      await this.restClient.put(
        Routes.applicationCommands(EnvVars.DISCORD_CLIENT_ID),
        { body: slashCommandsMetadata }
      );
    }
  }
}
