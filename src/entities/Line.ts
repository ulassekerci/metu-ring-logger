import { ServiceTime } from './ServiceTime'
import { mergeSections } from '../data/lines/merge'
import { Route, RouteSection } from '../interfaces/line'
import { Duration } from 'luxon'
import { Stop } from './Stop'
import { booleanEqual } from '@turf/turf'
import { RingTrip } from './Trip'

export class RingLine {
  name: string
  departures: ServiceTime[]
  weekend: boolean
  sections: RouteSection[]
  colors: string[]
  endTime?: ServiceTime

  constructor(route: Route) {
    this.name = route.name
    this.weekend = route.weekend
    this.sections = route.sections
    this.colors = route.sections.map((section) => section.color.toUpperCase())
    this.departures = route.departures.map((d) => ServiceTime.fromFormat(d, 'HH:mm'))
    this.endTime = route.endTime
  }

  get stops() {
    const stopData = this.sections.flatMap((section) => section.stops)
    const allStops = stopData.map((s) => new Stop({ ...s.stop, mins: s.mins }))
    // deduplicate consecutive same stops
    return allStops.filter((newStop, index) => {
      if (index === 0) return true
      const prevStop = allStops[index - 1]
      const isSameStop = booleanEqual(newStop.turfPoint, prevStop.turfPoint)
      if (isSameStop) return false
      return true
    })
  }

  get duration() {
    const first = this.stops[0].mins
    const last = this.stops.at(-1)!.mins
    return Duration.fromObject({ minutes: last - first })
  }

  get departureStop() {
    const data = this.sections[0].stops[0]
    return new Stop({ ...data.stop, mins: data.mins })
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

  estimateDeparture(trip: RingTrip) {
    // Use advantage of rings that have only one vehicle at a time
    // for example a live gray ring at 15.05 must be the one departed at 14.30
    const lineDuration = this.stops.at(-1)!.mins
    const minDepartureInterval = this.departures.reduce((acc, curr, currIdx, arr) => {
      if (currIdx === 0) return acc
      const currDiff = curr.diff(arr[currIdx - 1]).as('minutes')
      return Math.min(currDiff, acc)
    }, Infinity)
    const isSingleVehicleLine = minDepartureInterval > lineDuration

    if (isSingleVehicleLine) {
      // return departure time just before now
      const now = ServiceTime.now()
      const pastDepartures = this.departures.filter((d) => d.seconds <= now.seconds)
      if (pastDepartures.length === 0) return null
      return pastDepartures.reduce((prev, curr) => (curr.seconds > prev.seconds ? curr : prev))
    }

    // If that didn't work, try finding distinct adresses
    // loop through all the colors starting from first point
    // check if there are any points with distinct address
    const tripColors = new Set<string>()
    trip.pointsAsc.forEach((point) => tripColors.add(point.color))

    for (const tripColor of tripColors) {
      const possibleSections = this.sections.filter((sec) => sec.color === tripColor)
      // find distinct addresses in the sections
      const addresses = new Map<string, { mins: number; isDistinct: boolean }>()
      possibleSections.forEach((sec) => {
        sec.stops.forEach((stop) => {
          const address = stop.stop.address
          const mins = stop.mins
          if (!address) return
          if (addresses.has(address)) return addresses.set(address, { mins, isDistinct: false })
          addresses.set(address, { mins, isDistinct: true })
        })
      })

      // use distinct addresses to determine departure
      const points = trip.pointsAsc.filter((p) => p.color === tripColor)

      const firstPointWithDistinctAddress = points.find((point) => {
        return addresses.get(point.address)?.isDistinct
      })
      if (!firstPointWithDistinctAddress) continue

      const stopMins = addresses.get(firstPointWithDistinctAddress.address)?.mins
      if (stopMins == null) continue

      const estimatedDeparture = firstPointWithDistinctAddress.serviceTime.minus({ minutes: stopMins })
      return this.getClosestDeparture(estimatedDeparture)
    }
    return null
  }
}
