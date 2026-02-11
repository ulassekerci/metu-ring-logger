import express from 'express'
import cors from 'cors'
import { Settings } from 'luxon'
import { routes } from './routes'
import { errorHandler } from './utils/err'
import { scheduleJobs } from './utils/jobs'

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
Settings.defaultZone = 'Europe/Istanbul'

app.use('/', routes.live)
app.use('/ghosts', routes.ghosts)
app.use('/schedule', routes.schedule)
app.use(errorHandler)

scheduleJobs()

app.listen(port, () => {
  console.log(`Running at port ${port}`)
})
