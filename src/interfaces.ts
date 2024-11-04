export interface RingData {
  lat: string // latitude
  lng: string // longitude
  addr: string // address
  dir: number // direction (0-8, one per 45 degrees)
  sp: string // speed
  clr: string // color
  ago: number // data age
  key: string // name
  id: string // license plate
}

export interface VehicleTrip {
  tripID: string
  plate: string
  color: string
}

export interface RingLog {
  id: number
  trip_id: string
  lat: string
  lng: string
  address: string
  color: string
  state: string
  plate: string
  timestamp: string
}
