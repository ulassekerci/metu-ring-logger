import axios, { AxiosError } from 'axios'
import { RingData, RingLog, VehicleTrip } from './interfaces/ring'
import sql from './util/db'
import { nanoid } from 'nanoid'
import { DateTime } from 'luxon'
import { checkMovement, detectNewTrip } from './util/helpers'
import { predictDeparture } from './functions/schedule'

export const lastCrawl = {
  data: null as RingData[] | null,
  vehicles: [] as VehicleTrip[],
  timestamp: DateTime.fromMillis(0),
}

export const crawl = async () => {
  try {
    const ringReq = await axios.get<RingData[] | string>('https://ring.metu.edu.tr/ring.json')
    const ringData = ringReq.data

    // If there is no data, return
    if (typeof ringData === 'string') {
      lastCrawl.data = null
      lastCrawl.vehicles = []
      lastCrawl.timestamp = DateTime.now().setZone('Europe/Istanbul')
      return
    }

    // If there is no movement, return
    if (!checkMovement(ringData)) return

    // Get last records from database
    const lastTripData = await sql<RingLog[]>`
      SELECT * FROM ring_history
      WHERE timestamp > NOW() - INTERVAL '1 hour' 
      ORDER BY "timestamp" ASC`

    const lastTripIDs = lastTripData.map((trip) => trip.trip_id)
    const lastDepartures = lastTripIDs.map((id) => {
      const lastTripStartPoint = lastTripData.filter((trip) => trip.trip_id === id)[0]
      const lastTripDeparture = DateTime.fromJSDate(new Date(lastTripStartPoint.timestamp))
      const lastTripStartAddress = lastTripStartPoint.address
      const isSuspicious = !(
        lastTripStartAddress.includes('A1') ||
        lastTripStartAddress.includes('A2') ||
        lastTripStartAddress.includes('Garaj') ||
        lastTripStartAddress.includes('BOTE-MYO')
      )
      const ringTime = predictDeparture(lastTripDeparture, lastTripStartPoint.color)
      return { ...lastTripStartPoint, timestamp: isSuspicious ? null : ringTime.toFormat('HH:mm:ss') }
    })

    // Record to database
    ringData.map(async (ring) => {
      const lastVehicle = lastCrawl.vehicles.find((v) => v.plate === ring.id)
      const isNewTrip = detectNewTrip(ring, lastVehicle)
      const tripID = isNewTrip ? nanoid() : lastVehicle?.tripID || nanoid()
      const vehicle = {
        tripID,
        plate: ring.id,
        color: ring.clr,
        state: ring.key,
        departure: lastDepartures.find((d) => d.trip_id === tripID)?.timestamp || null,
      }
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

      if (process.env.DISABLE_LOGGING) return
      await sql`INSERT INTO ring_history ${sql(databaseRow)}`
    })

    // Update lastCrawl
    lastCrawl.data = ringData
    lastCrawl.vehicles = lastCrawl.vehicles.filter((old) => ringData.some((newR) => newR.id === old.plate))
    lastCrawl.timestamp = DateTime.now().setZone('Europe/Istanbul')
  } catch (error) {
    if (error instanceof AxiosError) console.log('Axios Error: ', error.message)
    else console.error(error)
  }
}
