import { CommandInteraction } from "discord.js";
import { isNil } from "lodash";

import { CommandStrategy } from "@command/command.strategy";
import { EventStrategy } from "@event/event.strategy";

export class InteractionCreateEventStrategy implements EventStrategy {
  constructor(private readonly commandStrategies: readonly CommandStrategy[]) {}

  name: string = "interactionCreate";

  async callback(interaction: CommandInteraction): Promise<void> {
    if (!interaction.isCommand()) {
      return;
    }

    for (const commandStrategy of this.commandStrategies) {
      const {
        metadata: { name },
        requiredPermissions,
        execute,
      } = commandStrategy;

      const executeScoped = execute.bind(commandStrategy);

      if (interaction.commandName === name) {
        if (!isNil(requiredPermissions)) {
          if (!interaction.memberPermissions.any(requiredPermissions)) {
            await interaction.reply({
              content:
                "Oops! It seems that you have insufficient permissions to execute this command",
              ephemeral: true,
            });
            return;
          }
        }

        await executeScoped(interaction);
      }
    }
  }
}
