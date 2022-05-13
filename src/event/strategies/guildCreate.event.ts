import { MessageEmbed, Guild, Client } from "discord.js";

import { MessageFormat } from "@infrastructure/helpers/message-format";
import { EventStrategy } from "@event/event.strategy";
import { welcomeMessages } from "@infrastructure/translations";
import { Injectable } from "@infrastructure/dependency-injection/injectable";
import { retrieveFaulty } from "@infrastructure/helpers/faulty-pair";
import { isNil } from "lodash";

@Injectable()
export class GuildCreateEventStrategy implements EventStrategy {
  constructor(private readonly client: Client) {}

  name: string = "guildCreate";

  async callback(guild: Guild): Promise<void> {
    const guildOwner = await guild.fetchOwner();
    const guildOwnerDirectChannel = await guildOwner.createDM();

    const [_, error] = await retrieveFaulty(
      guildOwnerDirectChannel.send({
        embeds: [
          new MessageEmbed()
            .setColor(MessageFormat.color.neutralGray)
            .setTitle(welcomeMessages.en.title)
            .setAuthor({
              iconURL: this.client.user.avatarURL(),
              name: welcomeMessages.en.authorName,
            })
            .setDescription(welcomeMessages.en.description)
            .addFields(welcomeMessages.en.fields)
            .setFooter({ text: welcomeMessages.en.footer }),
          // TODO: Deutsch translations embed
        ],
      })
    );

    if (!isNil(error)) {
      console.log(
        `Could not send welcome message to ${guildOwner.user.tag} (${guildOwner.user.id}).`
      );
    }
  }
}
