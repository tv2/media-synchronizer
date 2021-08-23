import { transports, format as wformat } from 'winston'
import { environment, Environment } from '../environment'

const prettyJson = wformat.printf((info) => {
  if (typeof info.message === 'object') {
    console.log('')
    console.log(info.message)
    return ''
  }
  return `[ ${info.timestamp} ] [ ${info.level} ]  ${info.message}`
})

const format =
  environment === Environment.Local
    ? wformat.combine(
        wformat.timestamp(),
        wformat.colorize(),
        wformat.prettyPrint(),
        wformat.splat(),
        wformat.simple(),
        prettyJson
      )
    : wformat.combine(wformat.timestamp(), wformat.json())

export const transport = new transports.Console({ format })
