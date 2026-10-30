import type { ReactNode } from 'react'

import { Icon } from '@/common/components/icone'
import { colorAppearance } from '@/features/categorias'
import { heatmapGradientCss } from '@/features/incidentes'
import { markerSize, IssueMarker } from '@/features/problemas'

import type { MapMode } from '../models/filtros'

function Bubble({
  status = 'active',
  band = 'high',
  scale = 0.72,
}: {
  status?: 'active' | 'possiblyResolved'
  band?: 'high' | 'low'
  scale?: number
}) {
  const { width, height } = markerSize(status, band)
  return (
    <span
      className="pointer-events-none block"
      style={{ width: width * scale, height: height * scale }}
    >
      <span
        className="block origin-top-left [&_.pulso-alerta]:hidden"
        style={{ transform: `scale(${scale})` }}
      >
        <IssueMarker
          color={colorAppearance.orange.strongColor}
          icon="edit_road"
          status={status}
          band={band}
        />
      </span>
    </span>
  )
}

function Item({ symbol, title, text }: { symbol: ReactNode; title: string; text?: string }) {
  return (
    <li className="flex gap-2.5">
      <span className="flex w-7 shrink-0 items-start justify-center pt-0.5">{symbol}</span>
      <span>
        <span className="block text-[13px] font-medium">{title}</span>
        {text && <span className="block text-xs text-muted-foreground">{text}</span>}
      </span>
    </li>
  )
}

export function MapLegend({ mode, onClose }: { mode: MapMode; onClose(): void }) {
  const withHeatmap = mode !== 'issues'
  const title = withHeatmap ? 'Como ler o mapa' : 'Estado do problema'

  return (
    <section
      aria-label={title}
      className="pointer-events-auto w-60 rounded-[22px] p-4 shadow-3 vidro"
    >
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar legenda"
          className="-m-2.5 flex size-11 pressionavel items-center justify-center rounded-full hover:bg-foreground/5 focus-visible:outline-2"
        >
          <Icon name="close" className="text-[18px]" />
        </button>
      </header>
      {withHeatmap ? (
        <ul className="space-y-3">
          {mode === 'both' && (
            <Item
              symbol={<Bubble />}
              title="Problema · marcador"
              text="Fica no mapa até ser resolvido"
            />
          )}
          <Item
            symbol={<span className="mt-0.5 size-4 rounded-full bg-calor blur-[1px]" />}
            title="Incidente · calor"
            text="Concentração nos últimos 7 dias"
          />
          <li>
            <div className="h-2 rounded-full" style={{ backgroundImage: heatmapGradientCss }} />
            <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
              <span>Menos</span>
              <span>Mais</span>
            </div>
          </li>
          {mode === 'both' && (
            <Item
              symbol={
                <span className="flex items-end gap-0.5">
                  <Bubble band="low" scale={0.5} />
                  <Bubble band="high" scale={0.55} />
                </span>
              }
              title="Maior e mais cheio = mais confiável"
            />
          )}
        </ul>
      ) : (
        <ul className="space-y-3">
          <Item symbol={<Bubble />} title="Ativa" />
          <Item symbol={<Bubble status="possiblyResolved" />} title="Possivelmente resolvida" />
          <Item
            symbol={<Icon name="history" className="text-[18px] text-muted-foreground" />}
            title="Resolvidas saem do mapa e ficam só no histórico"
          />
          <Item
            symbol={
              <span className="rounded bg-nova px-1 text-[9px] leading-4 text-nova-foreground">
                Nova
              </span>
            }
            title="Em avaliação"
            text="Registro recente, com poucos votos"
          />
        </ul>
      )}
    </section>
  )
}
