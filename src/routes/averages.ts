import { Hono } from 'hono'
import { AvgTripPoint, RingLog } from '../interfaces/ring'
import { DateTime } from 'luxon'
import sql from '../util/db'
import { jwt } from 'hono/jwt'
import { countRingTimes, formatRingData, queryAllTrips } from '../functions/trips'
import { findAverageTrip } from '../functions/average'
import { getGhostLocations, getRelevantAverageTrips } from '../functions/ghost'
import { getRelevantDepartureTimes, ghostLocationsCache } from '../functions/ghost'
import { lastCrawl } from '../crawler'
import { adjustPointDepartures, findMiddlePoint } from '../functions/betterAverage'
import { groupPointsByDeparture, queryRelevantTrips } from '../functions/betterAverage'

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

app.get('/test', async (c) => {
  const beforeQuery = performance.now()
  const trips = await queryRelevantTrips()
  const afterQuery = performance.now()
  const adjustedTrips = adjustPointDepartures(trips)
  const groupedTrips = groupPointsByDeparture(adjustedTrips)
  const middlePoints = await Promise.all(groupedTrips.map((group) => findMiddlePoint(group.trips)))
  const afterOSRM = performance.now()
  const tripsWithMiddlePoints = groupedTrips.map((trip) => {
    const middlePoint = middlePoints.find((mp) => mp.departure === trip.departure)
    return { ...trip, middlePoint }
  })
  console.log(`Querying took ${afterQuery - beforeQuery}ms`)
  console.log(`OSRM took ${afterOSRM - afterQuery}ms`)
  return c.json(tripsWithMiddlePoints)
})

// TODO: Clean up after testing and make time not hardcoded
app.get('/:departure', async (c) => {
  const depParam = c.req.param('departure')
  const reqDeparture = DateTime.fromFormat(depParam, 'HH:mm:ss')
  const dep10MinAgo = reqDeparture.minus({ minutes: 10 }).toFormat('HH:mm:ss')
  const dep10MinLater = reqDeparture.plus({ minutes: 10 }).toFormat('HH:mm:ss')
  const trips = await sql<RingLog[]>`
    WITH trip_start_times AS (
      SELECT trip_id, MIN(timestamp) AS departure_time
      FROM ring_history
      GROUP BY trip_id
    )
    SELECT rh.* FROM ring_history rh
    JOIN trip_start_times tst ON rh.trip_id = tst.trip_id
    WHERE tst.departure_time < '2025-01-13 03:00:00'
    AND tst.departure_time::time BETWEEN ${dep10MinAgo} AND ${dep10MinLater}
    AND ABS(EXTRACT(EPOCH FROM (timestamp::time - NOW()::time))) <= 30;`
  return c.json(trips)
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
