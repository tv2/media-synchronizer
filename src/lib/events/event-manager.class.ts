import { EventEmitter } from 'events'
import { EventConsumer } from './event-consumer.class'

export class EventManager {
  private manager: EventEmitter

  constructor() {
    this.manager = new EventEmitter()
  }

  register(event: string, consumer: EventConsumer) {
    this.manager.on(event, (data) =>
      consumer.consume({
        event,
        data,
        emit: (_event: string, _data: any = null) => setImmediate(() => this.emit(_event, _data)),
      })
    )
  }

  emit(event: string, data: any = null) {
    this.manager.emit(event, data)
  }
}
