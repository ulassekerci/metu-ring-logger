import { Feature, Point } from 'geojson'

const earthRadius = 6371000
const deg = Math.PI / 180

export const fast100mCheck = (point1: Feature<Point>, point2: Feature<Point>) => {
  const [lon1, lat1] = point1.geometry.coordinates
  const [lon2, lat2] = point2.geometry.coordinates

  const x = (lon2 - lon1) * Math.cos(((lat1 + lat2) * deg) / 2)
  const y = lat2 - lat1
  const d2 = (x * x + y * y) * deg * deg * earthRadius * earthRadius
  return d2 < 100 * 100
}
