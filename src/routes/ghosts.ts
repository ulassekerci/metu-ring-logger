import { Request, Response, Router } from 'express'
import { DateTime } from 'luxon'
import sql from '../utils/db'
import { RingRow } from '../interfaces/ring'
import { RingTrip } from '../entities/Trip'
import { ServiceTime } from '../entities/ServiceTime'
import { RingPoint } from '../entities/Point'
import * as turf from '@turf/turf'

const app = Router()
type Ghost = { departure: string; trips: { id: string; point: RingPoint }[] }

app.get('/', async (req: Request, res: Response) => {
  // TODO: cache
  // TODO: create a proper object structure
  const ghosts: Ghost[] = []
  const trips = await getRelevantTrips()
  const grouped = groupTrips(trips)
  grouped.forEach((group) => {
    ghosts.push({
      departure: group.departure,
      trips: group.trips.map((trip) => ({
        id: trip.id,
        point: trip.getClosestPointToNow(),
        departure: trip.departureTime,
      })),
    })
  })
  return res.json(ghosts.map(findAverageGhost))
})

const getRelevantTrips = async () => {
  // shift by 3 hours to include 00.30 trips into previous day
  const isWeekend = DateTime.now().minus({ hours: 3 }).isWeekend
  // calculate service time (seconds after 06.00)
  const serviceSeconds = ServiceTime.now().seconds
  // Query trips that has at least one point within 120 seconds from current time
  const rows = await sql<RingRow[]>`
    SELECT *
    FROM ring_history
    WHERE trip_id IN (
      SELECT trip_id
      FROM ring_history
      WHERE service_time BETWEEN ${serviceSeconds} - 60 AND ${serviceSeconds} + 60
      AND color ${isWeekend ? sql`=` : sql`!=`} '#737373'
      AND "timestamp" < NOW() - INTERVAL '24 hours'
    )
    ORDER BY "timestamp" DESC;
  `
  const tripIDs = [...new Set(rows.map((row) => row.trip_id))]
  return tripIDs.map((tripID) => {
    const tripRows = rows.filter((row) => row.trip_id === tripID)
    return new RingTrip(tripID, tripRows)
  })
}

const groupTrips = (trips: RingTrip[]) => {
  const map = new Map<string, RingTrip[]>()
  trips.forEach((trip) => {
    const key = trip.departureTime
    if (!map.has(key)) {
      map.set(key, [])
    }
    map.get(key)!.push(trip)
  })
  return Array.from(map.entries()).map(([departure, trips]) => ({ departure, trips }))
}

const findAverageGhost = (ghost: Ghost) => {
  const points = ghost.trips.map((trip) => trip.point.turfPoint)
  const pointCollection = turf.featureCollection(points)
  const centroid = turf.centroid(pointCollection)
  const closestToCentroid = ghost.trips.reduce((prev, curr) => {
    const prevDistance = turf.distance(prev.point.turfPoint, centroid, { units: 'meters' })
    const currDistance = turf.distance(curr.point.turfPoint, centroid, { units: 'meters' })
    return currDistance < prevDistance ? curr : prev
  })
  return { ...ghost, average: closestToCentroid }
}

export default app
