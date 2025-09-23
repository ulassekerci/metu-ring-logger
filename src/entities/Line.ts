import { Feature, LineString } from 'geojson'
import { Stop } from './Stop'
import { RingPoint } from './Point'
import * as turf from '@turf/turf'
import { ServiceTime } from './ServiceTime'

export class RingLine {
  name: string
  departures: string[]
  weekend: boolean
  sections: RouteSection[]
  colors: string[]

  constructor(route: Route) {
    this.name = route.name
    this.departures = route.departures
    this.weekend = route.weekend
    this.sections = route.sections
    this.colors = [...new Set(route.sections.map((s) => s.color))]
  }

  get departureStop() {
    return this.sections[0].stops[0].stop
  }

  getClosestDeparture = (departure: ServiceTime) => {
    return this.departures.reduce((prev, curr) => {
      const prevTime = ServiceTime.fromFormat(prev, 'HH:mm')
      const currTime = ServiceTime.fromFormat(curr, 'HH:mm')
      const prevDiff = prevTime.diff(departure)
      const currDiff = currTime.diff(departure)
      return currDiff < prevDiff ? curr : prev
    })
  }

  estimateDeparture = (firstPoint: RingPoint) => {
    const sections = this.sections.filter((section) => section.color === firstPoint.color)
    const stops = sections.flatMap((section) => section.stops)
    const closestStop = stops.reduce((prev, curr) => {
      const prevDistance = turf.distance(firstPoint.turfPoint, prev.stop.turfPoint, { units: 'meters' })
      const currDistance = turf.distance(firstPoint.turfPoint, curr.stop.turfPoint, { units: 'meters' })
      return currDistance < prevDistance ? curr : prev
    })
    const estimatedDeparture = firstPoint.serviceTime.minus({ minutes: closestStop.mins })
    return this.getClosestDeparture(estimatedDeparture)
  }
}

export interface Route {
  name: string
  departures: string[]
  weekend: boolean
  sections: RouteSection[]
}

export interface RouteSection {
  name: string
  color: string
  polyline: Feature<LineString>
  stops: { stop: Stop; mins: number }[]
}
