import axios from 'axios'
import { DateTime } from 'luxon'
import type { MetuData, RingRow } from '../interfaces/ring'
import { RingPoint } from '../entities/Point'
import sql from '../utils/db'
import { ringLines } from '../data/lines'
import { distance } from '@turf/turf'
import { generateID } from '../utils/id'
import * as turf from '@turf/turf'
import { garagePolygon } from '../data/garage'

export const lastPoll = {
  data: null as RingPoint[] | null,
  timestamp: DateTime.fromMillis(0),
}

export const poll = async () => {
  const ringReq = await axios.get<MetuData[] | string>('https://ring.metu.edu.tr/ring.json')
  const ringData = ringReq.data

  // API returns empty page if there is no data
  if (typeof ringData === 'string') {
    lastPoll.data = null
    lastPoll.timestamp = DateTime.now()
    return
  }

  // Get point objects from data
  const allPoints = ringData.map((data) => RingPoint.fromApi(data))
  const newPoints = allPoints.filter((point) => point.detectMovement(lastPoll.data))
  lastPoll.data = allPoints
  lastPoll.timestamp = DateTime.now()

  // Get last records from database
  const lastRows = await sql<RingRow[]>`
      SELECT * FROM ring_history
      WHERE timestamp > NOW() - INTERVAL '20 minutes'
      ORDER BY "timestamp" DESC
  `

  newPoints.forEach(async (newPoint) => {
    const isParked = turf.booleanPointInPolygon(newPoint.turfPoint, garagePolygon)
    if (isParked) return
    const isNewTrip = detectNewTrip(newPoint, lastRows)
    const newID = generateID()
    const tripID = isNewTrip ? newID : lastRows[0].trip_id
    const databaseRow = newPoint.toDB(tripID)
    if (process.env.DISABLE_LOGGING) return
    await sql`INSERT INTO ring_history ${sql(databaseRow)}`
  })
}

const detectNewTrip = (newPoint: RingPoint, lastRows: RingRow[]) => {
  const lastRow = lastRows.find((row) => row.plate === newPoint.plate)
  if (!lastRow) return true
  const lastPoint = RingPoint.fromDb(lastRow)
  const tripLine = ringLines.find((line) => line.sections.find((section) => section.color === lastPoint.color))
  const departurePoint = tripLine?.sections[0].stops[0].stop
  if (!departurePoint) return true
  const lastPointDistance = distance(departurePoint.turfPoint, lastPoint.turfPoint, { units: 'meters' })
  const newPointDistance = distance(departurePoint.turfPoint, newPoint.turfPoint, { units: 'meters' })
  if (lastPointDistance < 100 && newPointDistance > 100) return true
  return false
}
