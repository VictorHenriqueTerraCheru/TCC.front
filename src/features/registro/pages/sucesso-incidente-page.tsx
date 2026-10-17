import { useLocation } from 'react-router'

import type { AreaIncidentesDados } from '@/features/incidentes'

import { TelaSucesso } from './sucesso-page'

// Rótulo no plural por categoria de incidente (seed fixo).
const plural: Record<number, string> = { 7: 'Roubos', 8: 'Acidentes' }

/** Tela 21c: o relato entra no calor da área (resumo da resposta do POST). */
export function SucessoIncidentePage() {
  const { state } = useLocation()
  const { area, categoriaId, rotuloArea, bairro, ponto } = (state ?? {}) as {
    area?: AreaIncidentesDados
    categoriaId?: number
    rotuloArea?: string | null
    bairro?: string | null
    ponto?: { lat: number; lng: number }
  }
  const contagem = area?.contagens.find((c) => c.categoriaId === categoriaId)
  const verNoMapa = ponto
    ? `/mapa/area?modo=incidentes&lat=${ponto.lat.toFixed(5)}&lng=${ponto.lng.toFixed(5)}`
    : '/mapa?modo=incidentes'

  return (
    <TelaSucesso
      titulo="Relato enviado"
      texto={`Obrigado. Seu relato já faz parte do mapa de calor${bairro ? ` de ${bairro}` : ''}, de forma anônima. Ele não aparece como marcador e não recebe votos.`}
      verNoMapa={verNoMapa}
      cartao={
        contagem && (
          <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4">
            <span
              aria-hidden="true"
              className="size-10 shrink-0 rounded-full blur-[1px]"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #ffd60a, #ff3b30 35%, #c026d3 60%, #5b2bff 85%)',
              }}
            />
            <div className="min-w-0">
              <p className="font-medium">{rotuloArea ?? 'Área do relato'}</p>
              <p className="text-xs text-muted-foreground">
                {plural[contagem.categoriaId] ?? contagem.nome} · {contagem.dias7}{' '}
                {contagem.dias7 === 1 ? 'relato' : 'relatos'} nos últimos 7 dias
              </p>
            </div>
          </div>
        )
      }
    />
  )
}
