import type { LiteralUnion } from "type-fest";
import { Redis } from "ioredis";

import { Injectable } from "@infrastructure/dependency-injection/injectable";

const MESSAGE_CHANNELS = ["BOT_CHANNEL", "CREATORS_HUB_CHANNEL"] as const;
type LegibleRedisMessageChannel = typeof MESSAGE_CHANNELS[number];

//  TODO: There will be more of these types
type LegibleRedisMessageType = "guild_join";

type LegibleRedisMessage = {
  type: LiteralUnion<LegibleRedisMessageType, string>;
  payload: object;
};

@Injectable()
export class LegibleRedis {
  constructor(
    private readonly pubClient: Redis,
    private readonly subClient: Redis
  ) {}

  public async pub(
    channel: LegibleRedisMessageChannel,
    message: LegibleRedisMessage
  ) {
    return await this.pubClient.publish(channel, JSON.stringify(message));
  }

  public async sub(
    channel: LegibleRedisMessageChannel,
    handler: (message: LegibleRedisMessage) => void
  ) {
    this.subClient.subscribe(channel);
    this.subClient.on("message", (incomingChannel, message) => {
      if (incomingChannel === channel) {
        handler(JSON.parse(message) as LegibleRedisMessage);
      }
    });
  }

  public async unsub(channel: LegibleRedisMessageChannel) {
    await this.subClient.unsubscribe(channel);
  }
}
