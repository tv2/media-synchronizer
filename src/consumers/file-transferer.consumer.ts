import { createReadStream, createWriteStream } from 'fs'
import { EventConsumer } from '../utilities/events'
import { logger as baseLogger } from '../utilities/logger'
const logger = baseLogger.tag('File transferer consumer')
export class FileTransfererConsumer extends EventConsumer {
  protected activeTransfers: any

  constructor() {
    super()
    this.activeTransfers = {}
  }

  consume({ event, data, emit }: any) {
    logger.data(data).debug(`FileTransfererConsumer event: ${event}`)

    switch (event) {
      case 'transfer':
        this.transferFile(data.source, data.target, emit)
        break
    }
  }

  transferFile(source: string, target: string, emit: any) {
    const readStream = createReadStream(source)
    const writeStream = createWriteStream(target, {
      highWaterMark: 100 * 1024, // 100KB
    })
    let failed: boolean = false
    // TODO: Stop any previous streams for this id.
    this.activeTransfers[target] = { readStream, writeStream }
    readStream.on('data', (chunk: Buffer) => writeStream.write(chunk) || readStream.pause())
    readStream.on('error', (error) => {
      failed = true
      emit('transfer-fail', { source, target, error, stream: 'read' })
    })
    readStream.on('end', () => writeStream.end())
    writeStream.on('drain', () => readStream.resume())
    writeStream.on('error', (error) => {
      logger.data(error).error('Error in writeStream')
      failed = true
      readStream.close()
      emit('transfer-fail', { source, target, error, stream: 'write' })
    })
    writeStream.on('close', () => {
      !failed && emit('transfer-success', { source, target })
      delete this.activeTransfers[target]
    })
  }
}
