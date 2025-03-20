import { Hono } from 'hono'
import { adjustPointDepartures, findMiddlePoint } from '../functions/ghosts'
import { groupPointsByDeparture, queryRelevantTrips } from '../functions/ghosts'
import { RingLogWithDeparture } from '../interfaces/ring'
import { DateTime } from 'luxon'

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
  // Group trip points by their departure times
  const groupedTrips = groupPointsByDeparture(adjustedTrips)
  // Find middle points of trips
  const tripsWithMiddlePoints = await Promise.all(
    groupedTrips.map(async (group) => {
      if (group.trips.length > 1) {
        const middlePoint = await findMiddlePoint(group.trips)
        return { ...group, middlePoint }
      } else {
        return { ...group, middlePoint: group.trips[0] }
      }
    })
  )
  // Update cache
  ghostCache.data = tripsWithMiddlePoints
  ghostCache.cacheTime = DateTime.now()
  return c.json(tripsWithMiddlePoints)
})

export default app
