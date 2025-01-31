export interface RingData {
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

export interface VehicleTrip {
  tripID: string
  plate: string
  color: string
  state: string
  departure: string | null
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

export interface RingLogWithDeparture {
  id: number
  trip_id: string
  lat: string
  lng: string
  address: string
  color: string
  state: string
  plate: string
  timestamp: string
  departure: string // HH:mm:ss
}

export interface FormattedTrip {
  tripID: string
  departure: string
  duration: number
  plate: string
  points: RingLog[]
  day: number
  live: boolean | undefined
}

export interface AvgTripPoint {
  lat: string
  lng: string
  address: string
  color: string
  departure: string
  time: string
}

export interface Stop {
  name: string
  lat: number
  lng: number
  address: string | null
}

export interface DepartureTime {
  departure: string
}
