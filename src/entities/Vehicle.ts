import { vehicles } from '../data/vehicles'

export class Vehicle {
  plate: string
  brand?: string
  model?: string
  doors?: number

  constructor(plate: string) {
    this.plate = plate

    const vehicleInfo = vehicles.find((info) => info.plate === this.plate)
    this.brand = vehicleInfo?.brand
    this.model = vehicleInfo?.model
    this.doors = vehicleInfo?.doors
  }
}
