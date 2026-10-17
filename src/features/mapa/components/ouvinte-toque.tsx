import { useMapEvents } from 'react-leaflet'

/** Toque no mapa fora dos marcadores (o clique no marcador não chega aqui no Leaflet). */
export function OuvinteToque({ aoTocar }: { aoTocar(lat: number, lng: number): void }) {
  useMapEvents({ click: ({ latlng }) => aoTocar(latlng.lat, latlng.lng) })
  return null
}
