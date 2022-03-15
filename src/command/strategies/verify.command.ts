import axios from "axios";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

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

    await interaction.deferReply({ ephemeral: true });

    try {
      await axios({
        method: "POST",
        url: `${providedUrl}/api/discord/webhook`,
        data: {
          type: "server_verification",
          guildId: guild.id,
        },
        headers: {
          secret: providedSecret,
        },
      });

      await interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setColor(MessageFormat.color.neutralGray)
            .setDescription("works"),
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
}
