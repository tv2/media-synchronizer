import { register } from "../event-manager";
import { MediaWatcherConsumer } from "./media-watcher.consumer";
import { ControllerConsumer } from "./controller.consumer"
import { resolve } from "path";

const sourcePath = resolve('./__source__')
const targetPath = resolve('./__target__')

// Setup media watcher
const mediaWatcher = new MediaWatcherConsumer({sourcePath: sourcePath})
register('setup', mediaWatcher)

const controller = new ControllerConsumer({sourcePath: sourcePath, targetPath: targetPath})
register('file-added', controller)
register('file-changed', controller)
register('file-deleted', controller)
