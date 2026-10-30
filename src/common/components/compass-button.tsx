import { useMap } from '@vis.gl/react-maplibre'
import { useEffect, useState } from 'react'

import { cn } from '@/common/lib/utils'

const DEGREE_TOLERANCE = 0.5
const CARDINAL_POINTS = ['N', 'L', 'S', 'O'] as const
const DASHES = Array.from({ length: 11 }, (_, i) => (i + 1) * 30)

function cardinalPoint(rotation: number) {
  const degrees = ((rotation % 360) + 360) % 360
  return CARDINAL_POINTS[Math.round(degrees / 90) % 4]
}

export function CompassButton({ className }: { className?: string }) {
  const { current: map } = useMap()
  const [vista, setVista] = useState({ rotation: 0, pitch: 0 })

  useEffect(() => {
    if (!map) return
    const update = () => setVista({ rotation: map.getBearing(), pitch: map.getPitch() })
    update()
    map.on('rotate', update)
    map.on('pitch', update)
    return () => {
      map.off('rotate', update)
      map.off('pitch', update)
    }
  }, [map])

  if (Math.abs(vista.rotation) < DEGREE_TOLERANCE && vista.pitch < DEGREE_TOLERANCE) return null

  return (
    <button
      type="button"
      aria-label="Apontar para o norte"
      onClick={() => map?.resetNorthPitch()}
      className={cn(
        'absolute z-[1000] flex size-11 pressable animate-in items-center justify-center rounded-full shadow-2 glass duration-200 fade-in-0 zoom-in-75 focus-visible:outline-2 motion-reduce:animate-none',
        className,
      )}
    >
      <svg
        data-display
        aria-hidden="true"
        viewBox="0 0 44 44"
        className="absolute inset-0 size-full"
        style={{ transform: `rotate(${-vista.rotation}deg)` }}
      >
        {DASHES.map((angle) => (
          <line
            key={angle}
            x1="22"
            y1={angle % 90 === 0 ? 4.5 : 5.5}
            x2="22"
            y2="8"
            stroke="var(--muted-foreground)"
            strokeWidth={angle % 90 === 0 ? 1.6 : 1}
            strokeLinecap="round"
            transform={`rotate(${angle} 22 22)`}
          />
        ))}
        <path d="M22 2.5 25 8H19Z" fill="#ff3b30" />
      </svg>
      <span aria-hidden="true" className="relative text-[17px] leading-none font-bold">
        {cardinalPoint(vista.rotation)}
      </span>
    </button>
  )
}
