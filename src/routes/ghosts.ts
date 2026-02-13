import { Request, Response, Router } from 'express'
import sql from '../utils/db'
import { RingRow } from '../interfaces/ring'
import { RingTrip } from '../entities/Trip'
import { ServiceTime } from '../entities/ServiceTime'
import { RingPoint } from '../entities/Point'
import { DateTime } from 'luxon'

const app = Router()

const cache = {
  data: [] as RingTrip[],
  timestamp: DateTime.fromMillis(0),
  checkCache: () => {
    const now = DateTime.now()
    const lastCache = cache.timestamp
    if (now.diff(lastCache).as('seconds') > 1) return false
    return true
  },
  updateCache: (trips: RingTrip[]) => {
    cache.data = trips
    cache.timestamp = DateTime.now()
  },
}

app.get('/', async (req: Request, res: Response) => {
  const isCacheFresh = cache.checkCache()
  if (isCacheFresh) return res.json(cache.data)

  const trips = await getRelevantTrips()
  cache.updateCache(trips)
  return res.json(trips)
})

const getRelevantTrips = async () => {
  const serviceTime = ServiceTime.now()
  const serviceSeconds = serviceTime.seconds
  const isWeekend = serviceTime.isWeekend

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

  const tripIDs = new Set<string>()
  rows.forEach((row) => tripIDs.add(row.trip_id))

  const trips = [...tripIDs].map((tripID) => {
    const tripRows = rows.filter((row) => row.trip_id === tripID)
    const tripPoints = tripRows.map((row) => RingPoint.fromDb(row))
    return new RingTrip(tripID, tripPoints)
  })

  const usableTrips = trips.filter((trip) => !trip.isPartial)
  usableTrips.forEach((trip) => trip.estimateProgress())

  return usableTrips
}

export default app
