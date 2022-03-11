import { Client } from "discord.js";

import { Injectable } from "@infrastructure/dependency-injection/injectable";
import { EventStrategy } from "@event/event.strategy";

@Injectable()
export class ReadyEventStrategy implements EventStrategy {
  constructor(private readonly client: Client) {}
  name: string = "ready";

  async callback(): Promise<void> {
    console.log(`Ready to work! ${this.client.user.tag}`);

    this.client.user.setActivity({
      type: "WATCHING",
      name: "license.rocks !!!",
      url: "https://license.rocks/",
    });
  }
}
