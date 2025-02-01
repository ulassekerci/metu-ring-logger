import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import { adjustPointDepartures, findMiddlePoint } from '../functions/betterAverage'
import { groupPointsByDeparture, queryRelevantTrips } from '../functions/betterAverage'

const app = new Hono()
app.use('/update', jwt({ secret: process.env.JWT_SECRET }))

app.get('/', async (c) => {
  const trips = await queryRelevantTrips()
  const adjustedTrips = adjustPointDepartures(trips)
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
