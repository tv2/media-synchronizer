import { ConsumerEvent, EventConsumer } from "../lib/events";
import { statSync, unlink, existsSync } from "fs";
import { logger } from "../lib/utilities/logger";

export class ControllerConsumer extends EventConsumer {

  protected targetPath: string
  protected sourcePath: string

  constructor(options: {
    targetPath: string,
    sourcePath: string
  }) {
    super()
    this.targetPath = options.targetPath
    this.sourcePath = options.sourcePath
  }

  consume({event, data, emit}: ConsumerEvent): void {
    switch (event) {
      case 'file-updated':
      case 'file-added': this.addFile({event, data, emit}) 
        break
      case 'file-deleted': this.deleteFile({event, data, emit})
        break
    }
  }

  private deleteFile({data}: ConsumerEvent) {
    unlink(data.path.replace(this.sourcePath, this.targetPath), (err) => {
      if (err) logger.error(err)
      logger.debug(`File deleted: ${data}`)
    })
  }

  private addFile({data, emit}: ConsumerEvent) {
    const sourceFile = data.path
    const targetFile = data.path.replace(this.sourcePath, this.targetPath)
    console.log(targetFile)
    if (existsSync(targetFile)) {
      try {
        const sourceStat = statSync(sourceFile)
        const targetStat = statSync(targetFile)
        if (sourceStat.mtime > targetStat.mtime) {
          // Transfer file
          emit('transfer-file', {source: sourceFile, target: targetFile })
        }
      } catch (err) {
        logger.error(err)
      }
    } else {
      // Transfer file
      emit('transfer', {source: sourceFile, target: targetFile })
    }
  }
}