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
  const yellowState = ' - ODTU A2 Kapisi - yellow'
  const brownState = ' - ODTU A1 Kapisi - brown'
  const purpleState = ' - ODTU A1 Kapisi - purple'
  const blueState = ' - Dogu yurtlar - blue'
  if (!lastData) return true
  if (lastData.color !== newData.clr) return true
  if (lastData.color === redColor && newData.clr === yellowColor) return true
  if (lastData.state !== brownState && newData.key === brownState) return true
  if (lastData.state !== yellowState && newData.key === yellowState) return true
  if (lastData.state !== purpleState && newData.key === purpleState) return true
  if (lastData.state !== blueState && newData.key === blueState) return true
  return false
}
