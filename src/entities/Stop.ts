import { point } from '@turf/turf'

export class Stop {
  name: string
  lat: number
  lng: number
  address?: string // address string from metu api

  get point() {
    return point([this.lng, this.lat])
  }

  constructor(info: { name: string; lat: number; lng: number; address?: string }) {
    this.name = info.name
    this.lat = info.lat
    this.lng = info.lng
    this.address = info.address
  }
}
