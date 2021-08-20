import { ConsumerEvent, EventConsumer } from '../lib/events'
import { statSync, unlink, existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import { logger } from '../lib/utilities/logger'

export class ControllerConsumer extends EventConsumer {
  protected targetPath: string
  protected sourcePath: string

  constructor(options: { targetPath: string; sourcePath: string }) {
    super()
    this.targetPath = options.targetPath
    this.sourcePath = options.sourcePath
  }

  consume({ event, data, emit }: ConsumerEvent): void {
    switch (event) {
      case 'file-changed':
      case 'file-added':
        this.addFile({ event, data, emit })
        break
      case 'file-deleted':
        this.deleteFile({ event, data, emit })
        break
      case 'transfer-success':
        logger.info(`Transfered file ${data.target}`)
        break
      case 'transfer-fail':
        logger.error(`Failed to transfer file ${data.target} due to ${data.stream} stream: ${data.error}`)
        break
    }
  }

  private deleteFile({ data: { path } }: ConsumerEvent) {
    unlink(path.replace(this.sourcePath, this.targetPath), (err) => {
      if (err) {
        logger.error(err)
      } else {
        logger.info(`File deleted: ${path}`)
      }
    })
  }

  private addFile({ data: { path }, emit }: ConsumerEvent) {
    const sourceFile = path
    const targetFile = path.replace(this.sourcePath, this.targetPath)
    // Ensure target directory
    const targetDir = dirname(targetFile)
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true })
    }

    if (existsSync(targetFile)) {
      try {
        const sourceStat = statSync(sourceFile)
        const targetStat = statSync(targetFile)
        if (sourceStat.mtimeMs > targetStat.mtimeMs) {
          // Transfer file
          emit('transfer', { source: sourceFile, target: targetFile })
        }
      } catch (err) {
        logger.error(err)
      }
    } else {
      // Transfer file
      emit('transfer', { source: sourceFile, target: targetFile })
    }
  }
}
