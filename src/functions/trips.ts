import { DateTime } from 'luxon'
import { FormattedTrip, RingLog } from '../interfaces/ring'
import sql from '../util/db'
import { predictDeparture } from './schedule'

export const queryTrip = async (tripID: string) => {
  return await sql<RingLog[]>`
    SELECT * FROM ring_history
    WHERE trip_id = ${tripID}
    ORDER BY timestamp DESC`
}

export const queryTrips = async ({ start, end }: { start: DateTime; end: DateTime }) => {
  // Start time is 3 AM to remove previous day's trips
  // End time is 3 AM of the next day to include all trips of the end day
  const startWithTime = start.set({ hour: 3 })
  const endWithTime = end.plus({ days: 1 }).set({ hour: 3 })
  return await sql<RingLog[]>`
    SELECT * FROM ring_history
    WHERE timestamp >= ${startWithTime.toJSDate()}
    AND timestamp <= ${endWithTime.toJSDate()}
    ORDER BY timestamp DESC`
}

export const formatRingData = (ringData: RingLog[], filterLive?: boolean) => {
  const ringTripIDs = [...new Set(ringData.map((log) => log.trip_id))]
  return ringTripIDs
    .map((tripID) => {
      const tripLogs = ringData.filter((log) => log.trip_id === tripID)
      const tripStart = DateTime.fromJSDate(new Date(tripLogs[tripLogs.length - 1].timestamp))
      const tripEnd = DateTime.fromJSDate(new Date(tripLogs[0].timestamp))
      const tripDuration = tripEnd.diff(tripStart, 'seconds').seconds
      const ringDeparture = predictDeparture(tripStart, tripLogs[0].color)
      return {
        tripID,
        departure: ringDeparture.toFormat('HH.mm'),
        duration: tripDuration,
        plate: tripLogs[0].plate,
        points: tripLogs,
        day: tripStart.weekday,
        live: filterLive ? tripEnd.diffNow('minutes').minutes > -3 : undefined,
      }
    })
    .filter((trip) => (filterLive ? !trip.live : true)) as FormattedTrip[]
}
