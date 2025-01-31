import { DateTime } from 'luxon'
import sql from '../util/db'
import { AvgTripPoint, DepartureTime } from '../interfaces/ring'
import { lastCrawl } from '../crawler'

export const ghostLocationsCache = {
  data: [] as AvgTripPoint[],
  timestamp: null as DateTime | null,
}

export const getRelevantDepartureTimes: () => Promise<DepartureTime[]> = async () => {
  // Get the departure times of the ring buses that was active
  // some other day at the same time (in the range of 5 minutes)
  const now = DateTime.now().setZone('Europe/Istanbul')
  const fiveMinutesAgo = now.minus({ minutes: 5 })
  const fiveMinutesLater = now.plus({ minutes: 5 })
  return await sql`
    SELECT DISTINCT departure FROM ring_avg
    WHERE time > ${fiveMinutesAgo.toFormat('HH:mm:ss')}
    AND time < ${fiveMinutesLater.toFormat('HH:mm:ss')}`
}

export const getRelevantAverageTrips = async (departures: DepartureTime[]) => {
  return await sql<AvgTripPoint[]>`
      SELECT * FROM ring_avg
      WHERE departure in ${sql(departures.map((row) => row.departure))}
      ORDER BY time ASC`
}

export const getGhostLocations = async (avgPoints: AvgTripPoint[], filterLive = true) => {
  const ghostPoints: AvgTripPoint[] = []
  const ghostDepartures = new Set(avgPoints.map((point) => point.departure))
  ghostDepartures.forEach((departure) => {
    // Return if there is a live bus with the same departure time
    const liveBus = lastCrawl.vehicles.find((bus) => bus.departure === departure)
    if (liveBus && filterLive) return
    // Get the points of the ghost bus
    const points = avgPoints.filter((point) => point.departure === departure)
    // find closest point in time to now
    const closestPoint = points.reduce((prev, current) => {
      const prevTime = DateTime.fromISO(prev.time, { zone: 'Europe/Istanbul' })
      const currentTime = DateTime.fromISO(current.time, { zone: 'Europe/Istanbul' })
      const prevDiff = Math.abs(prevTime.diffNow('seconds').seconds)
      const currentDiff = Math.abs(currentTime.diffNow('seconds').seconds)
      return prevDiff < currentDiff ? prev : current
    })
    ghostPoints.push(closestPoint)
  })
  ghostLocationsCache.data = ghostPoints
  ghostLocationsCache.timestamp = DateTime.now()
  return ghostPoints
}
