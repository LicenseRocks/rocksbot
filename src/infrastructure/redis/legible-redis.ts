import type { Snowflake } from "discord.js";
import type { LiteralUnion } from "type-fest";
import { Redis } from "ioredis";

import { Injectable } from "@infrastructure/dependency-injection/injectable";

const MESSAGE_CHANNELS = ["CREATORS_HUB_CHANNEL"] as const;
type LegibleRedisMessageChannel = typeof MESSAGE_CHANNELS[number];

type LegibleRedisMessageType = "nft_purchase_reward" | "nft_reward_revoke";

type LegibleRedisMessage<T = any> = {
  type: LiteralUnion<LegibleRedisMessageType, string>;
  payload: T;
};

export type NftPurchaseRewardPayload = {
  guildId: Snowflake;
  roleId: Snowflake;
  destinationUserId: Snowflake;
};

@Injectable()
export class LegibleRedis {
  private readonly defaultChannel: LegibleRedisMessageChannel =
    "CREATORS_HUB_CHANNEL";

  constructor(private readonly client: Redis) {}

  public async sub<T>(
    handler: (message: LegibleRedisMessage<T>) => Promise<void>
  ) {
    await this.client.subscribe("CREATORS_HUB_CHANNEL");
    this.client.on("message", async (incomingChannel, message) => {
      if (incomingChannel === this.defaultChannel) {
        await handler(JSON.parse(message) as LegibleRedisMessage<T>);
      }
    });
  }

  public async unsub() {
    await this.client.unsubscribe(this.defaultChannel);
  }
}
