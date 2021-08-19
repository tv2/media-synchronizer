import * as chokidar from 'chokidar'
import { logger } from './utilities/logger'

export class MediaWatcher {

  protected watcher: any
  protected path: string

  constructor(options: {
    path: string
  }) {
    this.path = options.path || './__tests__'
    this.run()
  }

  run() {
    logger.debug(this.path)
    this.watcher = chokidar.watch(this.path, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true
    })

    this.watcher.on('add', (path: string) => logger.debug(`File ${path} has been added`))  
    .on('change', (path: string) => logger.debug(`File ${path} has been changed`))
    .on('unlink', (path: string) => logger.debug(`File ${path} has been removed`))
  }


}