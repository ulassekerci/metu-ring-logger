import { DateTime } from 'luxon'
import { lastCrawl } from './crawler'
import { RingData } from './interfaces'
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
  if (now.hour > 1 && now.hour < 7) return false

  // TEMPORARY: If it is weekend, do not crawl
  if (now.isWeekend) return false

  // If it is weekend or evening, crawl less frequently
  if (now.isWeekend || now.hour > 18) {
    const lastCrawlDiff = lastCrawl.timestamp.diffNow('seconds').seconds
    if (now.minute < 20) return lastCrawlDiff > 60
    else if (now.minute > 40) return lastCrawlDiff > 60
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
