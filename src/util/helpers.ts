import { DateTime } from 'luxon'
import { lastCrawl } from '../crawler'
import { RingData, VehicleTrip } from '../interfaces'
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

  // TEMPORARY: If it is weekend, do not crawl
  if (now.isWeekend) return false

  // If it is weekend or evening, crawl less frequently
  if (now.isWeekend || now.hour > 20) {
    const lastCrawlDiff = lastCrawl.timestamp.diffNow('seconds').seconds
    if (now.minute < 5 || now.minute > 50) return true
    else if (now.minute > 20 && now.minute < 35) return true
    else return lastCrawlDiff > 60
  }

  return true
}

export const checkMovement = (data: RingData[]) => {
  let isMoved = false
  data.map((ring) => {
    const oldData = lastCrawl.data?.find((v) => v.id === ring.id)
    if (ring.lat !== oldData?.lat) isMoved = true
    if (ring.lng !== oldData?.lng) isMoved = true
  })
  return isMoved
}

export const detectNewTrip = (newData: RingData, lastData?: VehicleTrip) => {
  const redColor = '#ff0000'
  const yellowColor = '#ffff57'
  const brownState = ' - ODTU A1 Kapisi - brown'
  const purpleState = ' - ODTU A1 Kapisi - purple'
  if (!lastData) return true
  if (lastData.color === redColor && newData.clr === yellowColor) return true
  if (lastData.state !== brownState && newData.key === brownState) return true
  if (lastData.state !== purpleState && newData.key === purpleState) return true
  return false
}
