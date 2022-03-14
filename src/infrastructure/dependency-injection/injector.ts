import "reflect-metadata";
import Redis from "ioredis";
import { Client, Intents } from "discord.js";
import { REST as RestClient } from "@discordjs/rest";

import { EnvVars } from "@core/env-vars";
import { Constructor } from "@infrastructure/dependency-injection/constructor.type";
import { LegibleRedis } from "@infrastructure/redis/legible-redis";

export class Injector extends Map {
  public resolve<T>(
    target: Constructor<any>,
    manualInjections?: Array<any>
  ): T {
    const tokens = Reflect.getMetadata("design:paramtypes", target) || [];

    const validTokens = manualInjections
      ? tokens.slice(manualInjections.length)
      : tokens;

    const injections = validTokens.map((token: Constructor<any>) =>
      this.resolve<any>(token)
    );

    const classInstance = this.get(target);

    if (classInstance) {
      return classInstance;
    }

    const newClassInstance =
      target === Client
        ? new Client({
            intents: [
              Intents.FLAGS.GUILDS,
              Intents.FLAGS.GUILD_MEMBERS,
              Intents.FLAGS.GUILD_MESSAGES,
              Intents.FLAGS.DIRECT_MESSAGES,
            ],
          })
        : target === RestClient
        ? new RestClient({ version: "10" }).setToken(EnvVars.DISCORD_TOKEN)
        : //  HACK: This has to be here due to DI inability to detect the dependency dependencies and it has two instances of the same type and DI handles every dependency as singletons.
        target === LegibleRedis
        ? new LegibleRedis(
            //  FIXME: ioredis types are probably outdated because the constructor does not accept options object
            new Redis({
              port: EnvVars.REDIS_PORT,
              host: EnvVars.REDIS_HOST,
              db: EnvVars.REDIS_DB_NO,
            } as any)
          )
        : manualInjections
        ? new target(...manualInjections, ...injections)
        : new target(...injections);

    this.set(target, newClassInstance);

    console.log(
      `Dependency injection container: created class ${newClassInstance.constructor.name}`
    );

    return newClassInstance;
  }

  public release(): void {
    for (const value of this.values()) {
      if (typeof value["release"] === "function") {
        value["release"]();
      }
    }

    this.clear();
  }
}

export const Resolver = new Injector();
