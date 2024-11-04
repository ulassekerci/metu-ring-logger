import { Hono } from 'hono'
import { RingLog } from './interfaces'
import { DateTime } from 'luxon'
import sql from './db'

const app = new Hono()

app.get('/', async (c) => {
  const ringTrips = await getRingData()
  return c.json(ringTrips)
})

app.get('/times', async (c) => {
  const ringTrips = await getRingData()
  const ringTimes = listRingTimes(ringTrips)
  return c.json(ringTimes)
})

const getRingData = async () => {
  const ringData = (await sql`SELECT * FROM ring_history ORDER BY timestamp DESC`) as RingLog[]
  const ringTripIDs = [...new Set(ringData.map((log) => log.trip_id))]

  const ringTrips = ringTripIDs.map((tripID) => {
    const tripLogs = ringData.filter((log) => log.trip_id === tripID)
    const tripStart = DateTime.fromJSDate(new Date(tripLogs[tripLogs.length - 1].timestamp))
    const tripEnd = DateTime.fromJSDate(new Date(tripLogs[0].timestamp))
    const tripDuration = tripEnd.diff(tripStart, 'seconds').seconds
    const ringTime = findClosestStartTime(tripStart)
    return {
      tripID,
      departure: ringTime.toFormat('HH:mm'),
      duration: tripDuration,
      plate: tripLogs[0].plate,
      points: tripLogs.length,
      // points: tripLogs.map((log) => ({
      //   timestamp: DateTime.fromJSDate(new Date(log.timestamp)).toFormat('dd/MM/yyyy HH:mm:ss'),
      //   address: log.address,
      //   color: log.color,
      //   state: log.state,
      // })),
    }
  })

  return ringTrips
}

const findClosestStartTime = (tripStart: DateTime) => {
  const closest20thMinute = Math.round(tripStart.minute / 20) * 20
  const closest30thMinute = Math.round(tripStart.minute / 30) * 30
  const isWeekendOrNight = tripStart.isWeekend || tripStart.hour < 6 || (tripStart.hour >= 20 && tripStart.minute >= 30)
  return tripStart.set({
    minute: isWeekendOrNight ? closest30thMinute : closest20thMinute,
    second: 0,
  })
}

const listRingTimes = (ringTrips: { departure: string }[]) => {
  const ringTimes: { time: string; trips: number }[] = []
  ringTrips.map((trip) => {
    const existingTime = ringTimes.find((time) => time.time === trip.departure)
    if (existingTime) existingTime.trips += 1
    else ringTimes.push({ time: trip.departure, trips: 1 })
  })
  return ringTimes.sort((a, b) => a.time.localeCompare(b.time))
}

export default app
