import { Server } from 'http'
import { ConsumerEvent, EventConsumer } from '../../utilities/events'
import { createAPIServer } from './server'

export type APIConsumerOptions = {
  port: bigint
}

export class APIConsumer extends EventConsumer {
  port: bigint
  server: Server

  constructor(options: APIConsumerOptions) {
    super()
    this.port = options.port
    this.server = createAPIServer(this.port)
  }

  consume({ event }: ConsumerEvent): void {
    switch (event) {
      case 'setup':
    }
  }
}
