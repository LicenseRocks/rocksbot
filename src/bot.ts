import { Client } from "discord.js";
import { REST as RestClient } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";

import { EnvVars } from "@core/env-vars";
import { Injectable } from "@infrastructure/dependency-injection/injectable";

import CommandRegistry from "@command/command.registry";
import EventRegistry from "@event/event.registry";
import {
  LegibleRedis,
  NftPurchaseRewardPayload,
} from "@infrastructure/redis/legible-redis";

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
      async ({ type, payload }) => {
        if (type === "nft_purchase_reward") {
          const { guildId, roleId, destinationUserId } = payload;

          try {
            const guild = await this.client.guilds.fetch(guildId);
            const role = await guild.roles.fetch(roleId);
            const member = await guild.members.fetch(destinationUserId);

            await member.roles.add(role);
            //  TODO: This should be replaced with notifing the creators hub about errors
            console.log(
              `Successfully assigned ${role.name} to ${member.user.tag} on ${guild.name}`
            );
          } catch (error) {
            console.log("Role assigning failed.");
            console.error(error);
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
