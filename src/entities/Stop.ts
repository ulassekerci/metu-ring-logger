import * as turf from '@turf/turf'

export class Stop {
  name: string
  lat: number
  lng: number
  mins: number
  address?: string // address string from metu api

  get turfPoint() {
    return turf.point([this.lng, this.lat])
  }

  constructor(data: { name: string; lat: number; lng: number; address?: string; mins: number }) {
    this.name = data.name
    this.lat = data.lat
    this.lng = data.lng
    this.mins = data.mins
    this.address = data.address
  }
}
