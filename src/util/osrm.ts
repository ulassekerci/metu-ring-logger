import axios from 'axios'
import { LatLng, OSRMTable } from '../interfaces/osrm'

const osrmAPI = axios.create({
  baseURL: process.env.OSRM,
})

const getDistance = async (from: LatLng, to: LatLng): Promise<number> => {
  const input = `${from.lng},${from.lat};${to.lng},${to.lat}`
  const options = 'overview=false&generate_hints=false'
  const response = await osrmAPI.get(`/route/v1/driving/${input}?${options}`)
  return response.data.routes[0].distance
}

const getTable = async (points: LatLng[]) => {
  const input = points.map((point) => `${point.lng},${point.lat}`).join(';')
  const options = 'generate_hints=false&annotations=distance'
  const response = await osrmAPI.get<OSRMTable>(`/table/v1/driving/${input}?${options}`)
  return response.data
}

const getDistances = async (source: LatLng, destinations: LatLng[]) => {
  const input = [source, ...destinations].map((item) => `${item.lng},${item.lat}`).join(';')
  const options = 'sources=0&generate_hints=false&annotations=distance'
  const response = await osrmAPI.get<OSRMTable>(`/table/v1/driving/${input}?${options}`)
  return response.data
}

export const osrm = {
  getDistance,
  getTable,
  getDistances,
}
