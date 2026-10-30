import { useLocation } from 'react-router'

import type { IncidentAreaData } from '@/features/incidents'

import { SuccessScreen } from './issue-success-page'

const plural: Record<number, string> = { 7: 'Roubos', 8: 'Acidentes' }

export function IncidentSuccessPage() {
  const { state } = useLocation()
  const { area, categoryId, areaLabel, neighborhood, point } = (state ?? {}) as {
    area?: IncidentAreaData
    categoryId?: number
    areaLabel?: string | null
    neighborhood?: string | null
    point?: { lat: number; lng: number }
  }
  const count = area?.counts.find((c) => c.categoryId === categoryId)
  const viewOnMap = point
    ? `/map/area?mode=incidents&lat=${point.lat.toFixed(5)}&lng=${point.lng.toFixed(5)}`
    : '/map?mode=incidents'

  return (
    <SuccessScreen
      title="Relato enviado"
      text={`Obrigado. Seu relato já faz parte do mapa de calor${neighborhood ? ` de ${neighborhood}` : ''}, de forma anônima. Ele não aparece como marcador e não recebe votos.`}
      viewOnMap={viewOnMap}
      card={
        count && (
          <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-1">
            <span
              aria-hidden="true"
              className="size-10 shrink-0 rounded-full blur-[1px]"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #ffd60a, #ff3b30 35%, #c026d3 60%, #5b2bff 85%)',
              }}
            />
            <div className="min-w-0">
              <p className="font-medium">{areaLabel ?? 'Área do relato'}</p>
              <p className="text-xs text-muted-foreground">
                {plural[count.categoryId] ?? count.name} · {count.days7}{' '}
                {count.days7 === 1 ? 'relato' : 'relatos'} nos últimos 7 dias
              </p>
            </div>
          </div>
        )
      }
    />
  )
}
