import { ServiceTime } from '../entities/ServiceTime'

export interface MetuData {
  lat: string // latitude
  lng: string // longitude
  addr: string // address
  dir: number // direction (0-8, one per 45 degrees)
  sp: string // speed
  clr: string // color
  ago: number // data age
  key: string // state
  id: string // license plate
}

export interface RingData {
  lat: string
  lng: string
  address: string
  color: string
  state: string
  plate: string
  serviceTime: ServiceTime
}

export interface RingRow {
  trip_id: string
  lat: string
  lng: string
  address: string
  color: string
  state: string
  plate: string
  service_time: number // seconds after 06.00
}
