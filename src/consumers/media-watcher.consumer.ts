import { ConsumerEvent, EventConsumer } from '../utilities/events'
import * as chokidar from 'chokidar'

export interface IMediaWatcherConsumer {
  sourcePath: string
  watchFileDeletion?: boolean
}

export class MediaWatcherConsumer extends EventConsumer {
  protected watcher: any
  protected sourcePath: string
  protected watchFileDeletion: boolean

  constructor(options: IMediaWatcherConsumer) {
    super()
    this.sourcePath = options.sourcePath
    this.watchFileDeletion = options.watchFileDeletion || false
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
