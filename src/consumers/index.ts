import { register } from '../event-manager'
import { MediaWatcherConsumer } from './media-watcher.consumer'
import { ControllerConsumer } from './controller.consumer'
import { resolve } from 'path'
import { FileTransfererConsumer } from './file-transferer.consumer'
import { logger } from '../utilities/logger'
import { name, version } from '../../package.json'
import { environment } from '../utilities/environment'
import { APIConsumer } from './api.consumer'

const sourcePath = resolve(process.env.SOURCE_PATH || './__source__')
const targetPath = resolve(process.env.TARGET_PATH || './__target__')
const watchFileDeletion = (process.env.WATCH_FILE_DELETION || 'false') === 'true'

logger.info(`Starting up ${name}`)
logger.info(`Version: ${version}`)
logger.info(`Environment: ${environment}`)
logger.info(`SOURCE_PATH: ${sourcePath}`)
logger.info(`TARGET_PATH: ${targetPath}`)
logger.info(`Watch for file deletion: ${watchFileDeletion}`)

// Setup media watcher
const mediaWatcher = new MediaWatcherConsumer({ sourcePath, watchFileDeletion })
register('setup', mediaWatcher)

const onAirTimerInterval = BigInt(process.env.ON_AIR_TIMER_INTERVAL_MS || '60000')
logger.info(`ON_AIR_TIMER_INTERVAL_MS: ${onAirTimerInterval}`)
const controller = new ControllerConsumer({ sourcePath, targetPath, onAirTimerInterval })
register('file-added', controller)
register('file-changed', controller)
register('file-deleted', controller)
register('transfer-success', controller)
register('transfer-fail', controller)
register('on-air', controller)
register('off-air', controller)

const fileTransferer = new FileTransfererConsumer()
register('transfer', fileTransferer)

const apiServer = new APIConsumer({ port: BigInt(process.env.PORT ?? '6996') })
register('setup', apiServer)
