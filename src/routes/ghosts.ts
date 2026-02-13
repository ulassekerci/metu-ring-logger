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
  const afterQuery = performance.now()

  const tripIDs = new Set<string>()
  rows.forEach((row) => tripIDs.add(row.trip_id))

  const trips = [...tripIDs].map((tripID) => {
    const tripRows = rows.filter((row) => row.trip_id === tripID)
    const tripPoints = tripRows.map((row) => RingPoint.fromDb(row))
    return new RingTrip(tripID, tripPoints)
  })

  const afterGrouping = performance.now()

  const usableTrips = trips.filter((trip) => !trip.isPartial)
  usableTrips.forEach((trip) => trip.estimateProgress())

  console.log(`
    Query took ${Math.round(afterQuery - before)} ms
    Grouping trips took ${Math.round(afterGrouping - afterQuery)} ms
    Progress estimation took ${Math.round(performance.now() - afterGrouping)} ms
    `)

  return usableTrips
}

export default app
