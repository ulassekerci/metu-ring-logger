import axios from 'axios'
import { DateTime } from 'luxon'
import type { MetuData, RingRow } from '../interfaces/ring'
import { RingPoint } from '../entities/Point'
import sql from '../utils/db'
import { distance } from '@turf/turf'
import { generateID } from '../utils/id'
import * as turf from '@turf/turf'
import { garagePolygon } from '../data/garage'
import { RingTrip } from '../entities/Trip'
import { Vehicle } from '../entities/Vehicle'
import { ServiceTime } from '../entities/ServiceTime'

export const lastPoll = {
  data: [] as Vehicle[],
  timestamp: DateTime.fromMillis(0),
}

export const poll = async () => {
  const ringReq = await axios.get<MetuData[] | string>('https://ring.metu.edu.tr/ring.json')
  const ringData = ringReq.data

  // API returns empty page if there is no data
  if (typeof ringData === 'string') {
    lastPoll.data = []
    lastPoll.timestamp = DateTime.now()
    return
  }

  // Get point objects from data
  const allPoints = ringData.map((data) => RingPoint.fromApi(data))
  const newPoints = allPoints.filter((point) => point.detectMovement(lastPoll.data))

  await Promise.all(
    newPoints.map(async (newPoint) => {
      // return if vehicle is parked
      const isParked = turf.booleanPointInPolygon(newPoint.turfPoint, garagePolygon)
      if (isParked) return

      // get last trip from db
      const lastTripRows = await sql<RingRow[]>`
      SELECT * FROM ring_history
      WHERE trip_id = (
        SELECT trip_id from ring_history
        WHERE plate = ${newPoint.plate}
        ORDER BY "timestamp" DESC
        LIMIT 1
      )
      ORDER BY "timestamp" DESC
    `

      const lastTrip = new RingTrip(lastTripRows[0].trip_id, lastTripRows)
      const isNewTrip = detectNewTrip(newPoint, lastTrip)
      const tripID = isNewTrip ? generateID() : lastTrip.id
      const newRow = newPoint.toDB(tripID)
      const newTrip = isNewTrip ? new RingTrip(tripID, [newRow]) : new RingTrip(tripID, [newRow, ...lastTripRows])
      const vehicle = new Vehicle(newTrip)
      // update lastPoll data
      lastPoll.data = lastPoll.data.filter((v) => v.plate !== vehicle.plate)
      lastPoll.data.push(vehicle)
      if (process.env.DISABLE_LOGGING) return
      await sql`INSERT INTO ring_history ${sql(newRow)}`
    })
  )

  lastPoll.timestamp = DateTime.now()
  clearOldData()
}

const detectNewTrip = (newPoint: RingPoint, trip: RingTrip) => {
  const departurePoint = trip.line.sections[0].stops[0].stop
  if (!departurePoint) return true
  const lastPointDistance = distance(departurePoint.turfPoint, trip.points[0].turfPoint, { units: 'meters' })
  const newPointDistance = distance(departurePoint.turfPoint, newPoint.turfPoint, { units: 'meters' })
  if (lastPointDistance < 100 && newPointDistance > 100) return true
  return false
}

const clearOldData = () => {
  const threshold = ServiceTime.now().minus({ seconds: 10 })
  lastPoll.data = lastPoll.data.filter((vehicle) => {
    const lastPoint = vehicle.trip.points[0]
    return lastPoint.serviceTime.diff(threshold) > 0
  })
}
