import { CommandInteraction } from "discord.js";

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
        execute,
      } = commandStrategy;
      const executeScoped = execute.bind(commandStrategy);
      if (interaction.commandName === name) {
        executeScoped(interaction);
      }
    }
  }
}
