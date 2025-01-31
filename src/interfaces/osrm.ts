export interface LatLng {
  lat: number | string
  lng: number | string
}

export interface OSRMTable {
  code: string
  distances: number[][]
  destinations: TableDestination[]
  sources: TableSource[]
}

export interface TableDestination {
  distance: number
  name: string
  location: number[]
}

export interface TableSource {
  distance: number
  name: string
  location: number[]
}
