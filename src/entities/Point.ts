import { DateTime } from 'luxon'
import { MetuData, RingData, RingRow } from '../interfaces/ring'
import * as turf from '@turf/turf'

export class RingPoint {
  lat: number
  lng: number
  address: string
  color: string
  state: string
  plate: string
  timestamp: DateTime

  private constructor(data: RingData) {
    this.lat = Number(data.lat)
    this.lng = Number(data.lng)
    this.address = data.address
    this.color = data.color
    this.state = data.state
    this.plate = data.plate
    this.timestamp = data.timestamp
  }

  get point() {
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
      timestamp: DateTime.now(),
    })
  }

  static fromDb(dbPoint: RingRow) {
    const pointDate = new Date(dbPoint.timestamp)
    const timestamp = DateTime.fromJSDate(pointDate)
    return new RingPoint({ ...dbPoint, timestamp })
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
