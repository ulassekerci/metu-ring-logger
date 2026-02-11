import { RingPoint } from '../entities/Point'
import { RingTrip, RingTripError } from '../entities/Trip'
import { RingRow } from '../interfaces/ring'
import sql from '../utils/db'

export const getLastTrip = async (plate: string) => {
  const lastTripRows = await sql<RingRow[]>`
    SELECT * FROM ring_history
    WHERE plate = ${plate}
    AND trip_id = (
      SELECT trip_id from ring_history
      WHERE plate = ${plate}
      ORDER BY "timestamp" DESC
      LIMIT 1
    )
    ORDER BY "timestamp" DESC
  `

  const tripID = lastTripRows[0]?.trip_id
  const lastTripPoints = lastTripRows.map((row) => RingPoint.fromDb(row))

  try {
    return new RingTrip(tripID, lastTripPoints)
  } catch (error) {
    if (!(error instanceof RingTripError)) throw error
    // no need to log
    if (error.problem === 'no_rows') return null
    // log other errors then throw
    const tripID = lastTripRows[0]?.trip_id
    console.error(`Error creating trip object with id: ${tripID}`, error.message)
    throw error
  }
}
