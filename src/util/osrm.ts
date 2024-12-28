import axios from 'axios'

interface LatLng {
  lat: number
  lng: number
}

const getDistance = async (from: LatLng, to: LatLng): Promise<number> => {
  const response = await axios.get(
    `${process.env.OSRM}/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false&generate_hints=false`
  )
  return response.data.routes[0].distance
}

export const osrm = {
  getDistance,
}
