import * as turf from '@turf/turf'
import { RingPoint } from '../entities/Point'

export const metuPolygon = turf.polygon([
  [
    [32.7623, 39.9091],
    [32.7879, 39.9098],
    [32.7987, 39.8825],
    [32.7661, 39.8818],
    [32.7623, 39.9091],
  ],
])

export const yapiIsleriPolygon = turf.polygon([
  [
    [32.7682, 39.9062],
    [32.7705, 39.9073],
    [32.7733, 39.9044],
    [32.7708, 39.9031],
    [32.7682, 39.9062],
  ],
])

export const checkBounds = (point: RingPoint | number[]) => {
  const turfPoint = point instanceof RingPoint ? point.turfPoint : turf.point(point)
  const isInMetu = turf.booleanPointInPolygon(turfPoint, metuPolygon)
  const isInGarage = turf.booleanPointInPolygon(turfPoint, yapiIsleriPolygon)
  return { inMETU: isInMetu, inGarage: isInGarage, leftCampus: !isInMetu }
}
