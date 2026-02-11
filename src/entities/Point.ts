import { MetuData, RingData, RingRow } from '../interfaces/ring'
import * as turf from '@turf/turf'
import { ServiceTime } from './ServiceTime'

export class RingPoint {
  lat: number
  lng: number
  color: string
  state: string
  plate: string
  address?: string
  serviceTime: ServiceTime

  private constructor(data: RingData) {
    this.lat = Number(data.lat)
    this.lng = Number(data.lng)
    this.address = data.address
    this.color = data.color.toUpperCase()
    this.state = data.state
    this.plate = data.plate
    this.serviceTime = data.serviceTime
  }

  static fromApi(metuPoint: MetuData) {
    return new RingPoint({
      lat: metuPoint.lat,
      lng: metuPoint.lng,
      address: metuPoint.addr,
      color: metuPoint.clr,
      state: metuPoint.key,
      plate: metuPoint.id,
      serviceTime: ServiceTime.now(),
    })
  }

  static fromDb(dbPoint: RingRow) {
    return new RingPoint({ ...dbPoint, serviceTime: new ServiceTime(dbPoint.service_time) })
  }

  get turfPoint() {
    return turf.point([this.lng, this.lat])
  }

  toDB = (tripID: string) => ({
    trip_id: tripID,
    lat: String(this.lat),
    lng: String(this.lng),
    address: this.address,
    color: this.color,
    state: this.state,
    plate: this.plate,
    service_time: ServiceTime.now().seconds,
  })
}
