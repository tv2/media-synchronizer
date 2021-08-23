import { ConsumerEvent, EventConsumer } from '../lib/events'
import { statSync, unlink, existsSync, mkdirSync } from 'fs'
import { convertPath } from '../lib/utilities/filesystem'
import { dirname } from 'path'
import { logger } from '../lib/utilities/logger'

export class ControllerConsumer extends EventConsumer {
  protected targetPath: string
  protected sourcePath: string

  constructor(options: { targetPath: string; sourcePath: string }) {
    super()
    this.targetPath = options.targetPath
    this.sourcePath = options.sourcePath
    this.validatePaths()
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

  private deleteFile({ data: { path } }: ConsumerEvent): void {
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
    const targetFile = convertPath(path, this.sourcePath, this.targetPath)
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
          logger.debug('Transfer event sent: Source file has been updated')
          emit('transfer', { source: sourceFile, target: targetFile })
        }
      } catch (err) {
        logger.error(err)
      }
    } else {
      // Transfer file
      logger.debug('Transfer event sent: New file will be added to targetSoruce')
      emit('transfer', { source: sourceFile, target: targetFile })
    }
  }

  private validatePaths(): void {
    const sourcePath = this.sourcePath
    const targetPath = this.targetPath

    if (!existsSync(sourcePath)) {
      logger.error(`Exiting program: Source path does not exsist: ${sourcePath}`)
      process.exit(9)
    }

    // Check if targetPath drive, volume or share exsists
    if (!existsSync(targetPath)) {
      logger.error(`Exiting program: Target path drive, volume or share does not exsist: ${targetPath})`)
      process.exit(9)
    }
  }
}
