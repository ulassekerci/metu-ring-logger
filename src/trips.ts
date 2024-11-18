import { Hono } from 'hono'
import { RingLog } from './interfaces'
import { DateTime } from 'luxon'
import sql from './db'
import { PostgresError } from 'postgres'
import { lastCrawl } from './crawler'

const app = new Hono()

app.get('/', async (c) => {
  const ringData = await getRingData()
  const ringTrips = formatRingData(ringData)
  return c.json(ringTrips)
})

app.get('/times', async (c) => {
  const ringData = await getRingData()
  const ringTrips = formatRingData(ringData)
  const ringTimes = countRingTimes(ringTrips)
  return c.json(ringTimes)
})

app.get('/:tripID', async (c) => {
  const ringData = await getRingData(c.req.param('tripID'))
  const ringTrip = formatRingData(ringData)
  if (!ringTrip.length) return c.json({ error: 'Trip not found' }, 404)
  return c.json(ringTrip[0])
})

app.delete('/:tripID', async (c) => {
  const tripID = c.req.param('tripID')
  try {
    await sql`DELETE FROM ring_history WHERE trip_id = ${tripID}`
    return c.json({ success: true }, 200)
  } catch (error) {
    const message = error instanceof PostgresError ? error.message : 'Unknown error'
    return c.json({ success: false, error: message }, 500)
  }
})

const getRingData = async (tripID?: string) => {
  if (tripID) {
    return (await sql`SELECT * FROM ring_history WHERE trip_id = ${tripID} ORDER BY timestamp DESC`) as RingLog[]
  } else {
    return (await sql`SELECT * FROM ring_history ORDER BY timestamp DESC`) as RingLog[]
  }
}

const formatRingData = (ringData: RingLog[]) => {
  const ringTripIDs = [...new Set(ringData.map((log) => log.trip_id))]
  return ringTripIDs
    .map((tripID) => {
      const tripLogs = ringData.filter((log) => log.trip_id === tripID)
      const tripStart = DateTime.fromJSDate(new Date(tripLogs[tripLogs.length - 1].timestamp))
      const tripEnd = DateTime.fromJSDate(new Date(tripLogs[0].timestamp))
      const tripDuration = tripEnd.diff(tripStart, 'seconds').seconds
      const ringTime = findClosestStartTime(tripStart)
      return {
        tripID,
        departure: ringTime.toFormat('HH.mm'),
        duration: tripDuration,
        plate: tripLogs[0].plate,
        points: tripLogs,
        day: tripStart.weekday,
      }
    })
    .filter((trip) => !lastCrawl.vehicles.some((vehicle) => vehicle.plate === trip.plate))
}

const findClosestStartTime = (tripStart: DateTime) => {
  const closest20thMinute = Math.round(tripStart.minute / 20) * 20
  const closest30thMinute = Math.round(tripStart.minute / 30) * 30
  const isWeekend = tripStart.isWeekend
  const isNight = tripStart.hour < 6 || tripStart.hour > 20 || (tripStart.hour === 20 && tripStart.minute > 5)
  return tripStart.set({
    minute: isWeekend || isNight ? closest30thMinute : closest20thMinute,
    second: 0,
  })
}

const countRingTimes = (ringTrips: { departure: string; day: number }[]) => {
  const ringTimes: { time: string; trips: number; days: string }[] = []
  ringTrips.map((trip) => {
    const existingTime = ringTimes.find((time) => time.time === trip.departure)
    if (existingTime) {
      existingTime.trips += 1
      existingTime.days += ', ' + trip.day
    } else ringTimes.push({ time: trip.departure, trips: 1, days: String(trip.day) })
  })
  return ringTimes.sort((a, b) => a.time.localeCompare(b.time))
}

export default app
