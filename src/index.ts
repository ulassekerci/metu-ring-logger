import express from 'express'
import type { Request, Response } from 'express'
import cors from 'cors'
import { Settings } from 'luxon'
import { shouldPoll } from './poller/should'
import { lastPoll, poll } from './poller'
import { routes } from './routes'
import { errorHandler } from './utils/err'

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
Settings.defaultZone = 'Europe/Istanbul'

app.get('/', (req: Request, res: Response) => {
  res.json(lastPoll)
})

process.env.ENABLE_MOCK && app.use('/mock', routes.mock)

app.listen(port, () => {
  console.log(`Running at port ${port}`)
})

setInterval(() => {
  if (shouldPoll()) poll()
}, 1000)
