require("dotenv").config();
import "reflect-metadata";

import { Resolver } from "@infrastructure/dependency-injection/injector";

import { Bot } from "@core/bot";

import { InfoCommandStrategy } from "@command/strategies";
import CommandRegistry from "@command/command.registry";

import {
  InteractionCreateEventStrategy,
  ReadyEventStrategy,
} from "@event/strategies";

import EventRegistry from "@event/event.registry";

async function bootstrap(): Promise<void> {
  const bot = Resolver.resolve<Bot>(Bot);

  const commandRegistry = new CommandRegistry().add(new InfoCommandStrategy());

  bot.addCommandRegistry(commandRegistry);

  const eventRegistry = new EventRegistry()
    .add(new InteractionCreateEventStrategy(commandRegistry.view()))
    .add(Resolver.resolve<ReadyEventStrategy>(ReadyEventStrategy));

  bot.addEventRegistry(eventRegistry);

  await bot.start();
}

bootstrap();
