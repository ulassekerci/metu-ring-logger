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

app.get('/', async (c) => {
  // TODO: Implement error handling and clean up
  if (ghostCache.data && ghostCache.cacheTime > DateTime.now().minus({ seconds: 1 })) {
    return c.json(ghostCache.data)
  }
  const trips = await queryRelevantTrips()
  const adjustedTrips = adjustPointDepartures(trips)
  // TODO: Filter out departure times with live bus data
  const groupedTrips = groupPointsByDeparture(adjustedTrips)
  const middlePoints = await Promise.all(
    groupedTrips.filter((group) => group.trips.length > 1).map((group) => findMiddlePoint(group.trips))
  )
  const tripsWithMiddlePoints = groupedTrips.map((trip) => {
    const middlePoint = middlePoints.find((mp) => mp.departure === trip.departure) || trip.trips[0]
    return { ...trip, middlePoint }
  })
  ghostCache.data = tripsWithMiddlePoints
  ghostCache.cacheTime = DateTime.now()
  return c.json(tripsWithMiddlePoints)
})

export default app
