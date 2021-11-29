import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import Joi from 'joi'
import { logger } from '../lib/utilities/logger'
import { eventManager } from '../event-manager'

const schema = Joi.object({
  action: Joi.string().required(),
  endTime: Joi.string().required()
})

const app = express()
app.use(bodyParser.json())

app.post('/on-air',  async (req: Request, res: Response) => {
  try {
    const value = await schema.validateAsync(req.body)
    logger.debug(value)

    eventManager.emit('on-air', null)
    res.status(200).send()
  } catch (e) {
    res.status(500).send(e)
  }
})

app.post('/off-air',  async (req: Request, res: Response) => {
  try {
    eventManager.emit('off-air', null)
    logger.debug(req)
    res.status(200).send()
  } catch (e) {
    res.status(500).send(e)
  }
})

app.listen(3000)