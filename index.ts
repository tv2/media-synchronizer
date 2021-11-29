import { eventManager } from './src/event-manager'
import { setupEnvironment } from './src/loaders'

setupEnvironment()

import './src/consumers'

eventManager.emit('setup', null)

import './src/api'