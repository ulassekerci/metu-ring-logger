import { Hono } from 'hono'
import { countRingTimes, formatRingData, getRingData } from './trips'
import { AvgTripPoint, FormattedTrip } from '../interfaces'
import { DateTime } from 'luxon'
import sql from '../util/db'

const app = new Hono()

app.get('/', async (c) => {
  const now = DateTime.now().setZone('Europe/Istanbul')
  const fiveMinutesAgo = now.minus({ minutes: 5 })
  const fiveMinutesLater = now.plus({ minutes: 5 })
  const departures = await sql`
    SELECT DISTINCT departure FROM ring_avg
    WHERE time > ${fiveMinutesAgo.toFormat('HH:mm:ss')}
    AND time < ${fiveMinutesLater.toFormat('HH:mm:ss')}`

  if (departures.length === 0) return c.json({ error: 'No data available' }, 404)

  const averageTrips = await sql`
    SELECT * FROM ring_avg
    WHERE departure in ${sql(departures.map((row) => row.departure))}
    ORDER BY time ASC`

  return c.json(averageTrips)
})

app.get('/:departure', async (c) => {
  const departure = c.req.param('departure')
  const averageTrip = await sql`
    SELECT * FROM ring_avg
    WHERE departure = ${departure.replace('.', ':') + ':00'}
    ORDER BY time ASC`
  return c.json(averageTrip)
})

app.post('/', async (c) => {
  const ringData = await getRingData()
  const ringTrips = formatRingData(ringData, true)
  const ringTimes = countRingTimes(ringTrips)
  const averageTrips: AvgTripPoint[] = []
  for (const departure of ringTimes) {
    const averageTrip = findAverageTrip(ringTrips, departure.time)
    averageTrip.points.forEach((point) => {
      averageTrips.push({
        color: point.color,
        lat: point.lat,
        lng: point.lng,
        address: point.address,
        time: DateTime.fromJSDate(new Date(point.timestamp)).toFormat('HH:mm:ss'),
        departure: departure.time.replace('.', ':'),
      })
    })
  }
  await sql`TRUNCATE TABLE ring_avg RESTART IDENTITY`
  await sql`INSERT INTO ring_avg ${sql(averageTrips)}`
  return c.json({ message: 'Average trips saved' })
})

const findAverageTrip = (trips: FormattedTrip[], departure: string) => {
  const departureTrips = trips
    .filter((trip) => trip.departure === departure)
    .map((trip) => {
      const departureTime = DateTime.fromFormat(trip.departure, 'HH.mm')
      const tripEndPoint = trip.points.filter(
        (point) =>
          point.address === 'ODTU A1 Kapisi' ||
          point.address === 'ODTU A2 Kapisi' ||
          point.address === 'Garajlar' ||
          point.address === 'BOTE-MYO'
      )
      const tripEnd = DateTime.fromJSDate(new Date(tripEndPoint.reverse()[0].timestamp))
      return { ...trip, durationFromDeparture: tripEnd.diff(departureTime, 'seconds').seconds }
    })

  const sortedTrips = departureTrips.sort((a, b) => a.durationFromDeparture - b.durationFromDeparture)
  const medianIndex = Math.floor(sortedTrips.length / 2)
  return sortedTrips[medianIndex]
}

app.post('/', async (c) => {})

export default app
