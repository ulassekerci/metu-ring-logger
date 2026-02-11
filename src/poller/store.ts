import { RingTrip } from '../entities/Trip'

class LiveDataStore {
  private liveData: Map<string, RingTrip> = new Map()
  private timeOuts: Map<string, NodeJS.Timeout> = new Map()

  get trips() {
    return [...this.liveData.values()]
  }

  findByPlate(plate: string) {
    return this.trips.find((t) => t.vehicle.plate === plate) ?? null
  }

  update(trip: RingTrip) {
    this.liveData.set(trip.id, trip)

    const oldTimeout = this.timeOuts.get(trip.id)
    if (oldTimeout) clearTimeout(oldTimeout)

    const newTimeout = setTimeout(() => {
      this.liveData.delete(trip.id)
      this.timeOuts.delete(trip.id)
    }, 30 * 1000)

    this.timeOuts.set(trip.id, newTimeout)
  }
}

export const liveData = new LiveDataStore()
