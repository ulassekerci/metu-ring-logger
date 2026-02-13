import { Feature, LineString } from 'geojson'
import { ServiceTime } from '../entities/ServiceTime'

export interface Route {
  name: string
  departures: string[] // HH:mm format
  weekend: boolean
  sections: RouteSection[]
  endTime?: ServiceTime
}

export interface RouteSection {
  name: string
  color: string
  polyline: Feature<LineString>
  stops: { stop: Stop; mins: number }[]
}

interface Stop {
  name: string
  lat: number
  lng: number
  address?: string
}
