import { Layer, Marker, Source } from '@vis.gl/react-maplibre'
import { useMemo } from 'react'

import { circleGeoJson } from '@/common/lib/geo'
import type { Position } from '@/features/localizacao'

export function UserMarker({ position }: { position: Position }) {
  const accuracy = useMemo(
    () => (position.accuracy > 20 ? circleGeoJson(position, position.accuracy) : null),
    [position],
  )
  return (
    <>
      {accuracy && (
        <Source id="user-accuracy" type="geojson" data={accuracy}>
          <Layer
            id="user-accuracy"
            type="fill"
            paint={{ 'fill-color': '#3b9eff', 'fill-opacity': 0.12 }}
          />
          <Layer
            id="user-accuracy-border"
            type="line"
            paint={{ 'line-color': '#3b9eff', 'line-opacity': 0.35, 'line-width': 1 }}
          />
        </Source>
      )}
      <Marker latitude={position.lat} longitude={position.lng} anchor="center">
        <span
          aria-hidden="true"
          className="block size-[18px] rounded-full border-[3px] border-white bg-primario shadow-[0_0_0_6px_rgba(59,158,255,.18)]"
        />
      </Marker>
    </>
  )
}
