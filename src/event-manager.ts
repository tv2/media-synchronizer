import { EventManager } from './utilities/events/event-manager.class'
import { EventConsumer } from './utilities/events/event-consumer.class'

export const eventManager = new EventManager()

export function register(event: string, consumer: EventConsumer): void {
  eventManager.register(event, consumer)
}
