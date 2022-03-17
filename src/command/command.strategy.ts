import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, PermissionResolvable } from "discord.js";

export interface CommandStrategy {
  metadata:
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  requiredPermissions?: Array<PermissionResolvable>;
  execute(interaction: CommandInteraction): Promise<void>;
}
