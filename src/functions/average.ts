import { DateTime } from 'luxon'
import { FormattedTrip, RingLog, Stop } from '../interfaces/ring'
import outliers from 'outliers'
import { stops } from '../data/stops'

export const findAverageTrip = (trips: FormattedTrip[]) => {
  const tripsWithDuration = trips.map((trip) => calculateDuration(trip))
  // Remove outliers from trips based on duration
  const filteredTrips = tripsWithDuration.filter(outliers('durationToMiddle'))
  // Find the trip closest to the average duration
  const totalDuration = filteredTrips.reduce((acc, trip) => acc + trip.durationToMiddle, 0)
  const averageDuration = totalDuration / filteredTrips.length
  const tripClosestToAverage = filteredTrips.reduce((acc, trip) => {
    const tripDiff = Math.abs(trip.durationToMiddle - averageDuration)
    const accDiff = Math.abs(acc.durationToMiddle - averageDuration)
    return tripDiff < accDiff ? trip : acc
  })
  return tripClosestToAverage
}

const calculateDuration = (trip: FormattedTrip) => {
  // Calculate the duration from departure to the middle stop
  // and add it to the trip object
  // TODO: I used middle stop because last stop is also the first stop
  // not sure if it's a good idea
  const departureTime = DateTime.fromFormat(trip.departure, 'HH.mm')
  const middleStop = getMiddleStop(trip.points[0].color)
  const closestPoint = findClosestPointToStop(middleStop, trip.points)
  const middleTime = DateTime.fromJSDate(new Date(closestPoint.timestamp))
  return { ...trip, durationToMiddle: middleTime.diff(departureTime, 'seconds').seconds }
}

const getMiddleStop = (colorCode: string) => {
  // Find the middle stop of the ring based on the color code
  // uses devrim as a fallback middle point
  const east = stops.find((stop) => stop.name === 'Doğu Yurtlar')!
  const west = stops.find((stop) => stop.name === 'Uzay Havacılık')!
  const chem = stops.find((stop) => stop.name === 'Kimya Mühendisliği')!
  const A1 = stops.find((stop) => stop.name === 'A1 Kapısı')!
  const devrim = stops.find((stop) => stop.name === 'Devrim Kavşağı')!

  const isYellowRed = colorCode === '#ffff57' || colorCode === '#ff0000'
  const isPurple = colorCode === '#9600CD'
  const isBrown = colorCode === '#A64D00'
  const isGray = colorCode === '#737373'

  if (isYellowRed) return east
  if (isPurple) return west
  if (isBrown) return chem
  if (isGray) return A1
  return devrim
}

const findClosestPointToStop = (stop: Stop, points: RingLog[]) => {
  const closestPoint = points.reduce((acc, point) => {
    const stopLat = stop.lat
    const stopLng = stop.lng
    const pointLat = Number(point.lat)
    const pointLng = Number(point.lng)
    const accLat = Number(acc.lat)
    const accLng = Number(acc.lng)
    const pointDiff = Math.abs(pointLat - stopLat) + Math.abs(pointLng - stopLng)
    const accDiff = Math.abs(accLat - stopLat) + Math.abs(accLng - stopLng)
    return pointDiff < accDiff ? point : acc
  })
  return closestPoint
}
