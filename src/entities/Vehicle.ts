import { vehicles } from '../data/vehicles'
import { RingTrip } from './Trip'

export class Vehicle {
  plate: string
  color: string
  trip: RingTrip

  brand: string
  model: string
  doors: number

  constructor(trip: RingTrip) {
    this.plate = trip.vehiclePlate
    this.color = trip.points[0].color
    this.trip = trip

    const vehicleInfo = vehicles.find((info) => info.plate === this.plate)
    this.brand = vehicleInfo?.brand ?? ''
    this.model = vehicleInfo?.model ?? 'Araç bilgisi yok'
    this.doors = vehicleInfo?.doors ?? -1
  }
}
