import { Hono } from 'hono'
import { adjustPointDepartures, findMiddlePoint, removeGhostsWithLiveData } from '../functions/ghosts'
import { groupPointsByDeparture, queryRelevantTrips } from '../functions/ghosts'
import { RingLogWithDeparture } from '../interfaces/ring'
import { DateTime } from 'luxon'
import { lastCrawl } from '../crawler'

const app = new Hono()

interface ghostData {
  middlePoint: RingLogWithDeparture
  departure: string
  trips: RingLogWithDeparture[]
}

const ghostCache = {
  data: null as ghostData[] | null,
  cacheTime: DateTime.fromMillis(4),
}

// TODO: Clean up and implement error handling
app.get('/', async (c) => {
  if (ghostCache.data && ghostCache.cacheTime > DateTime.now().minus({ seconds: 1 })) {
    return c.json(ghostCache.data)
  }
  // Get previous trip points then find their departures
  const trips = await queryRelevantTrips()
  const adjustedTrips = adjustPointDepartures(trips)
  // Filter out ghosts when there is live data
  const filteredTrips = removeGhostsWithLiveData(adjustedTrips, lastCrawl.vehicles)
  // Group trip points by their departure times
  const groupedTrips = groupPointsByDeparture(filteredTrips)
  // Find which point is in the middle
  const middlePoints = await Promise.all(
    groupedTrips.filter((group) => group.trips.length > 1).map((group) => findMiddlePoint(group.trips))
  )
  const tripsWithMiddlePoints = groupedTrips.map((trip) => {
    const middlePoint = middlePoints.find((mp) => mp.departure === trip.departure) || trip.trips[0]
    return { ...trip, middlePoint }
  })
  // Update cache
  ghostCache.data = tripsWithMiddlePoints
  ghostCache.cacheTime = DateTime.now()
  return c.json(tripsWithMiddlePoints)
})

export default app
