import { CommandInteraction, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import { CommandStrategy } from "@command/command.strategy";
import { MessageFormat } from "@infrastructure/helpers/message-format";

export class InfoCommandStrategy implements CommandStrategy {
  metadata = new SlashCommandBuilder()
    .setName("info")
    .setDescription("Shows info about mentioned user")
    .addUserOption((option) =>
      option
        .setName("mention-user")
        .setDescription("Please mention an user.")
        .setRequired(false)
    );

  async execute(interaction: CommandInteraction): Promise<any> {
    const {
      guild,
      options,
      user: { id: authorUserId },
    } = interaction;
    const optionalMentionUser = options.getUser("mention-user");
    const userId = optionalMentionUser ?? authorUserId;
    const shouldBeEphemeral = !!!optionalMentionUser;

    const member = await guild.members.fetch(userId);

    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setColor(MessageFormat.color.neutralGray)
          .setAuthor({
            name: `${member.user.tag} ${member.user.bot ? "🤖" : ""}`,
            iconURL: `${
              member.user.avatarURL({
                dynamic: true,
                format: "png",
              }) || member.user.defaultAvatarURL
            }`,
          })
          .setThumbnail(
            `${
              member.user.avatarURL({
                dynamic: true,
                format: "png",
                size: 1024,
              }) || member.user.defaultAvatarURL
            }`
          )
          .addFields(
            {
              name: `General`,
              value: `
                ID: ${MessageFormat.code(member.user.id)}
              `,
            },
            {
              name: `Guild`,
              value: `
                Display name: ${MessageFormat.code(member.user.username)}
                Display color: ${MessageFormat.code(member.displayHexColor)}
                Highest role: ${MessageFormat.role(member.roles.highest.id)}
                Permissions bitfield: ${MessageFormat.code(
                  member.permissions.bitfield.toString()
                )}
              `,
            }
          )
          .setFooter({
            text: `
              Account was created at ${member.user.createdAt.toLocaleString()}
              Joined guild at ${member.joinedAt.toLocaleString()} 
            `,
          }),
      ],
      ephemeral: shouldBeEphemeral,
    });
  }
}
