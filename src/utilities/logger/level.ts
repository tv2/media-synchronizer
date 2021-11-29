import { isLocal } from '../environment'

// Log levels
export const level: string = process.env.LOG_LEVEL || (isLocal ? 'debug' : 'info')
export const levels: { [key: string]: number } = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
}
