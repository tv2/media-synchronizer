import { createLogger } from 'winston'
import { isLocal } from '../environment'
import { level, levels } from './level'

// Collect tranports
const transports: any[] = []
transports.push(require('./console.transport').transport)
if ((isLocal && process.env.LOG_VIZ_COMMANDS === 'true') || !isLocal) {
  transports.push(require('./file.transport').transport)
}

// Create logger
export const logger = createLogger({
  level,
  levels,
  transports,
})
