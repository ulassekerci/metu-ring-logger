import { DateTime } from 'luxon'
import { MiddlePoint, RingLogWithDeparture } from '../interfaces/ring'
import sql from '../util/db'
import { osrm } from '../util/osrm'
import { predictDeparture } from './schedule'

// Get all trips that are within 30 seconds of the current time
export const queryRelevantTrips = async () => {
  const isWeekend = DateTime.now().setZone('Europe/Istanbul').minus({ hours: 3 }).isWeekend

  return await sql<RingLogWithDeparture[]>`
  WITH trip_start_times AS (SELECT trip_id, MIN(timestamp) AS departure FROM ring_history GROUP BY trip_id),
  config AS (SELECT value::timestamptz AS cutoff FROM config WHERE key = 'data_cutoff')
  SELECT DISTINCT ON (rh.trip_id) rh.*, tst.departure::time
  FROM ring_history rh JOIN trip_start_times tst ON rh.trip_id = tst.trip_id
  CROSS JOIN config cfg
  WHERE tst.departure < cfg.cutoff
  AND rh.color ${isWeekend ? sql`=` : sql`!=`} '#737373'
  AND ABS(EXTRACT(EPOCH FROM (rh.timestamp::time - NOW()::time))) <= 30
  ORDER BY rh.trip_id, ABS(EXTRACT(EPOCH FROM (rh.timestamp - NOW()))) ASC;`
}

// Update trip departure to scheduled departure
export const adjustPointDepartures = (ringTrips: RingLogWithDeparture[]) => {
  return ringTrips.map((trip) => {
    const tripDeparture = DateTime.fromFormat(trip.departure, 'HH:mm:ss')
    const scheduledDeparture = predictDeparture(tripDeparture, trip.color).toFormat('HH.mm')
    return { ...trip, departure: scheduledDeparture }
  })
}

export const groupPointsByDeparture = (ringTrips: RingLogWithDeparture[]) => {
  const groupedTrips: { departure: string; color: string; trips: RingLogWithDeparture[] }[] = []
  const departureTimes = new Set(ringTrips.map((trip) => trip.departure))
  departureTimes.forEach((departure) => {
    const trips = ringTrips.filter((trip) => trip.departure === departure)
    const colors = new Set(trips.map((trip) => trip.color))
    colors.forEach((color) => {
      const filteredTrips = trips.filter((trip) => trip.color === color)
      groupedTrips.push({ departure, color, trips: filteredTrips })
    })
  })
  return groupedTrips
}

export const findMiddlePoint: (points: RingLogWithDeparture[]) => Promise<MiddlePoint> = async (points) => {
  const table = await osrm.getTable(points)
  // Find the point with the smallest sum of distances to all other points
  // TODO: make it choose one when there are only two points
  const sumDistances = table.distances.map((distances) => distances.reduce((a, b) => a + b))
  const minDistanceIndex = sumDistances.indexOf(Math.min(...sumDistances))
  const maxDistanceOfMin = Math.max(...table.distances[minDistanceIndex])
  return { ...points[minDistanceIndex], maxDistance: maxDistanceOfMin }
}
