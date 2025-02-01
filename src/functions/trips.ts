import { DateTime } from 'luxon'
import { FormattedTrip, RingLog } from '../interfaces/ring'
import sql from '../util/db'

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
      const ringTime = calculateDeparture(tripStart, tripLogs[0].color)
      return {
        tripID,
        departure: ringTime.toFormat('HH.mm'),
        duration: tripDuration,
        plate: tripLogs[0].plate,
        points: tripLogs,
        day: tripStart.weekday,
        live: filterLive ? tripEnd.diffNow('minutes').minutes > -3 : undefined,
      }
    })
    .filter((trip) => (filterLive ? !trip.live : true)) as FormattedTrip[]
}

export const calculateDeparture = (tripStart: DateTime, ringColor: string) => {
  const closestNthMinute = (n: number) => Math.round(tripStart.minute / n) * n
  const isYellowRed = ringColor === '#ffff57' || ringColor === '#ff0000'
  const isPurple = ringColor === '#9600CD'
  const isBrown = ringColor === '#A64D00'
  const isGray = ringColor === '#737373'
  const departureTimeObject = { minute: 0, second: 0 }
  // TODO: yellow-red last 2 trips are not at 20th minute (17.05 and 17.35) - put a check for that
  // THERE IS NO 17.20 TRIP - THIS CREATES DUPLICATE GHOSTS
  if (isYellowRed) departureTimeObject.minute = closestNthMinute(20)
  if (isBrown) departureTimeObject.minute = closestNthMinute(20)
  if (isGray) departureTimeObject.minute = closestNthMinute(30)
  if (isPurple) {
    // Purple ring departs every 40 minutes starting at 20.30
    // This finds the closest departure time to the trip start minutes
    // It'd be better to check the hour as well (probably not necessary)
    const purpleTimes = [10, 30, 50]
    const closestTime = purpleTimes.reduce((prev, curr) =>
      Math.abs(curr - tripStart.minute) < Math.abs(prev - tripStart.minute) ? curr : prev
    )
    departureTimeObject.minute = closestTime
  }

  return tripStart.set(departureTimeObject)
}
