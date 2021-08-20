import { register } from '../event-manager'
import { MediaWatcherConsumer } from './media-watcher.consumer'
import { ControllerConsumer } from './controller.consumer'
import { resolve } from 'path'
import { FileTransfererConsumer } from './file-transferer.consumer'

const sourcePath = resolve(process.env.SOURCE_PATH || './__source__')
const targetPath = resolve(process.env.TARGET_PATH || './__target__')

// Setup media watcher
const mediaWatcher = new MediaWatcherConsumer({ sourcePath: sourcePath })
register('setup', mediaWatcher)

const controller = new ControllerConsumer({ sourcePath: sourcePath, targetPath: targetPath })
register('file-added', controller)
register('file-changed', controller)
register('file-deleted', controller)
register('transfer-success', controller)
register('transfer-fail', controller)

const fileTransferer = new FileTransfererConsumer()
register('transfer', fileTransferer)
