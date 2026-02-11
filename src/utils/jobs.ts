import cron from 'node-cron'
import { cleanDB } from './cleaner'
import { runPoller } from '../poller/run'

export const scheduleJobs = () => {
  // poll every second
  cron.schedule('* * * * * *', runPoller)
  // clean db every night
  cron.schedule('0 5 * * *', cleanDB, { timezone: 'Europe/Istanbul' })
  // clean db at startup
  if (process.env.CLEAN_AT_STARTUP) cleanDB()
}
