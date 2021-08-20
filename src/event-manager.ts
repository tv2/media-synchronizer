import { EventManager } from './lib/events/event-manager.class'
import { EventConsumer } from './lib/events/event-consumer.class'

export const eventManager = new EventManager()

export function register(event: string, consumer: EventConsumer): void {
  eventManager.register(event, consumer)
}
