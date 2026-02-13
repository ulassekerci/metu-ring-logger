import { Request, Response, Router } from 'express'
import sql from '../utils/db'
import { RingRow } from '../interfaces/ring'
import { RingTrip } from '../entities/Trip'
import { ServiceTime } from '../entities/ServiceTime'
import { RingPoint } from '../entities/Point'

const app = Router()

app.get('/', async (req: Request, res: Response) => {
  const trips = await getRelevantTrips()
  return res.json(trips)
})

const getRelevantTrips = async () => {
  const serviceTime = ServiceTime.now()
  const serviceSeconds = serviceTime.seconds
  const isWeekend = serviceTime.isWeekend

  const before = performance.now()
  const rows = await sql<RingRow[]>`
    SELECT *
    FROM ring_history
    WHERE trip_id IN (
      SELECT trip_id
      FROM ring_history
      WHERE service_time
        BETWEEN ${serviceSeconds} - 60
        AND ${serviceSeconds} + 60
      AND color ${isWeekend ? sql`=` : sql`!=`} '#737373'
      AND "timestamp" < (
        SELECT (value #>> '{}')::timestamptz
        FROM stats
        WHERE key = 'last_cleanup'
      )
    )
    ORDER BY "timestamp" DESC;
  `
  const after = performance.now()

  const tripIDs = new Set<string>()
  rows.forEach((row) => tripIDs.add(row.trip_id))

  const beforeGrouping = performance.now()

  const trips = [...tripIDs].map((tripID) => {
    const tripRows = rows.filter((row) => row.trip_id === tripID)
    const tripPoints = tripRows.map((row) => RingPoint.fromDb(row))
    return new RingTrip(tripID, tripPoints)
  })

  console.log(`
    Query took ${Math.round(after - before)} ms
    Getting tripIDs in a set took ${beforeGrouping - after} ms
    Grouping trips took ${performance.now() - beforeGrouping} ms
    `)

  const usableTrips = trips.filter((trip) => !trip.isPartial)
  usableTrips.forEach((trip) => trip.estimateProgress())
  return usableTrips
}

export default app
