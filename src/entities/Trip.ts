import { ringLines } from '../data/lines'
import { RingRow } from '../interfaces/ring'
import { RingLine } from './Line'
import * as turf from '@turf/turf'
import { RingPoint } from './Point'
import { ServiceTime } from './ServiceTime'

export class RingTrip {
  id: string
  line: RingLine
  points: RingPoint[]
  vehiclePlate: string
  departureTime: string
  isPartial: boolean = false

  constructor(id: string, rows: RingRow[]) {
    this.id = id
    this.vehiclePlate = rows[0].plate
    this.points = rows.map((row) => RingPoint.fromDb(row))
    const ringLine = ringLines.find((line) => line.colors.includes(rows[0].color.toUpperCase()))
    if (!ringLine) throw new Error(`${rows[0].color} colored line not found`)
    this.line = ringLine

    // if first point is far from departure stop consider a partial trip
    const firstPoint = this.points.at(-1)?.turfPoint!
    const departurePoint = this.line.departureStop.turfPoint
    const firstPointDistance = turf.distance(firstPoint, departurePoint, { units: 'meters' })
    if (firstPointDistance > 400) this.isPartial = true

    if (this.isPartial) {
      // if departure is unknown estimate departure time from its position
      // TODO: finding closest stop isn't reliable - use polyline matching
      // also look at ! thing
      this.departureTime = this.line.estimateDeparture(this.points.at(-1)!)
    } else {
      this.departureTime = this.line.getClosestDeparture(this.points.at(-1)!.serviceTime)
    }
  }

  getClosestPointToNow = () => {
    return this.points.reduce((prev, curr) => {
      const now = ServiceTime.now()
      const prevDiff = prev.serviceTime.diff(now)
      const currDiff = curr.serviceTime.diff(now)
      return currDiff < prevDiff ? curr : prev
    })
  }

  // getClosestPointToTime = (time: ServiceTime) => {
  //   return this.points.reduce((prev, curr) => {
  //     const prevDiff = prev.serviceTime.diff(time)
  //     const currDiff = curr.serviceTime.diff(time)
  //     return currDiff < prevDiff ? curr : prev
  //   })
  // }
}
