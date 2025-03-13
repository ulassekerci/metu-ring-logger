import { DateTime } from 'luxon'
import { lastCrawl } from '../crawler'
import { RingData, VehicleTrip } from '../interfaces/ring'
import 'dotenv/config'

export const shouldCrawl = () => {
  const now = DateTime.now().setZone('Europe/Istanbul')

  // If crawler is disabled, do not crawl
  if (process.env.DISABLE_CRAWLER) return false

  // If there are active busses, crawl
  if (lastCrawl.data) return true

  // If there is no timestamp, crawl
  if (!lastCrawl.timestamp) return true

  // If it is night, do not crawl
  if (now.hour >= 2 && now.hour < 8) return false

  return true
}

export const checkMovement = (data: RingData[]) => {
  for (const ring of data) {
    const oldData = lastCrawl.data?.find((v) => v.id === ring.id)
    if (!oldData) return true
    if (ring.lat !== oldData.lat || ring.lng !== oldData.lng) return true
  }
  return false
}

export const detectNewTrip = (newData: RingData, lastData?: VehicleTrip) => {
  const redColor = '#ff0000'
  const yellowColor = '#ffff57'
  const yellowDepartureState = ' - ODTU A2 Kapisi - yellow'
  const brownDepartureState = ' - ODTU A1 Kapisi - brown'
  const purpleDepartureState = ' - ODTU A1 Kapisi - purple'
  const blueDepartureState = ' - Dogu yurtlar - blue'
  // New trip if no data in the last hour
  if (!lastData) return true
  // Yellow to red color update is fine
  if (lastData.color === yellowColor && newData.clr === redColor) return false
  // otherwise it's a new trip
  if (lastData.color !== newData.clr) return true
  // It's a new trip if state equals to departureState
  if (lastData.state !== brownDepartureState && newData.key === brownDepartureState) return true
  if (lastData.state !== yellowDepartureState && newData.key === yellowDepartureState) return true
  if (lastData.state !== purpleDepartureState && newData.key === purpleDepartureState) return true
  if (lastData.state !== blueDepartureState && newData.key === blueDepartureState) return true
  return false
}

export const colorEquals = (color1: string, color2: string) => {
  const firstColor = color1.toUpperCase()
  const secondColor = color2.toUpperCase()
  if (firstColor === secondColor) return true
  else if (firstColor === '#FF0000' && secondColor === '#FFFF57') return true
  else if (firstColor === '#FFFF57' && secondColor === '#FF0000') return true
  else return false
}
