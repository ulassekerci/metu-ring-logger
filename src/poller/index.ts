import axios from 'axios'
import { DateTime } from 'luxon'
import type { MetuData } from '../interfaces/ring'
import { RingPoint } from '../entities/Point'
import sql from '../utils/db'
import { booleanEqual, distance } from '@turf/turf'
import { RingTrip } from '../entities/Trip'
import { getLastTrip } from './lastTrip'
import { liveData } from './store'

export let lastPoll = DateTime.fromMillis(0)

export const poll = async () => {
  const ringReq = await axios.get<MetuData[] | string>('https://ring.metu.edu.tr/ring.json')
  const ringRes = ringReq.data

  // API returns empty page if there is no data
  if (typeof ringRes === 'string') {
    lastPoll = DateTime.now()
    return
  }

  // Get point objects from data then discard unnecessary ones
  const allPoints = ringRes.map((data) => RingPoint.fromApi(data))
  const updatedPoints = allPoints.filter(isPointUseful)

  await Promise.all(
    updatedPoints.map(async (point) => {
      const lastTrip = await getLastTrip(point.plate)
      const isNewTrip = detectNewTrip(point, lastTrip)
      const trip = isNewTrip ? RingTrip.new(point) : RingTrip.fromLast(lastTrip!, point)
      // update store
      liveData.update(trip)
      // Log to DB
      if (process.env.DISABLE_LOGGING) return
      await sql`INSERT INTO ring_history ${sql(trip.lastPoint.toDB(trip.id))}`
    }),
  )

  lastPoll = DateTime.now()
}

const detectNewTrip = (newPoint: RingPoint, trip: RingTrip | null) => {
  if (!trip) return true

  // new trip if color changes
  const isDifferentLine = !trip.line.colors.includes(newPoint.color)
  if (isDifferentLine) return true

  // new trip if no data was received for 6 minutes
  const oldPoint = trip.lastPoint
  const oldPointAge = newPoint.serviceTime.diff(oldPoint.serviceTime)
  if (oldPointAge.as('minutes') > 6) return true

  // new trip when new point is farther than 100m from departure
  const departurePoint = trip.line.departureStop.turfPoint
  const lastPointDistance = distance(departurePoint, oldPoint.turfPoint, { units: 'meters' })
  const newPointDistance = distance(departurePoint, newPoint.turfPoint, { units: 'meters' })
  if (lastPointDistance <= 100 && newPointDistance > 100) return true

  return false
}

const isPointUseful = (newPoint: RingPoint) => {
  // if it's just appeared
  const prevTrip = liveData.findByPlate(newPoint.plate)
  if (!prevTrip) return true
  // if the vehicle has moved
  const prevPoint = prevTrip.lastPoint
  const isEqual = booleanEqual(prevPoint.turfPoint, newPoint.turfPoint)
  if (!isEqual) return true
  // if it's been 30secs after last record
  const timeDiff = newPoint.serviceTime.diff(prevPoint.serviceTime)
  if (timeDiff.as('seconds') > 30) return true
  return false
}
