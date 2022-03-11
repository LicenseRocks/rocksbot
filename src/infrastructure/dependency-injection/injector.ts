import "reflect-metadata";
import { Client, Intents } from "discord.js";
import { REST as RestClient } from "@discordjs/rest";

import { EnvVars } from "@core/env-vars";
import { Constructor } from "@infrastructure/dependency-injection/constructor.type";

export class Injector extends Map {
  public resolve<T>(target: Constructor<any>): T {
    const tokens = Reflect.getMetadata("design:paramtypes", target) || [];
    const injections = tokens.map((token: Constructor<any>) =>
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
