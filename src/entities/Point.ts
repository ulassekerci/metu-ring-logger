import { MetuData, RingData, RingRow } from '../interfaces/ring'
import * as turf from '@turf/turf'
import { ServiceTime } from './ServiceTime'

export class RingPoint {
  lat: number
  lng: number
  address: string
  color: string
  state: string
  plate: string
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

  get turfPoint() {
    return turf.point([this.lng, this.lat])
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

  detectMovement = (oldData: RingPoint[] | null) => {
    const oldPoint = oldData?.find((point) => point.plate === this.plate)
    if (!oldData || !oldPoint) return true
    const isLatUpdated = oldPoint.lat !== this.lat
    const isLngUpdated = oldPoint.lng !== this.lng
    return isLatUpdated || isLngUpdated
  }

  toDB = (tripID: string) => ({
    trip_id: tripID,
    lat: this.lat,
    lng: this.lng,
    address: this.address,
    color: this.color,
    state: this.state,
    plate: this.plate,
  })
}
