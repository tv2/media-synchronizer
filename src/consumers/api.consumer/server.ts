import express, { Request, Response } from 'express'
import { Server } from 'http'

import bodyParser from 'body-parser'
import Joi from 'joi'
import { logger as baseLogger } from '../../utilities/logger'
import { eventManager } from '../../event-manager'
const logger = baseLogger.tag('API consumer')

export function createAPIServer(port: bigint): Server {
  const server = express()
  server.use(bodyParser.json())

  server.post('/on-air', onAirController)
  server.post('/off-air', offAirController)

  return server.listen(Number(port), () => logger.info(`Server started at http://localhost:${port}.`))
}

async function onAirController(request: Request, response: Response): Promise<void> {
  const schema = Joi.object({
    endTime: Joi.number().integer().required(),
  })
  try {
    const data = await schema.validateAsync(request.body)

    eventManager.emit('on-air', data)
    logger.data(data).debug('/on-air data emitted:')
    response.status(200).send({ status: 'success', data })
  } catch (error) {
    logger.data(error).error('Input validation failed for /on-air.')
    response.status(400).send({ status: 'fail', data: error })
  }
}

async function offAirController(request: Request, response: Response): Promise<void> {
  const schema = Joi.object({})
  try {
    const data = await schema.validateAsync(request.body)

    eventManager.emit('off-air', data)
    logger.data(data).debug('/off-air data emitted:')
    response.status(200).send({ status: 'success', data })
  } catch (error) {
    logger.data(error).error('Input validation failed for /off-air.')
    response.status(400).send({ status: 'fail', data: error })
  }
}
