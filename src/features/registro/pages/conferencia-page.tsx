import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { Icone } from '@/common/components/icone'
import { distanciaTexto, tempoRelativo } from '@/common/lib/formatacao'
import { cn } from '@/common/lib/utils'
import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'
import { CategoriaIcone } from '@/features/categorias'
import { detalheProblemaQuery, useVotar } from '@/features/problemas'
import type { Schema } from '@/infrastructure/api'

import { duplicatasQuery } from '../api/use-registro'
import { mensagemErroRegistro } from '../errors'
import { MapaRegistro } from '../components/mapa-registro'
import { PassoRegistro } from '../components/passo-registro'
import { useExigirCategoria, useExigirPasso, useRascunho } from '../hooks/use-rascunho'

type Duplicata = Schema<'SearchDuplicatesResponse'>

const rotuloFaixa = { high: 'Confiança alta', medium: 'Confiança média', low: 'Confiança baixa' }

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
        'flex w-full gap-3 rounded-2xl border bg-card p-3 text-left shadow-1 disabled:opacity-100',
        selecionada ? 'border-primario' : 'border-border/60',
      )}
    >
      <CategoriaIcone category={duplicata.category} pageSize="sm" />
      <div className="min-w-0 text-sm">
        <p className="font-medium">{duplicata.category.name}</p>
        <p className="text-xs text-muted-foreground">
          {duplicata.address} · {tempoRelativo(duplicata.createdAt)}
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-primario">
          <Icone
            name={duplicata.band ? 'check_circle' : 'hourglass_top'}
            preenchido
            className="text-[16px]"
          />
          {duplicata.band ? rotuloFaixa[duplicata.band] : 'Em avaliação'} ·{' '}
          {duplicata.confirmations} {duplicata.confirmations === 1 ? 'confirmação' : 'confirmações'}
        </p>
      </div>
    </button>
  )
}

export function ConferenciaPage() {
  const navigate = useNavigate()
  const { category: categoria, categoryId: categoriaId, local } = useRascunho()
  useExigirCategoria('issue')
  useExigirPasso(local !== null, '/registrar/local')

  const { data: duplicatas } = useQuery({
    ...duplicatasQuery(categoriaId ?? 0, local ?? { lat: 0, lng: 0 }),
    enabled: categoriaId !== null && local !== null,
  })
  const [escolhidaId, setEscolhidaId] = useState<string | null>(null)
  const escolhida = duplicatas?.find((d) => d.id === escolhidaId) ?? duplicatas?.[0]
  const confirmar = useVotar(escolhida?.id ?? '')
  const { data: vizinho } = useQuery({
    ...detalheProblemaQuery(escolhida?.id ?? ''),
    enabled: escolhida !== undefined,
  })

  useExigirPasso(duplicatas === undefined || duplicatas.length > 0, '/registrar/revisao')

  function confirmarExistente() {
    if (!escolhida) return
    confirmar.mutate('yes', {
      onSuccess: (problema) => {
        navigate('/registrar/sucesso', {
          replace: true,
          state: { issue: problema, confirmacao: true },
        })
      },
    })
  }

  const primeira = duplicatas?.[0]
  return (
    <PassoRegistro
      titulo="Conferência"
      passo={{ atual: 3, total: 4, label: 'Registros próximos' }}
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
          <span className="flex size-10 items-center justify-center rounded-full bg-primario-suave text-primario">
            <Icone name="content_copy" className="text-[20px]" />
          </span>
          <h2 className="text-[22px] leading-7">
            Já existe um registro de {categoria?.name ?? primeira.category.name} a{' '}
            {distanciaTexto(primeira.distanceMeters)}. É o mesmo?
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
