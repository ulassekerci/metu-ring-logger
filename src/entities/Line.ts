import { Feature, LineString } from 'geojson'
import { Stop } from './Stop'

export class RingLine {
  name: string
  departures: string[]
  weekend: boolean
  sections: RouteSection[]

  constructor(route: Route) {
    this.name = route.name
    this.departures = route.departures
    this.weekend = route.weekend
    this.sections = route.sections
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
