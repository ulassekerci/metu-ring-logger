import { Mutex } from 'async-mutex'
import { queryTrips } from './query'
const mutex = new Mutex()

class GhostCache {
  data: Buffer | null
  timestamp: number

  constructor() {
    this.data = null
    this.timestamp = 0
  }

  get isFresh() {
    return Date.now() - this.timestamp <= 1000
  }

  async getTrips() {
    if (this.isFresh) return this.data

    return mutex.runExclusive(async () => {
      // Double check inside lock
      if (this.isFresh) return this.data

      // cache as buffer because some toJSON methods
      // have expensive calculations (like closestPointToNow)
      const trips = await queryTrips()
      const buffer = Buffer.from(JSON.stringify(trips))

      this.timestamp = Date.now()
      this.data = buffer
      return buffer
    })
  }
}

export const ghostCache = new GhostCache()
