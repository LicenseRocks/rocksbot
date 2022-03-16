require("dotenv").config();
import "reflect-metadata";

import { Resolver } from "@infrastructure/dependency-injection/injector";
import { EnvVars } from "@core/env-vars";
import { Bot } from "@core/bot";

import {
  InfoCommandStrategy,
  VerifyCommandStrategy,
  EmitCommandStrategy,
  RefreshCommandStrategy,
} from "@command/strategies";
import CommandRegistry from "@command/command.registry";

import {
  GuildCreateEventStrategy,
  InteractionCreateEventStrategy,
  ReadyEventStrategy,
} from "@event/strategies";
import EventRegistry from "@event/event.registry";

async function bootstrap(): Promise<void> {
  const bot = Resolver.resolve<Bot>(Bot);
  const commandRegistry = new CommandRegistry()
    .add(Resolver.resolve<InfoCommandStrategy>(InfoCommandStrategy))
    .add(Resolver.resolve<VerifyCommandStrategy>(VerifyCommandStrategy))
    .add(new RefreshCommandStrategy());

  if (EnvVars.MODE === "development") {
    commandRegistry.add(
      Resolver.resolve<EmitCommandStrategy>(EmitCommandStrategy)
    );
  }

  bot.addCommandRegistry(commandRegistry);

  const eventRegistry = new EventRegistry()
    .add(new InteractionCreateEventStrategy(commandRegistry.view()))
    .add(new GuildCreateEventStrategy())
    .add(Resolver.resolve<ReadyEventStrategy>(ReadyEventStrategy));

  bot.addEventRegistry(eventRegistry);

  await bot.start();
}

bootstrap();
