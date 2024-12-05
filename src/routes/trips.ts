import { Hono } from 'hono'
import { RingLog } from '../interfaces'
import { DateTime } from 'luxon'
import sql from '../util/db'
import { PostgresError } from 'postgres'

const app = new Hono()

app.get('/', async (c) => {
  // TODO: error handling
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
  try {
    await sql`DELETE FROM ring_history WHERE trip_id = ${c.req.param('tripID')}`
    return c.json({ success: true }, 200)
  } catch (error) {
    const message = error instanceof PostgresError ? error.message : 'Unknown error'
    return c.json({ success: false, error: message }, 500)
  }
})

export const getRingData = async (tripID?: string) => {
  if (tripID) {
    return (await sql`SELECT * FROM ring_history WHERE trip_id = ${tripID} ORDER BY timestamp DESC`) as RingLog[]
  } else {
    return (await sql`SELECT * FROM ring_history ORDER BY timestamp DESC`) as RingLog[]
  }
}

export const formatRingData = (ringData: RingLog[], filterLive?: boolean) => {
  const ringTripIDs = [...new Set(ringData.map((log) => log.trip_id))]
  return ringTripIDs
    .map((tripID) => {
      const tripLogs = ringData.filter((log) => log.trip_id === tripID)
      const tripStart = DateTime.fromJSDate(new Date(tripLogs[tripLogs.length - 1].timestamp))
      const tripEnd = DateTime.fromJSDate(new Date(tripLogs[0].timestamp))
      const tripDuration = tripEnd.diff(tripStart, 'seconds').seconds
      const ringTime = findClosestStartTime(tripStart, tripLogs[0].color)
      return {
        tripID,
        departure: ringTime.toFormat('HH.mm'),
        duration: tripDuration,
        plate: tripLogs[0].plate,
        points: tripLogs,
        day: tripStart.weekday,
        live: filterLive ? tripEnd.diffNow('minutes').minutes > -3 : undefined,
      }
    })
    .filter((trip) => (filterLive ? !trip.live : true))
}

const findClosestStartTime = (tripStart: DateTime, ringColor: string) => {
  const closestNthMinute = (n: number) => Math.round(tripStart.minute / n) * n
  const isYellowRed = ringColor === '#ffff57' || ringColor === '#ff0000'
  const isPurple = ringColor === '#9600CD'
  const isBrown = ringColor === '#A64D00'
  const isGray = ringColor === '#808080' // Not sure about this one
  const departureTimeObject = { minute: 0, second: 0 }

  if (isYellowRed || isBrown) {
    departureTimeObject.minute = closestNthMinute(20)
  } else if (isPurple) {
    const purpleTimes = [10, 30, 50] // Purple ring departs every 40 minutes starting at 20.30
    // Find the closest departure time to the trip start minutes
    // It'd be better to check the hour as well
    const closestTime = purpleTimes.reduce((prev, curr) =>
      Math.abs(curr - tripStart.minute) < Math.abs(prev - tripStart.minute) ? curr : prev
    )
    departureTimeObject.minute = closestTime
  } else {
    // To be used for gray ring
    departureTimeObject.minute = closestNthMinute(30)
  }

  return tripStart.set(departureTimeObject)
}

export const countRingTimes = (ringTrips: { departure: string; day: number }[]) => {
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
