import { Layer, Marker, Source } from '@vis.gl/react-maplibre'
import { useMemo } from 'react'

import { circuloGeoJson } from '@/common/lib/geo'
import type { Posicao } from '@/features/localizacao'

/** Ponto azul da posição atual com halo + círculo de precisão (quando passa de 20 m). */
export function MarcadorUsuario({ posicao }: { posicao: Posicao }) {
  const precisao = useMemo(
    () => (posicao.precisao > 20 ? circuloGeoJson(posicao, posicao.precisao) : null),
    [posicao],
  )
  return (
    <>
      {precisao && (
        <Source id="precisao-usuario" type="geojson" data={precisao}>
          <Layer
            id="precisao-usuario"
            type="fill"
            paint={{ 'fill-color': '#3b9eff', 'fill-opacity': 0.12 }}
          />
          <Layer
            id="precisao-usuario-borda"
            type="line"
            paint={{ 'line-color': '#3b9eff', 'line-opacity': 0.35, 'line-width': 1 }}
          />
        </Source>
      )}
      <Marker latitude={posicao.lat} longitude={posicao.lng} anchor="center">
        <span
          aria-hidden="true"
          className="block size-[18px] rounded-full border-[3px] border-white bg-primario shadow-[0_0_0_6px_rgba(59,158,255,.18)]"
        />
      </Marker>
    </>
  )
}
