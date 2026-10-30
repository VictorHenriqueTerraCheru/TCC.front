import { Icon } from '@/common/components/icon'
import { DynamicIcon } from '@/common/components/remote-icon'
import { shortTime } from '@/common/lib/formatting'
import { Skeleton } from '@/common/ui/skeleton'
import { LoadError } from '@/common/components/load-error'
import { iconOf, useCategories } from '@/features/categories'
import { useReverseGeocode } from '@/features/geocoding'

import { useIncidentArea } from '../api/use-incident-area'
import { heatmapGradient } from '../models/heatmap'
import type { ConcentrationLevel } from '../models/incident'

const level: Record<ConcentrationLevel, { label: string; color: string }> = {
  low: { label: 'Concentração baixa', color: heatmapGradient[0.4]! },
  medium: { label: 'Concentração média', color: heatmapGradient[0.6]! },
  high: { label: 'Concentração alta', color: heatmapGradient[1]! },
}

export function IncidentArea({ lat, lng }: { lat: number; lng: number }) {
  const area = useIncidentArea(lat, lng)
  const address = useReverseGeocode({ lat, lng })
  const categories = useCategories()
  const iconFor = (id: number) => {
    const category = categories.data?.find((c) => c.id === id)
    return category ? iconOf(category) : 'error'
  }

  const title = address.data?.areaLabel ?? (address.data ? 'Área selecionada' : null)

  if (area.isError) {
    return (
      <LoadError
        message="Não foi possível carregar os incidentes desta área."
        onRetry={() => void area.refetch()}
        className="pr-10"
      />
    )
  }

  return (
    <article className="space-y-4">
      <header className="flex items-center gap-3 pr-10">
        <span
          aria-hidden="true"
          className="size-12 shrink-0 rounded-full blur-[1px]"
          style={{
            backgroundImage: `radial-gradient(circle, ${heatmapGradient[1]}, ${heatmapGradient[0.6]} 45%, ${heatmapGradient[0.2]} 75%)`,
          }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">Área de incidentes</p>
          {title ? (
            <h2 className="text-[22px] leading-7">{title}</h2>
          ) : (
            <Skeleton className="mt-1 h-7 w-48 bg-muted" />
          )}
        </div>
      </header>

      {area.isPending ? (
        <Skeleton aria-label="Carregando incidentes" className="h-40 rounded-2xl bg-muted" />
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Raio aprox. {area.data.radiusMeters} m · atualizado às{' '}
              {shortTime(area.data.updatedAt)}
            </p>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-input px-2.5 py-1 text-xs font-medium">
              <span
                className="size-2.5 rounded-full"
                style={{ background: level[area.data.level].color }}
              />
              {level[area.data.level].label}
            </span>
          </div>

          <table className="w-full overflow-hidden rounded-2xl border border-border/60 bg-card text-left shadow-1">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="px-4 pt-3 pb-2 font-medium">Tipo</th>
                <th className="px-2 pt-3 pb-2 text-right font-medium">7 dias</th>
                <th className="px-4 pt-3 pb-2 text-right font-medium">30 dias</th>
              </tr>
            </thead>
            <tbody>
              {area.data.counts.map((c) => (
                <tr key={c.categoryId} className="border-t border-border/60">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-3">
                      <DynamicIcon
                        name={iconFor(c.categoryId)}
                        className="text-[20px] text-muted-foreground"
                      />
                      {c.name}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-right text-2xl">{c.days7}</td>
                  <td className="px-4 py-3 text-right text-2xl">{c.days30}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <p className="flex gap-3 rounded-2xl bg-surface-2 p-3 text-xs text-muted-foreground">
        <Icon name="info" className="text-[18px]" />
        Incidentes são pontuais: aparecem apenas agregados, sem local exato, e não recebem votos de
        "Ainda está lá?".
      </p>
    </article>
  )
}
