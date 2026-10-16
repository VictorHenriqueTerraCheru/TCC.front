import { Circle, CircleMarker } from 'react-leaflet'

import type { Posicao } from '@/features/localizacao'

/** Ponto verde da posição atual + círculo de precisão. */
export function MarcadorUsuario({ posicao }: { posicao: Posicao }) {
  const centro: [number, number] = [posicao.lat, posicao.lng]
  return (
    <>
      {posicao.precisao > 20 && (
        <Circle
          center={centro}
          radius={posicao.precisao}
          interactive={false}
          pathOptions={{ color: '#046d4e', weight: 1, opacity: 0.3, fillOpacity: 0.08 }}
        />
      )}
      <CircleMarker
        center={centro}
        radius={7}
        interactive={false}
        pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#046d4e', fillOpacity: 1 }}
      />
    </>
  )
}
