import { EventStrategy } from "@event/event.strategy";

export default class EventRegistry {
  private eventStrategies: EventStrategy[] = [];

  public add(eventStrategy: EventStrategy): EventRegistry {
    this.eventStrategies.push(eventStrategy);
    return this;
  }

  public view(): readonly EventStrategy[] {
    return Object.freeze(this.eventStrategies);
  }
}
