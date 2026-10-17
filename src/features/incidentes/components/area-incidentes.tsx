import type { MaterialSymbol } from 'material-symbols'

import { Icone } from '@/common/components/icone'
import { horaCurta } from '@/common/lib/formatacao'
import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'
import { useEnderecoReverso } from '@/features/geocodificacao'

import { useAreaIncidentes } from '../api/use-area-incidentes'
import { gradienteCalor } from '../models/calor'
import type { NivelConcentracao } from '../models/incidente'

const nivel: Record<NivelConcentracao, { rotulo: string; cor: string }> = {
  baixa: { rotulo: 'Concentração baixa', cor: gradienteCalor[0.4]! },
  media: { rotulo: 'Concentração média', cor: gradienteCalor[0.6]! },
  alta: { rotulo: 'Concentração alta', cor: gradienteCalor[1]! },
}

// Rótulo no plural e ícone por categoria de incidente (seed fixo).
const linhas: Record<number, { rotulo: string; icone: MaterialSymbol }> = {
  7: { rotulo: 'Roubos', icone: 'error' },
  8: { rotulo: 'Acidentes', icone: 'car_crash' },
}

/** Tela 4: resumo dos incidentes num raio de 400 m. Área e endereço são buscados em paralelo. */
export function AreaIncidentes({ lat, lng }: { lat: number; lng: number }) {
  const area = useAreaIncidentes(lat, lng)
  const endereco = useEnderecoReverso({ lat, lng })

  const titulo = endereco.data?.rotuloArea ?? (endereco.data ? 'Área selecionada' : null)

  if (area.isError) {
    return (
      <div role="alert" className="space-y-3 py-6 pr-10">
        <p>Não foi possível carregar os incidentes desta área.</p>
        <Button variant="outline" size="sm" onClick={() => void area.refetch()}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <article className="space-y-4">
      <header className="flex items-center gap-3 pr-10">
        <span
          aria-hidden="true"
          className="size-12 shrink-0 rounded-full blur-[1px]"
          style={{
            backgroundImage: `radial-gradient(circle, ${gradienteCalor[1]}, ${gradienteCalor[0.6]} 45%, ${gradienteCalor[0.2]} 75%)`,
          }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">Área de incidentes</p>
          {titulo ? (
            <h2 className="text-[22px] leading-7">{titulo}</h2>
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
              Raio aprox. {area.data.raioMetros} m · atualizado às{' '}
              {horaCurta(area.data.atualizadoEm)}
            </p>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-input px-2.5 py-1 text-xs font-medium">
              <span
                className="size-2.5 rounded-full"
                style={{ background: nivel[area.data.nivel].cor }}
              />
              {nivel[area.data.nivel].rotulo}
            </span>
          </div>

          <table className="w-full overflow-hidden rounded-2xl border border-border/60 bg-card text-left">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="px-4 pt-3 pb-2 font-medium">Tipo</th>
                <th className="px-2 pt-3 pb-2 text-right font-medium">7 dias</th>
                <th className="px-4 pt-3 pb-2 text-right font-medium">30 dias</th>
              </tr>
            </thead>
            <tbody>
              {area.data.contagens.map((c) => (
                <tr key={c.categoriaId} className="border-t border-border/60">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-3">
                      <Icone
                        nome={linhas[c.categoriaId]?.icone ?? 'error'}
                        className="text-[20px] text-muted-foreground"
                      />
                      {linhas[c.categoriaId]?.rotulo ?? c.nome}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-right text-2xl">{c.dias7}</td>
                  <td className="px-4 py-3 text-right text-2xl">{c.dias30}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <p className="flex gap-3 rounded-2xl bg-superficie-2 p-3 text-xs text-muted-foreground">
        <Icone nome="info" className="text-[18px]" />
        Incidentes são pontuais: aparecem apenas agregados, sem local exato, e não recebem votos de
        "continua lá".
      </p>
    </article>
  )
}
