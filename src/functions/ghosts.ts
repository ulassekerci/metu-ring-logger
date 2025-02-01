import { DateTime } from 'luxon'
import { schedule } from '../data/schedule'
import { MiddlePoint, RingLogWithDeparture } from '../interfaces/ring'
import sql from '../util/db'
import { osrm } from '../util/osrm'

// Get all trips that are within 30 seconds of the current time
export const queryRelevantTrips = async () => {
  return await sql<RingLogWithDeparture[]>`
  WITH trip_start_times AS (SELECT trip_id, MIN(timestamp) AS departure FROM ring_history GROUP BY trip_id),
  config AS (SELECT value::timestamptz AS cutoff FROM config WHERE key = 'data_cutoff')
  SELECT DISTINCT ON (rh.trip_id) rh.*, tst.departure::time
  FROM ring_history rh JOIN trip_start_times tst ON rh.trip_id = tst.trip_id
  CROSS JOIN config cfg
  WHERE tst.departure < cfg.cutoff
  AND ABS(EXTRACT(EPOCH FROM (rh.timestamp::time - NOW()::time))) <= 30
  ORDER BY rh.trip_id, ABS(EXTRACT(EPOCH FROM (rh.timestamp - NOW()))) ASC;`
}

// Round the trip departure to the nearest scheduled departure time
// TODO: make it readable
export const adjustPointDepartures = (ringTrips: RingLogWithDeparture[]) => {
  return ringTrips.map((trip) => {
    const tripDeparture = DateTime.fromFormat(trip.departure, 'HH:mm:ss')
    const scheduledDepartures = schedule.filter(
      (sch) => sch.color === trip.color.toUpperCase() || (trip.color === '#ff0000' && sch.color === '#FFFF57')
    )
    // find the closest scheduled time to the trip departure
    const closestScheduledTime = scheduledDepartures.reduce((prev, curr) => {
      const getTimeDiff = (time: string) => {
        const scheduledTime = DateTime.fromFormat(time, 'HH:mm:ss')
        const timeDiff = scheduledTime.diff(tripDeparture).as('seconds')
        return Math.abs(timeDiff)
      }
      return getTimeDiff(curr.time) < getTimeDiff(prev.time) ? curr : prev
    })
    return { ...trip, departure: closestScheduledTime.time }
  })
}

export const groupPointsByDeparture = (ringTrips: RingLogWithDeparture[]) => {
  const groupedTrips: { departure: string; trips: RingLogWithDeparture[] }[] = []
  const departureTimes = new Set(ringTrips.map((trip) => trip.departure))
  departureTimes.forEach((departure) => {
    const trips = ringTrips.filter((trip) => trip.departure === departure)
    groupedTrips.push({ departure, trips })
  })
  return groupedTrips
}

export const findMiddlePoint: (points: RingLogWithDeparture[]) => Promise<MiddlePoint> = async (points) => {
  const table = await osrm.getTable(points)
  // Find the point with the smallest sum of distances to all other points
  const sumDistances = table.distances.map((distances) => distances.reduce((a, b) => a + b))
  const minDistanceIndex = sumDistances.indexOf(Math.min(...sumDistances))
  const maxDistanceOfMin = Math.max(...table.distances[minDistanceIndex])
  return { ...points[minDistanceIndex], maxDistance: maxDistanceOfMin }
}
