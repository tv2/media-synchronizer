import { createLogger } from 'winston'
import { level, levels } from './level'

// Collect tranports
const transports: any[] = []
transports.push(require('./console.transport').transport)

// Create logger
export const logger = createLogger({
  level,
  levels,
  transports,
})
