import { MediaWatcher } from "./src/mediaWatcher";
import { logger } from "./src/utilities/logger";

const mediaWatcher = new MediaWatcher({path: './__tests__'})

logger.debug('Media Watcher started')
mediaWatcher.run()