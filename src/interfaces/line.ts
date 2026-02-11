import { Feature, LineString } from 'geojson'
import { Stop } from '../entities/Stop'

export interface Route {
  name: string
  departures: string[] // HH:mm format
  weekend: boolean
  sections: RouteSection[]
}

export interface RouteSection {
  name: string
  color: string
  polyline: Feature<LineString>
  stops: { stop: Stop; mins: number }[]
}
