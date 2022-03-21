import axios from "axios";
import { CommandInteraction, MessageEmbed, Permissions } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import isURL from "validator/lib/isURL";

import { CommandStrategy } from "@command/command.strategy";
import { MessageFormat } from "@infrastructure/helpers/message-format";
import { ChannelLogs } from "@tools/channel-logs/channel-logs-manager";

export class RefreshCommandStrategy implements CommandStrategy {
  metadata = new SlashCommandBuilder()
    .setName("refresh")
    .setDescription("Refreshes guild info on specific CreatorsHub")
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

  requiredPermissions = [Permissions.FLAGS.ADMINISTRATOR];

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

    const logsManager = new ChannelLogs(guild);

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
            roles: roles
              .filter(({ name }) => name !== "@everyone")
              .map(({ id, name }) => ({ id, name })),
          },
        },
        headers: {
          secret: providedSecret,
        },
      });

      await interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setColor(MessageFormat.color.successGreen)
            .setDescription("Successfully refreshed server info."),
        ],
      });

      await logsManager.log("Successfully refreshed server info.", "success");
    } catch (error) {
      if (error.status === 400) {
        await interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor(MessageFormat.color.errorRed)
              .setDescription("Could not refresh this server info."),
          ],
        });
      }
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
