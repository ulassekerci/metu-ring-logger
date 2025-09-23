import express from 'express'
import cors from 'cors'
import { Settings } from 'luxon'
import { poll } from './poller'
import { routes } from './routes'
import { errorHandler } from './utils/err'

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
Settings.defaultZone = 'Europe/Istanbul'

app.use('/', routes.live)
app.use('/ghosts', routes.ghosts)
app.use('/schedule', routes.schedule)

process.env.ENABLE_MOCK && app.use('/mock', routes.mock)

app.use(errorHandler)

app.listen(port, () => {
  console.log(`Running at port ${port}`)
})

setInterval(() => {
  if (!process.env.DISABLE_POLLING) poll()
}, 1000)
