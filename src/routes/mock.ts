import { Request, Response, Router } from 'express'
import { DateTime } from 'luxon'
import sql from '../utils/db'
import { MetuData, RingRow } from '../interfaces/ring'

const mock = Router()
let time = DateTime.fromISO('2025-04-30T09:00:00')

setInterval(() => {
  time = time.plus({ minutes: 1 })
  if (time.hour > 2 && time.hour < 6) {
    time = time.set({ day: -1, hour: 9 })
  }
}, 1000)

mock.get('/', async (req: Request, res: Response) => {
  const trips = await sql<(RingRow & { timestamp: number })[]>`
    SELECT * from ring_history
    WHERE timestamp BETWEEN ${time.minus({ minutes: 5 }).toSQL()}
    AND ${time.plus({ minutes: 5 }).toSQL()};
  `
  const mockData: MetuData[] = []
  const sortedTrips = trips.sort((a, b) => {
    const timeA = new Date(a.timestamp)
    const timeB = new Date(b.timestamp)
    const diffA = time.diff(DateTime.fromJSDate(timeA))
    const diffB = time.diff(DateTime.fromJSDate(timeB))
    return Math.abs(diffA.milliseconds) - Math.abs(diffB.milliseconds)
  })

  sortedTrips.forEach((trip) => {
    const isAdded = mockData.find((t) => t.id === trip.plate)
    if (!isAdded) {
      mockData.push({
        addr: trip.address,
        ago: 0,
        clr: trip.color,
        dir: 0,
        id: trip.plate,
        key: trip.state,
        lat: trip.lat,
        lng: trip.lng,
        sp: '',
      })
    }
  })

  res.json({
    data: mockData,
    timestamp: time.toISO(),
  })
})

mock.get('/update', (req: Request, res: Response) => {
  const newHour = Number(req.query.hour)
  if (isNaN(newHour)) return res.status(400).end()
  else time = time.set({ hour: newHour })
})

export default mock
