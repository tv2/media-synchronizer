export interface ConsumerEvent {
  event: string
  data: any
  emit(event: string, data?: any): void
}

export abstract class EventConsumer {
  abstract consume(event: ConsumerEvent): void
}
