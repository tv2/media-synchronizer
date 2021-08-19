import { MediaWatcher } from "./src/mediaWatcher";
import { logger } from "./src/utilities/logger";

logger.debug('Media Watcher started')

new MediaWatcher({path: './__tests__'})
