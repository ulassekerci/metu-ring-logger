import express from 'express'
import type { Request, Response } from 'express'
import cors from 'cors'
import { Settings } from 'luxon'
import { shouldPoll } from './poller/should'
import { poll } from './poller'

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
Settings.defaultZone = 'Europe/Istanbul'

app.get('/', (req: Request, res: Response) => {
  res.send('Hello')
})

app.listen(port, () => {
  console.log(`Running at port ${port}`)
})

setInterval(() => {
  if (shouldPoll()) poll()
}, 1000)
