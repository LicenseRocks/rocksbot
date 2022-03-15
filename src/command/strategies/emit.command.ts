import { Client, CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { omit } from "lodash";

import { Injectable } from "@infrastructure/dependency-injection/injectable";
import { CommandStrategy } from "@command/command.strategy";
import { MessageFormat } from "@infrastructure/helpers/message-format";

//  NOTE: This command is dev-only. It is not added to the registry on production

@Injectable()
export class EmitCommandStrategy implements CommandStrategy {
  constructor(private readonly client: Client) {}

  emitableEvents = {
    guildCreate: async (interaction: CommandInteraction) => {
      const { guild } = interaction;
      this.client.emit("guildCreate", guild);
      await interaction.reply({
        content: `Successfully emitted ${MessageFormat.code("guildCreate")}.`,
        ephemeral: true,
      });
    },
    default: async (interation: CommandInteraction) => {
      await interation.reply({
        content: "This event is not emitable.",
        ephemeral: true,
      });
    },
  };

  metadata = new SlashCommandBuilder()
    .setName("emit")
    .setDescription("Emits one of events (dev only)")
    .addStringOption((option) =>
      option
        .setName("event-to-emit")
        .setDescription("Name of event to emit")
        .addChoices(
          Object.keys(omit(this.emitableEvents, "default")).map((eventName) => [
            eventName,
            eventName,
          ])
        )
        .setRequired(true)
    );

  async execute(interaction: CommandInteraction): Promise<void> {
    const { options } = interaction;
    const eventToEmit = options.getString("event-to-emit");

    await (
      this.emitableEvents[eventToEmit as string] ||
      this.emitableEvents["default"]
    )(interaction);
  }
}
