import { DateTime } from 'luxon'
import sql from './db'
import { RingRow } from '../interfaces/ring'
import { checkBounds } from '../data/campus'
import { RingTrip } from '../entities/Trip'
import { RingPoint } from '../entities/Point'
import * as turf from '@turf/turf'

export const cleanDB = async () => {
  if (process.env.DISABLE_CLEANING) return

  // get last cleanup time
  const lastCleanupQuery = await sql`SELECT value FROM stats WHERE key = 'last_cleanup'`
  const dbLastCleanup = DateTime.fromISO(lastCleanupQuery.at(0)?.value)
  const lastCleanup = dbLastCleanup.isValid ? dbLastCleanup : DateTime.fromMillis(0)

  // get rows and group by trips
  const rows = await sql<RingRow[]>`
    SELECT * FROM ring_history
    WHERE timestamp > ${lastCleanup.toJSDate()}
    ORDER BY timestamp DESC
  `
  const tripsById = new Map<string, RingRow[]>()
  rows.forEach((row) => {
    const tripRows = tripsById.get(row.trip_id) || []
    tripRows.push(row)
    tripsById.set(row.trip_id, tripRows)
  })

  const trips: RingTrip[] = []
  const tripsToDelete = new Set<{ tripID: string; reason: string }>()

  // create trip object with rows and delete if fails
  tripsById.forEach((rows, tripID) => {
    try {
      const points = rows.map((row) => RingPoint.fromDb(row))
      const trip = new RingTrip(tripID, points)
      trips.push(trip)
    } catch (error) {
      tripsToDelete.add({ tripID, reason: 'Failed to create trip object' })
    }
  })

  // find trips left campus or parked
  trips.forEach((trip) => {
    const badLocatedRows = trip.points.filter((point) => {
      const bounds = checkBounds(point)
      return bounds.inGarage || bounds.leftCampus
    })
    if (badLocatedRows.length > 1) tripsToDelete.add({ tripID: trip.id, reason: 'Left campus or parked' })
  })

  // find unusually long or short trips
  trips.forEach((trip) => {
    const actualDuration = trip.duration.as('minutes')
    const expectedDuration = trip.line.duration.as('minutes')
    const isTooLong = actualDuration > expectedDuration * 2
    const isTooShort = actualDuration < expectedDuration / 2
    if (isTooLong) tripsToDelete.add({ tripID: trip.id, reason: 'Unusually long trip' })
    if (isTooShort) tripsToDelete.add({ tripID: trip.id, reason: 'Unusually short trip' })
  })

  // find trips which didn't left departure
  trips.forEach((trip) => {
    const departurePoint = trip.line.departureStop.turfPoint
    const farthestPoint = trip.points.reduce((prev, curr) => {
      const prevDistance = turf.distance(prev.turfPoint, departurePoint, { units: 'meters' })
      const currDistance = turf.distance(curr.turfPoint, departurePoint, { units: 'meters' })
      return currDistance > prevDistance ? curr : prev
    })
    const farthestDistance = turf.distance(farthestPoint.turfPoint, departurePoint, { units: 'meters' })
    if (farthestDistance < 1500) tripsToDelete.add({ tripID: trip.id, reason: 'Did not leave departure' })
  })

  // find partial trips
  trips.forEach((trip) => {
    if (!trip.isPartial) return
    tripsToDelete.add({ tripID: trip.id, reason: 'partial trip' })
  })

  // move bad trips to ring_archive table
  const tripIDArray = [...tripsToDelete].map((t) => t.tripID)
  if (tripIDArray.length === 0) return

  await sql.begin(async (sql) => {
    await sql`
      INSERT INTO ring_archive
      SELECT * FROM ring_history
      WHERE trip_id = ANY(${tripIDArray})
      ON CONFLICT (id) DO NOTHING;
    `
    await sql`
      DELETE FROM ring_history
      WHERE trip_id = ANY(${tripIDArray});
    `
    await sql`
      INSERT INTO stats (key, value)
      VALUES ('last_cleanup', ${DateTime.now().toISO()})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
    `
  })
}
