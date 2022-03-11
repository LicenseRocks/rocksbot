import { MessageEmbed, Guild } from "discord.js";
import { stripIndent } from "common-tags";

import { MessageFormat } from "@infrastructure/helpers/message-format";
import { EventStrategy } from "@event/event.strategy";
import { welcomeMessages } from "@infrastructure/translations";

export class GuildCreateEventStrategy implements EventStrategy {
  name: string = "guildCreate";

  async callback(guild: Guild): Promise<void> {
    const guildOwner = await guild.fetchOwner();
    const guildOwnerDirectChannel = await guildOwner.createDM();

    await guildOwnerDirectChannel.send({
      embeds: [
        new MessageEmbed()
          .setColor(0x2f3136)
          .setTitle(welcomeMessages.en.title)
          .setDescription(welcomeMessages.en.description)
          .addFields(welcomeMessages.en.fields)
          .setFooter({ text: welcomeMessages.en.footer }),
        // TODO: Deutsch translations embed
      ],
    });
  }
}
