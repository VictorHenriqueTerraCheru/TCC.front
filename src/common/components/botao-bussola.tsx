import { useMap } from '@vis.gl/react-maplibre'
import { useEffect, useState } from 'react'

import { cn } from '@/common/lib/utils'

const TOLERANCIA_GRAUS = 0.5
const PONTOS_CARDEAIS = ['N', 'L', 'S', 'O'] as const
const TRACOS = Array.from({ length: 11 }, (_, i) => (i + 1) * 30)

function pontoCardeal(giro: number) {
  const graus = ((giro % 360) + 360) % 360
  return PONTOS_CARDEAIS[Math.round(graus / 90) % 4]
}

export function BotaoBussola({ className }: { className?: string }) {
  const { current: mapa } = useMap()
  const [vista, setVista] = useState({ giro: 0, inclinacao: 0 })

  useEffect(() => {
    if (!mapa) return
    const atualizar = () => setVista({ giro: mapa.getBearing(), inclinacao: mapa.getPitch() })
    atualizar()
    mapa.on('rotate', atualizar)
    mapa.on('pitch', atualizar)
    return () => {
      mapa.off('rotate', atualizar)
      mapa.off('pitch', atualizar)
    }
  }, [mapa])

  if (Math.abs(vista.giro) < TOLERANCIA_GRAUS && vista.inclinacao < TOLERANCIA_GRAUS) return null

  return (
    <button
      type="button"
      aria-label="Apontar para o norte"
      onClick={() => mapa?.resetNorthPitch()}
      className={cn(
        'absolute z-[1000] flex size-11 pressionavel animate-in items-center justify-center rounded-full shadow-2 vidro duration-200 fade-in-0 zoom-in-75 focus-visible:outline-2 motion-reduce:animate-none',
        className,
      )}
    >
      <svg
        data-mostrador
        aria-hidden="true"
        viewBox="0 0 44 44"
        className="absolute inset-0 size-full"
        style={{ transform: `rotate(${-vista.giro}deg)` }}
      >
        {TRACOS.map((angulo) => (
          <line
            key={angulo}
            x1="22"
            y1={angulo % 90 === 0 ? 4.5 : 5.5}
            x2="22"
            y2="8"
            stroke="var(--muted-foreground)"
            strokeWidth={angulo % 90 === 0 ? 1.6 : 1}
            strokeLinecap="round"
            transform={`rotate(${angulo} 22 22)`}
          />
        ))}
        <path d="M22 2.5 25 8H19Z" fill="#ff3b30" />
      </svg>
      <span aria-hidden="true" className="relative text-[17px] leading-none font-bold">
        {pontoCardeal(vista.giro)}
      </span>
    </button>
  )
}
