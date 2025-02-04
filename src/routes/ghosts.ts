import { Hono } from 'hono'
import { adjustPointDepartures, findMiddlePoint } from '../functions/ghosts'
import { groupPointsByDeparture, queryRelevantTrips } from '../functions/ghosts'

const app = new Hono()

app.get('/', async (c) => {
  // TODO: Implement caching and error handling
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
  return c.json(tripsWithMiddlePoints)
})

export default app
