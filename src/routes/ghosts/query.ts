import { RingPoint } from '../../entities/Point'
import { ServiceTime } from '../../entities/ServiceTime'
import { RingTrip } from '../../entities/Trip'
import { RingRow } from '../../interfaces/ring'
import sql from '../../utils/db'

export const queryTrips = async () => {
  const serviceTime = ServiceTime.now()
  const serviceSeconds = serviceTime.seconds
  const isWeekend = serviceTime.isWeekend

  const rows = await sql<RingRow[]>`
    SELECT *
    FROM ring_history
    WHERE trip_id IN (
      SELECT trip_id
      FROM ring_history
      WHERE service_time
        BETWEEN ${serviceSeconds} - 60
        AND ${serviceSeconds} + 60
      AND color ${isWeekend ? sql`=` : sql`!=`} '#737373'
      AND "timestamp" < (
        SELECT (value #>> '{}')::timestamptz
        FROM stats
        WHERE key = 'last_cleanup'
      )
    )
    ORDER BY "timestamp" DESC;
  `

  const tripIDs = new Set<string>()
  rows.forEach((row) => tripIDs.add(row.trip_id))

  const trips = [...tripIDs].map((tripID) => {
    const tripRows = rows.filter((row) => row.trip_id === tripID)
    const tripPoints = tripRows.map((row) => RingPoint.fromDb(row))
    return new RingTrip(tripID, tripPoints)
  })

  const usableTrips = trips.filter((trip) => !trip.isPartial)
  usableTrips.forEach((trip) => trip.estimateProgress())

  return usableTrips
}
