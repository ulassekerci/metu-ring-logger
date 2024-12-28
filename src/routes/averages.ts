import { Hono } from 'hono'
import { AvgTripPoint } from '../interfaces'
import { DateTime } from 'luxon'
import sql from '../util/db'
import { countRingTimes, formatRingData, queryAllTrips } from '../functions/trips'
import { findAverageTrip } from '../functions/average'
import { jwt } from 'hono/jwt'

const app = new Hono()
app.use('/update', jwt({ secret: process.env.JWT_SECRET }))

app.get('/', async (c) => {
  const now = DateTime.now().setZone('Europe/Istanbul')
  const fiveMinutesAgo = now.minus({ minutes: 5 })
  const fiveMinutesLater = now.plus({ minutes: 5 })
  const departures = await sql`
    SELECT DISTINCT departure FROM ring_avg
    WHERE time > ${fiveMinutesAgo.toFormat('HH:mm:ss')}
    AND time < ${fiveMinutesLater.toFormat('HH:mm:ss')}`

  if (departures.length === 0) return c.json({ message: 'No data available' }, 404)

  const averageTrips = await sql`
    SELECT * FROM ring_avg
    WHERE departure in ${sql(departures.map((row) => row.departure))}
    ORDER BY time ASC`

  return c.json(averageTrips)
})

app.post('/update', async (c) => {
  const ringData = await queryAllTrips()
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

export default app
