import { Client } from "discord.js";

import { Injectable } from "@infrastructure/dependency-injection/injectable";
import { EventStrategy } from "@event/event.strategy";

@Injectable()
export class ReadyEventStrategy implements EventStrategy {
  constructor(private readonly client: Client) {}
  name: string = "ready";

  async callback(): Promise<void> {
    const invite = this.client.generateInvite({
      scopes: ["applications.commands", "bot"],
      permissions: ["ADMINISTRATOR"],
    });

    console.log(`Ready to work! ${this.client.user.tag}`);
    console.log(`Invite: ${invite}`);
  }
}
