import { RingLine } from '../../entities/Line'
import { RingPoint } from '../../entities/Point'
import { RouteSection } from '../../interfaces/line'
import * as turf from '@turf/turf'

export const getDistanceTraveled = (point: RingPoint, line: RingLine) => {
  const stopIndex = point.stopIndex
  if (!stopIndex) return 0

  let section: RouteSection | null = null
  let checkedLenght = 0
  for (const sec of line.sections) {
    if (stopIndex < sec.stops.length + checkedLenght) {
      section = sec
      break
    }
    checkedLenght += sec.stops.length
  }
  if (!section) return 0

  const sectionIndex = line.sections.findIndex((sec) => sec.name === section.name)
  const prevSections = line.sections.slice(0, sectionIndex)
  const prevSectionsLength = prevSections.reduce((acc, curr) => {
    const currLength = turf.length(curr.polyline, { units: 'meters' })
    return acc + currLength
  }, 0)
  const pointOnLine = turf.nearestPointOnLine(section.polyline, point.turfPoint)
  const sectionTraveled = turf.lineSplit(section.polyline, pointOnLine).features[0]
  const sectionTraveledLength = turf.length(sectionTraveled, { units: 'meters' })
  const totalDistance = prevSectionsLength + sectionTraveledLength
  return totalDistance
}
