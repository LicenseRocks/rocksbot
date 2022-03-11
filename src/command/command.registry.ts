import { CommandStrategy } from "@command/command.strategy";

export default class CommandRegistry {
  private commandStrategies: CommandStrategy[] = [];

  public add(commandStrategy: CommandStrategy): CommandRegistry {
    this.commandStrategies.push(commandStrategy)
    return this
  }

  public view(): readonly CommandStrategy[] {
    return Object.freeze(this.commandStrategies);
  }
}