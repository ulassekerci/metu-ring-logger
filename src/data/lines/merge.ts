import { booleanEqual, lineString, point } from '@turf/turf'
import { Feature, GeoJsonProperties, LineString } from 'geojson'

export const mergeSections = (lineSections: Feature<LineString, GeoJsonProperties>[]) => {
  if (lineSections.length === 0) throw new Error('At least one line section is required')
  if (lineSections.length === 1) return lineSections[0]

  const firstSection = lineSections[0]
  const otherSections = lineSections.slice(1)

  let mergedCoords = [...firstSection.geometry.coordinates]

  otherSections.forEach((section) => {
    const currentCoords = section.geometry.coordinates

    const lastPoint = point(mergedCoords.at(-1)!)
    const firstPoint = point(currentCoords[0])
    const isDuplicate = booleanEqual(lastPoint, firstPoint)

    if (isDuplicate) {
      mergedCoords = [...mergedCoords, ...currentCoords.slice(1)]
    } else {
      mergedCoords = [...mergedCoords, ...currentCoords]
    }
  })

  return lineString(mergedCoords)
}
