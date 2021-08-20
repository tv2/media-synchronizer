import { ConsumerEvent, EventConsumer } from '../lib/events'
import * as chokidar from 'chokidar'

export class MediaWatcherConsumer extends EventConsumer {
  protected watcher: any
  protected sourcePath: string

  constructor(options: { sourcePath: string }) {
    super()
    this.sourcePath = options.sourcePath
  }

  consume({ event, data, emit }: ConsumerEvent) {
    switch (event) {
      case 'setup':
        this.setup({ event, data, emit })
    }
  }

  private setup({ emit }: ConsumerEvent) {
    this.watcher = chokidar.watch(this.sourcePath, {
      persistent: true,
    })

    this.watcher
      .on('add', (path: string) => emit('file-added', { path }))
      .on('change', (path: string) => emit('file-changed', { path }))
      .on('unlink', (path: string) => emit('file-deleted', { path }))
  }
}
