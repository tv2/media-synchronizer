import { eventManager } from "./src/event-manager";

import './src/consumers'

eventManager.emit('setup', null)