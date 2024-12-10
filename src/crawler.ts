import axios, { AxiosError } from 'axios'
import { RingData, VehicleTrip } from './interfaces'
import sql from './util/db'
import { nanoid } from 'nanoid'
import { DateTime } from 'luxon'
import { checkMovement, detectNewTrip } from './util/helpers'

export const lastCrawl = {
  data: null as RingData[] | null,
  vehicles: [] as VehicleTrip[],
  timestamp: null as DateTime | null,
}

export const crawl = async () => {
  try {
    const ringReq = await axios.get('https://ring.metu.edu.tr/ring.json')
    const ringData = ringReq.data as RingData[] | string

    // If there is no data, return
    if (typeof ringData === 'string') {
      lastCrawl.data = null
      lastCrawl.vehicles = []
      lastCrawl.timestamp = DateTime.now().setZone('Europe/Istanbul')
      return
    }

    // If there is no movement, return
    if (!checkMovement(ringData)) return

    // Record to database
    ringData.map(async (ring) => {
      const lastVehicle = lastCrawl.vehicles.find((v) => v.plate === ring.id)
      const isNewTrip = detectNewTrip(ring, lastVehicle)
      const tripID = isNewTrip ? nanoid() : lastVehicle?.tripID || nanoid()
      const vehicle = { tripID, plate: ring.id, color: ring.clr, state: ring.key }
      if (!lastVehicle) lastCrawl.vehicles.push(vehicle)
      else lastCrawl.vehicles[lastCrawl.vehicles.indexOf(lastVehicle)] = vehicle

      const databaseRow = {
        trip_id: vehicle.tripID,
        lat: ring.lat,
        lng: ring.lng,
        address: ring.addr,
        color: ring.clr,
        state: ring.key,
        plate: ring.id,
      }

      const isWeekend = DateTime.now().setZone('Europe/Istanbul').plus({ hours: 3 }).isWeekend
      const dbTable = isWeekend ? 'ring_history_we' : 'ring_history'
      await sql`INSERT INTO ${sql(dbTable)} ${sql(databaseRow)}`
    })

    // Update lastCrawl
    lastCrawl.data = ringData
    lastCrawl.vehicles = lastCrawl.vehicles.filter((old) => ringData.some((newR) => newR.id === old.plate))
    lastCrawl.timestamp = DateTime.now().setZone('Europe/Istanbul')
  } catch (error) {
    if (error instanceof AxiosError) console.log('Crawling error from axios: ', error.message)
    else console.error(error)
  }
}
