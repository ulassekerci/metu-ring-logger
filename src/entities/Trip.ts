import { ringLines } from '../data/lines'
import { RingLine } from './Line'
import * as turf from '@turf/turf'
import { RingPoint } from './Point'
import { ServiceTime } from './ServiceTime'
import { generateID } from '../utils/id'
import { Duration } from 'luxon'
import { Vehicle } from './Vehicle'

export class RingTrip {
  id: string
  line: RingLine
  points: RingPoint[]
  vehicle: Vehicle
  departureTime: ServiceTime | null
  isPartial: boolean = false

  constructor(id: string, points: RingPoint[]) {
    if (points.length === 0) throw new RingTripError('no_rows')

    const ringLine = ringLines.find((line) => line.colors.includes(points[0].color.toUpperCase()))
    if (!ringLine) throw new RingTripError('line_not_found')

    const isSameVehicle = points.some((point) => point.plate !== points[0].plate)
    if (isSameVehicle) throw new RingTripError('vehicle_mismatch')

    // TODO: check for points that are too far away from polyline

    this.id = id
    this.line = ringLine
    this.vehicle = new Vehicle(points[0].plate)
    this.points = points.sort((a, b) => b.serviceTime.seconds - a.serviceTime.seconds)

    // if first point is far from departure count as a partial trip and display
    // estimated departure with a warning
    const firstPoint = this.points.at(-1)!
    const departurePoint = this.line.departureStop.turfPoint
    const firstPointToDeparture = turf.distance(firstPoint.turfPoint, departurePoint, { units: 'meters' })

    if (firstPointToDeparture > 500) {
      this.isPartial = true
      const estimatedDeparture = this.line.estimateDeparture(this.points)
      this.departureTime = estimatedDeparture
    } else {
      const closestDeparture = this.line.getClosestDeparture(this.firstPoint.serviceTime)
      this.departureTime = closestDeparture
    }
  }

  static new(point: RingPoint) {
    const tripID = generateID()
    return new RingTrip(tripID, [point])
  }

  static fromLast(trip: RingTrip, newPoint: RingPoint) {
    const newPoints = [newPoint, ...trip.points]
    return new RingTrip(trip.id, newPoints)
  }

  get firstPoint() {
    return this.points.at(-1)!
  }

  get lastPoint() {
    return this.points[0]
  }

  get duration() {
    const first = this.firstPoint.serviceTime.seconds
    const last = this.lastPoint.serviceTime.seconds
    return Duration.fromObject({ seconds: last - first })
  }

  get closestPointToNow() {
    return this.points.reduce((prev, curr) => {
      const now = ServiceTime.now()
      const prevDiff = prev.serviceTime.diff(now)
      const currDiff = curr.serviceTime.diff(now)
      return currDiff < prevDiff ? curr : prev
    })
  }

  toJSON() {
    return {
      id: this.id,
      line: this.line.name,
      color: this.lastPoint.color,
      vehicle: this.vehicle,
      departureTime: this.departureTime,
      closestPointToNow: this.closestPointToNow,
      isPartial: this.isPartial,
    }
  }
}

export class RingTripError extends Error {
  problem: 'no_rows' | 'line_not_found' | 'vehicle_mismatch'
  constructor(problem: typeof RingTripError.prototype.problem) {
    const messageMap: Record<typeof problem, string> = {
      no_rows: 'No rows provided to create Trip',
      line_not_found: 'Line not found for the given color',
      vehicle_mismatch: 'All rows must have the same plate',
    }
    const message = messageMap[problem]
    super(message)
    this.problem = problem
  }
}
