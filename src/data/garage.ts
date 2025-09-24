import * as turf from '@turf/turf'

const garageSouth = [32.770092, 39.903908] // south
const garageNorth = [32.770458, 39.90715] // north
const garageEast = [32.77249, 39.905048] // east
const garageWest = [32.768286, 39.906085] // west

export const garagePolygon = turf.polygon([[garageSouth, garageNorth, garageEast, garageWest]])
