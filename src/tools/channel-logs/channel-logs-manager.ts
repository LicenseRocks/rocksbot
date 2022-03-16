import {
  Collection,
  Guild,
  MessageEmbed,
  NonThreadGuildBasedChannel,
  Snowflake,
} from "discord.js";
import { isNil } from "lodash";

import { MessageFormat } from "@infrastructure/helpers/message-format";

export const channelLogTypes = ["info", "error", "warning", "success"] as const;
type ChannelLogType = typeof channelLogTypes[number];

const channelLogAppearance: Record<
  ChannelLogType,
  { color: number; title: string }
> = {
  info: { color: MessageFormat.color.neutralGray, title: "ℹ️ Info" },
  error: {
    color: MessageFormat.color.errorRed,
    title: "⛔️ An error has occurred :(",
  },
  warning: { color: MessageFormat.color.warningYellow, title: "⚠️ Warning!" },
  success: { color: MessageFormat.color.successGreen, title: "✅ Success!" },
};

export class ChannelLogs {
  constructor(private readonly guild: Guild) {
    this.guild.channels.fetch().then((channels) => (this.channels = channels));
  }

  private channels: Collection<Snowflake, NonThreadGuildBasedChannel> = null;

  public async log(message: string, type: ChannelLogType = "info") {
    const logsChannel = this.getLogsChannel();

    if (isNil(logsChannel) || !logsChannel.isText()) {
      console.warn(
        `Could not find #rocksbot-logs channel on ${this.guild.name} Discord. Skipping logging process.`
      );
      return;
    }

    await logsChannel.send({
      embeds: [
        new MessageEmbed()
          .setColor(channelLogAppearance[type].color)
          .setTitle(channelLogAppearance[type].title)
          .setDescription(message)
          .setFooter({
            text: `at ${new Date().toLocaleString()}`,
          }),
      ],
    });
  }

  private getLogsChannel() {
    return this.channels.find((channel) => channel.name === "rocksbot-logs");
  }
}
