import axios from "axios";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import isURL from "validator/lib/isURL";

import { CommandStrategy } from "@command/command.strategy";
import { MessageFormat } from "@infrastructure/helpers/message-format";

export class RefreshCommandStrategy implements CommandStrategy {
  metadata = new SlashCommandBuilder()
    .setName("refresh")
    .setDescription("Refreshes guild info on specific CreatorsHub")
    .addStringOption((option) =>
      option
        .setName("creators-hub-url")
        .setDescription("Please provide creators hub URL.")
        .setRequired(true)
    );

  async execute(interaction: CommandInteraction): Promise<any> {
    const { guild, options } = interaction;
    const providedUrl = options.getString("creators-hub-url");

    if (!isURL(this.autolink(providedUrl))) {
      await interaction.reply({
        content: `Provided ${MessageFormat.code(
          "creators-hub-url"
        )} is invalid.`,
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const roles = await guild.roles.fetch();

    try {
      await axios({
        method: "POST",
        url: `${this.autolink(providedUrl)}/api/webhooks/discord`,
        data: {
          type: "server_info_update",
          payload: {
            guildId: guild.id,
            guildName: guild.name,
            guildAvatar: guild.iconURL(),
            roles: roles.map(({ id, name }) => ({ id, name })),
          },
        },
      });

      await interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setColor(MessageFormat.color.neutralGray)
            .setDescription("Successfully refreshed server info"),
        ],
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setColor(MessageFormat.color.errorRed)
            .setTitle("Something went wrong.")
            .setDescription(
              MessageFormat.codeMultiline(
                JSON.stringify(error, null, 2),
                "json"
              )
            ),
        ],
      });
    }
  }

  private autolink(input: string) {
    return !input.startsWith("https://") && !input.startsWith("http://")
      ? `https://${input}`
      : input.startsWith("http://")
      ? input.replace("http://", "https://")
      : input;
  }
}