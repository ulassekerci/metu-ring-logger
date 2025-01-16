import { Hono } from 'hono'
import { AvgTripPoint } from '../interfaces'
import { DateTime } from 'luxon'
import sql from '../util/db'
import { jwt } from 'hono/jwt'
import { countRingTimes, formatRingData, queryAllTrips } from '../functions/trips'
import { findAverageTrip } from '../functions/average'
import { getGhostLocations, getRelevantAverageTrips } from '../functions/ghost'
import { getRelevantDepartureTimes, ghostLocationsCache } from '../functions/ghost'
import { lastCrawl } from '../crawler'

const app = new Hono()
app.use('/update', jwt({ secret: process.env.JWT_SECRET }))

app.get('/', async (c) => {
  // Check the cache first
  const cache = ghostLocationsCache
  if (cache.timestamp && lastCrawl.timestamp && cache.timestamp > lastCrawl.timestamp) {
    return c.json(cache.data)
  }
  // If the cache is outdated, query and calculate the ghost points
  const departures = await getRelevantDepartureTimes()
  const averageTrips = await getRelevantAverageTrips(departures)
  const ghostPoints = await getGhostLocations(averageTrips)
  return c.json(ghostPoints)
})

app.post('/update', async (c) => {
  const ringData = await queryAllTrips()
  const ringTrips = formatRingData(ringData, true)
  const ringTimes = countRingTimes(ringTrips)
  const averageTrips: AvgTripPoint[] = []
  for (const departure of ringTimes) {
    const tripsDepartedAt = ringTrips.filter((trip) => trip.departure === departure.time)
    const averageTrip = findAverageTrip(tripsDepartedAt)
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
