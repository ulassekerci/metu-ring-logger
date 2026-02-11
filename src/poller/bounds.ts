import { checkBounds } from '../data/campus'
import { RingTrip } from '../entities/Trip'

export const checkTripBounds = (trip: RingTrip) => {
  const isParked = checkIfParked(trip)
  const hasLeftCampus = checkIfLeftCampus(trip)

  return { isParked, hasLeftCampus }
}

const checkIfParked = (trip: RingTrip) => {
  if (trip.duration.as('seconds') < 120) return false

  const isInGarage = checkBounds(trip.lastPoint).inGarage
  if (!isInGarage) return false

  // find the last point outside garage
  const lastOutsidePoint = trip.points.find((point) => !checkBounds(point).inGarage)
  if (!lastOutsidePoint) return true // all points are inside garage

  const lastOutsideTime = lastOutsidePoint.serviceTime.seconds
  const lastPointTime = trip.lastPoint.serviceTime.seconds
  if (lastPointTime - lastOutsideTime < 120) return false

  return true
}

const checkIfLeftCampus = (trip: RingTrip) => {
  // check if last 5 points are outside campus
  const last5Points = trip.points.slice(-5)
  for (const point of last5Points) {
    const isInCampus = checkBounds(point).inMETU
    if (isInCampus) return false
  }
  return true
}
