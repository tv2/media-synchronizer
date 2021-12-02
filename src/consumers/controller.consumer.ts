import { ConsumerEvent, EventConsumer } from '../utilities/events'
import { statSync, unlink, existsSync, mkdirSync } from 'fs'
import { convertPath } from '../utilities/filesystem'
import { dirname } from 'path'
import { logger } from '../utilities/logger'
import { volume } from '../utilities/filesystem'

export interface IControllerConsumer {
  targetPath: string
  sourcePath: string
  retransferInterval?: bigint
  numberOfRetransfers?: bigint
  onAirIdleDuration?: bigint
}

export interface IOnAirQueueObject {
  eventName: string
  eventData: any
}

export class ControllerConsumer extends EventConsumer {
  protected targetPath: string
  protected sourcePath: string
  protected retransferTimer: NodeJS.Timer
  protected isOnAir: boolean
  protected onAirEndTime: number
  protected onAirTimer: NodeJS.Timer | null = null
  protected onAirIdleDuration: BigInt
  protected retransferCache: {
    [key: string]: { data: { source: string; target: string }; attempts: number; emit: Function; emitted: boolean }
  }
  protected onAirQueue: Array<any>
  protected numberOfRetransfers: number

  constructor(options: IControllerConsumer) {
    super()
    this.targetPath = options.targetPath
    this.sourcePath = options.sourcePath
    this.validatePaths()
    this.retransferCache = {}
    this.isOnAir = false
    this.onAirEndTime = 0
    this.onAirQueue = []
    this.retransferTimer = setInterval(() => this.retransfer(), Number(options.retransferInterval) || 10 * 1000)
    this.numberOfRetransfers = Number(options.numberOfRetransfers) || 3
    this.onAirIdleDuration = options.onAirIdleDuration ?? 60000n
  }

  consume({ event, data, emit }: ConsumerEvent): void {
    switch (event) {
      case 'on-air':
        this.setOnAir({ event, data, emit })
        break
      case 'off-air':
        this.setOffAir(emit)
        break
      case 'file-changed':
        if (this.isOnAir) {
          this.addToOnAirQueue(event, data)
        } else {
          this.addFile({ event, data, emit })
        }
        break
      case 'file-added':
        this.addFile({ event, data, emit })
        break
      case 'file-deleted':
        if (this.isOnAir) {
          this.addToOnAirQueue(event, data)
        } else {
          this.deleteFile({ event, data, emit })
        }
        break
      case 'transfer-success':
        logger.info(`Transfered file ${data.target}`)
        break
      case 'transfer-fail':
        this.cacheForRetransfer(data, emit)
        logger.error(`Failed to transfer file ${data.target} due to ${data.stream} stream: ${data.error}`)
        break
    }
  }

  private addToOnAirQueue(eventName: string, eventData: any) {
    const onAirQueueObject: IOnAirQueueObject = {
      eventName: eventName,
      eventData: eventData,
    }
    this.onAirQueue.push(onAirQueueObject)
  }

  private setOnAir({ data, emit }: ConsumerEvent) {
    this.isOnAir = true
    this.onAirEndTime = Number(data.endTime)
    if (this.onAirTimer !== null) {
      clearInterval(this.onAirTimer)
    }
    this.onAirTimer = setInterval(() => {
      if (this.onAirEndTime > Date.now()) {
        return
      }
      this.setOffAir(emit)
    }, Number(this.onAirIdleDuration))
    logger.info(`Is now On Air.`)
  }

  private setOffAir(emit: any) {
    if (!this.isOnAir) {
      logger.debug('Already Off Air!')
      return
    }
    this.isOnAir = false
    logger.info(`Is now Off Air.`)

    if (this.onAirTimer !== null) {
      clearInterval(this.onAirTimer)
      logger.trace('Cleared onAirTimer.')
    }

    logger.debug(`OnAirQueue length: ${this.onAirQueue.length}`)

    this.onAirQueue.forEach((element) => {
      logger.info(`Resending event: ${element.eventName} path: ${element.eventData.path}`)
      emit(element.eventName, { path: element.eventData.path })
    })
    this.onAirQueue = []
  }

  private retransfer() {
    Object.entries(this.retransferCache).forEach(([_, cache]) => {
      if (cache.emitted) return
      logger.debug(`Trying retransfer of ${cache.data.target}`)
      cache.emitted = true
      cache.emit('transfer', cache.data)
    })
  }

  private cacheForRetransfer(data: any, emit: any) {
    if (data.target in this.retransferCache) {
      if (this.retransferCache[data.target].attempts >= this.numberOfRetransfers) {
        logger.warn(`Maximum retransfer tries reached for file: ${data.target}`)
        delete this.retransferCache[data.target]
        return
      }
      this.retransferCache[data.target].emitted = false
      this.retransferCache[data.target].attempts++
      return
    }
    this.retransferCache[data.target] = {
      data: { source: data.source, target: data.target },
      emit,
      attempts: 0,
      emitted: false,
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
      logger.debug(`Transfer event sent: New file will be added to target path: ${targetFile}`)
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
    if (!existsSync(volume(targetPath))) {
      logger.error(`Exiting program: Target path, drive, volume or share does not exsist: ${targetPath}`)
      process.exit(9)
    }
  }
}
