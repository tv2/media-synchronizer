import { ConsumerEvent, EventConsumer } from '../lib/events'
import * as chokidar from 'chokidar'

export class MediaWatcherConsumer extends EventConsumer {
  protected watcher: any
  protected sourcePath: string
  protected watchFileDeletion: boolean

  constructor(options: { sourcePath: string, watchFileDeletion: boolean }) {
    super()
    this.sourcePath = options.sourcePath
    this.watchFileDeletion = options.watchFileDeletion
  }

  consume({ event, data, emit }: ConsumerEvent) {
    switch (event) {
      case 'setup':
        this.setup({ event, data, emit })
    }
  }

  private setup({ emit }: ConsumerEvent) {
    this.watcher = chokidar.watch(this.sourcePath, {
      ignored: /(node_modules|(^|[\/\\])\..)/, // ignore dotfiles
      persistent: true,
    })

    this.watcher
      .on('add', (path: string) => emit('file-added', { path }))
      .on('change', (path: string) => emit('file-changed', { path }))

    if (this.watchFileDeletion) {
      this.watcher.on('unlink', (path: string) => emit('file-deleted', { path }))
    }
  }
}
