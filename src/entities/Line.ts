import { ServiceTime } from './ServiceTime'
import { mergeSections } from '../data/lines/merge'
import { Route, RouteSection } from '../interfaces/line'
import { RingPoint } from './Point'
import { Duration } from 'luxon'

export class RingLine {
  name: string
  departures: ServiceTime[]
  weekend: boolean
  sections: RouteSection[]
  colors: string[]

  constructor(route: Route) {
    this.name = route.name
    this.weekend = route.weekend
    this.sections = route.sections
    this.colors = route.sections.map((section) => section.color.toUpperCase())
    this.departures = route.departures.map((d) => ServiceTime.fromFormat(d, 'HH:mm'))
  }

  get stops() {
    return this.sections.flatMap((section) => section.stops)
  }

  get duration() {
    const first = this.stops[0].mins
    const last = this.stops.at(-1)!.mins
    return Duration.fromObject({ minutes: last - first })
  }

  get departureStop() {
    return this.sections[0].stops[0].stop
  }

  get polyLine() {
    return mergeSections(this.sections.map((section) => section.polyline))
  }

  getClosestDeparture(departure: ServiceTime) {
    return this.departures.reduce((prev, curr) => {
      const prevDiff = prev.diff(departure)
      const currDiff = curr.diff(departure)
      return currDiff < prevDiff ? curr : prev
    })
  }

  estimateDeparture(points: RingPoint[]) {
    const uniqueStops = this.stops.filter((stop) => {
      const stopAdress = stop.stop.address
      if (!stopAdress) return
      const sameAdress = this.stops.filter((s) => s.stop.address === stopAdress)
      if (sameAdress.length > 1) return false
      else return true
    })

    const firstPointWithUniqueAddress = [...points].reverse().find((point) => {
      const pointAddress = point.address
      if (!pointAddress) return false
      const isUnique = uniqueStops.some((stop) => stop.stop.address === pointAddress)
      return isUnique
    })
    if (!firstPointWithUniqueAddress) return null

    const stop = this.stops.find((s) => s.stop.address === firstPointWithUniqueAddress.address)
    if (!stop) return null

    const departureTime = firstPointWithUniqueAddress.serviceTime.minus({ minutes: stop.mins })
    return this.getClosestDeparture(departureTime)
  }
}
