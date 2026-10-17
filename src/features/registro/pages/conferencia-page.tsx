import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { Icone } from '@/common/components/icone'
import { distanciaTexto, tempoRelativo } from '@/common/lib/formatacao'
import { cn } from '@/common/lib/utils'
import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'
import { CategoriaIcone } from '@/features/categorias'
import { detalheProblemaQuery, useVotarExistencia } from '@/features/problemas'
import type { Schema } from '@/infrastructure/api'

import { duplicatasQuery } from '../api/use-registro'
import { mensagemErroRegistro } from '../errors'
import { MapaRegistro } from '../components/mapa-registro'
import { PassoRegistro } from '../components/passo-registro'
import { useExigirPasso, useRascunho } from '../hooks/use-rascunho'

type Duplicata = Schema<'BuscarDuplicatasResponse'>

const rotuloFaixa = { alta: 'Confiança alta', media: 'Confiança média', baixa: 'Confiança baixa' }

function CartaoDuplicata({
  duplicata,
  selecionada,
  aoEscolher,
}: {
  duplicata: Duplicata
  selecionada: boolean
  aoEscolher?(): void
}) {
  return (
    <button
      type="button"
      onClick={aoEscolher}
      aria-pressed={aoEscolher ? selecionada : undefined}
      disabled={!aoEscolher}
      className={cn(
        'flex w-full gap-3 rounded-2xl border bg-card p-3 text-left disabled:opacity-100',
        selecionada ? 'border-primary' : 'border-border/60',
      )}
    >
      <CategoriaIcone categoria={duplicata.categoria} tamanho="sm" />
      <div className="min-w-0 text-sm">
        <p className="font-medium">{duplicata.categoria.nome}</p>
        <p className="text-xs text-muted-foreground">
          {duplicata.endereco} · {tempoRelativo(duplicata.criadoEm)}
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-primary">
          <Icone
            nome={duplicata.faixa ? 'check_circle' : 'hourglass_top'}
            preenchido
            className="text-[16px]"
          />
          {duplicata.faixa ? rotuloFaixa[duplicata.faixa] : 'Em avaliação'} ·{' '}
          {duplicata.confirmacoes} {duplicata.confirmacoes === 1 ? 'confirmação' : 'confirmações'}
        </p>
      </div>
    </button>
  )
}

/** Tela 7: passo 3 — "Já existe um registro… É o mesmo?". */
export function ConferenciaPage() {
  const navigate = useNavigate()
  const { categoria, categoriaId, local } = useRascunho()
  useExigirPasso(categoriaId !== null && local !== null, '/registrar/local')

  const { data: duplicatas } = useQuery({
    ...duplicatasQuery(categoriaId ?? 0, local ?? { lat: 0, lng: 0 }),
    enabled: categoriaId !== null && local !== null,
  })
  const [escolhidaId, setEscolhidaId] = useState<string | null>(null)
  const escolhida = duplicatas?.find((d) => d.id === escolhidaId) ?? duplicatas?.[0]
  const confirmar = useVotarExistencia(escolhida?.id ?? '')
  // /problemas/duplicatas não traz coordenadas: o ponto do vizinho vem do detalhe.
  const { data: vizinho } = useQuery({
    ...detalheProblemaQuery(escolhida?.id ?? ''),
    enabled: escolhida !== undefined,
  })

  // Nada perto (ex.: recarregou e o vizinho foi resolvido): segue para a revisão.
  useExigirPasso(duplicatas === undefined || duplicatas.length > 0, '/registrar/revisao')

  function confirmarExistente() {
    if (!escolhida) return
    confirmar.mutate('confirma', {
      onSuccess: (problema) => {
        navigate('/registrar/sucesso', { replace: true, state: { problema, confirmacao: true } })
      },
    })
  }

  const primeira = duplicatas?.[0]
  return (
    <PassoRegistro
      titulo="Conferência"
      passo={{ atual: 3, total: 4, rotulo: 'Registros próximos' }}
      acaoTopo="voltar"
      aoTopo={() => navigate('/registrar/local')}
      mapa={
        local && escolhida && vizinho?.id === escolhida.id ? (
          <MapaRegistro
            modo="conferencia"
            novo={local}
            existente={{ ...escolhida, lat: vizinho.lat, lng: vizinho.lng }}
          />
        ) : (
          <MapaRegistro modo="estatico" />
        )
      }
      rodape={
        <div className="flex flex-col gap-2">
          <Button disabled={!escolhida || confirmar.isPending} onClick={confirmarExistente}>
            Sim, confirmar esse
          </Button>
          <Button variant="outline" onClick={() => navigate('/registrar/revisao')}>
            Não, é outro
          </Button>
        </div>
      }
    >
      {!primeira || !escolhida ? (
        <Skeleton className="h-40 rounded-2xl bg-muted" />
      ) : (
        <div className="space-y-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-info text-info-foreground">
            <Icone nome="content_copy" className="text-[20px]" />
          </span>
          <h2 className="text-[22px] leading-7">
            Já existe um registro de {categoria?.nome ?? primeira.categoria.nome} a{' '}
            {distanciaTexto(primeira.distanciaMetros)}. É o mesmo?
          </h2>
          <p className="text-sm text-muted-foreground">
            Se for, sua confirmação reforça o registro existente em vez de criar uma duplicata.
          </p>
          <div className="max-h-56 space-y-2 overflow-y-auto">
            {duplicatas.map((d) => (
              <CartaoDuplicata
                key={d.id}
                duplicata={d}
                selecionada={d.id === escolhida.id}
                aoEscolher={duplicatas.length > 1 ? () => setEscolhidaId(d.id) : undefined}
              />
            ))}
          </div>
          {confirmar.error && (
            <p role="alert" className="text-sm text-destructive">
              {mensagemErroRegistro(confirmar.error)}
            </p>
          )}
        </div>
      )}
    </PassoRegistro>
  )
}
