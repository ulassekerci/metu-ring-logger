import { DateTime } from 'luxon'
import { FormattedTrip } from '../interfaces'

export const findAverageTrip = (trips: FormattedTrip[], departure: string) => {
  const departureTrips = trips
    .filter((trip) => trip.departure === departure)
    .map((trip) => {
      const departureTime = DateTime.fromFormat(trip.departure, 'HH.mm')
      const tripEndPoint = trip.points.filter(
        (point) =>
          point.address === 'ODTU A1 Kapisi' ||
          point.address === 'ODTU A2 Kapisi' ||
          point.address === 'Garajlar' ||
          point.address === 'BOTE-MYO'
      )
      const tripEnd = DateTime.fromJSDate(new Date(tripEndPoint.reverse()[0].timestamp))
      return { ...trip, durationFromDeparture: tripEnd.diff(departureTime, 'seconds').seconds }
    })

  const sortedTrips = departureTrips.sort((a, b) => a.durationFromDeparture - b.durationFromDeparture)
  const medianIndex = Math.floor(sortedTrips.length / 2)
  return sortedTrips[medianIndex]
}
