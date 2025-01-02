import { DateTime } from 'luxon'
import { FormattedTrip } from '../interfaces'
import outliers from 'outliers'

export const findAverageTrip = (trips: FormattedTrip[], departure: string) => {
  const departureTrips = trips
    .filter((trip) => trip.departure === departure)
    .map((trip) => {
      const departureTime = DateTime.fromFormat(trip.departure, 'HH.mm')
      const redPoints = trip.points.filter((point) => point.color === '#ff0000')
      const firstRedPoint = redPoints.reverse()[0]
      const tripEnd = DateTime.fromJSDate(new Date(firstRedPoint.timestamp))
      return { ...trip, durationToSouth: tripEnd.diff(departureTime, 'seconds').seconds }
    })
  const filteredTrips = departureTrips.filter(outliers('durationToSouth'))
  const totalDuration = filteredTrips.reduce((acc, trip) => acc + trip.durationToSouth, 0)
  const averageDuration = totalDuration / filteredTrips.length
  const tripClosestToAverage = departureTrips.reduce((acc, trip) => {
    const tripDiff = Math.abs(trip.durationToSouth - averageDuration)
    const accDiff = Math.abs(acc.durationToSouth - averageDuration)
    return tripDiff < accDiff ? trip : acc
  })
  return tripClosestToAverage
}
