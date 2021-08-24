import { transports, format as wformat } from 'winston'
import { environment, Environment } from '../environment'

function transform(info: any) {
  const args = info[Symbol.for('splat')]
  if (args) {
    if (typeof args[0] === 'object') {
      console.log(args[0])
    }
  }
  return info
}

function utilFormatter() {
  return { transform }
}

const prettyJson = wformat.printf((info) => {
  return `[ ${info.timestamp} ] [ ${info.level} ]  ${info.message}`
})

const format =
  environment === Environment.Local
    ? wformat.combine(
        wformat.timestamp(),
        wformat.colorize(),
        wformat.prettyPrint(),
        wformat.simple(),
        prettyJson,
        utilFormatter()
      )
    : wformat.combine(wformat.timestamp(), wformat.json())

export const transport = new transports.Console({ format })
