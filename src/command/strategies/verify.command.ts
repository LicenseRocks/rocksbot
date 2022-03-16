import axios from "axios";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import isURL from "validator/lib/isURL";

import { CommandStrategy } from "@command/command.strategy";
import { MessageFormat } from "@infrastructure/helpers/message-format";

export class VerifyCommandStrategy implements CommandStrategy {
  metadata = new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Verifies & connect this server with speficic CreatorsHub")
    .addStringOption((option) =>
      option
        .setName("creators-hub-url")
        .setDescription("Please provide creators hub URL.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("creators-hub-secret")
        .setDescription("Please provide creators hub secret.")
        .setRequired(true)
    );

  async execute(interaction: CommandInteraction): Promise<any> {
    const { guild, options } = interaction;
    const [providedUrl, providedSecret] = [
      options.getString("creators-hub-url"),
      options.getString("creators-hub-secret"),
    ];

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
          type: "server_verification",
          payload: {
            guildId: guild.id,
          },
        },
        headers: {
          secret: providedSecret,
        },
      });

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
        headers: {
          secret: providedSecret,
        },
      });

      await interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setColor(MessageFormat.color.neutralGray)
            .setDescription("Successfully verified this guild."),
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
