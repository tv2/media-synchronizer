import { register } from '../event-manager'
import { MediaWatcherConsumer } from './media-watcher.consumer'
import { ControllerConsumer } from './controller.consumer'
import { resolve } from 'path'
import { FileTransfererConsumer } from './file-transferer.consumer'
import { logger } from '../lib/utilities/logger'
import { name, version } from '../../package.json'
import { environment } from '../lib/utilities/environment'

const sourcePath = resolve(process.env.SOURCE_PATH || './__source__')
const targetPath = resolve(process.env.TARGET_PATH || './__target__')
const watchFileDeletion = (process.env.WATCH_FILE_DELETION || 'false') === 'true'

logger.info(`Starting up ${name}`)
logger.info(`Version: ${version}`)
logger.info(`Environment: ${environment}`)
logger.info(`SOURCE_PATH: ${sourcePath}`)
logger.info(`TARGET_PATH: ${targetPath}`)

// Setup media watcher
const mediaWatcher = new MediaWatcherConsumer({ sourcePath, watchFileDeletion })
register('setup', mediaWatcher)

const controller = new ControllerConsumer({ sourcePath, targetPath })
register('file-added', controller)
register('file-changed', controller)
register('file-deleted', controller)
register('transfer-success', controller)
register('transfer-fail', controller)

const fileTransferer = new FileTransfererConsumer()
register('transfer', fileTransferer)
