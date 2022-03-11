import { SlashCommandBuilder } from "@discordjs/builders";
import { ApplicationCommandOptionData, CommandInteraction } from "discord.js";

export interface CommandStrategy {
  metadata: SlashCommandBuilder |Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> ;
  execute(interaction: CommandInteraction): Promise<any>;
}
