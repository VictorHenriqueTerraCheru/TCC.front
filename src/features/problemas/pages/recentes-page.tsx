import type { MaterialSymbol } from 'material-symbols'
import { useState } from 'react'
import { Link } from 'react-router'

import { ChipFiltro } from '@/common/components/chip-filtro'
import { Icone } from '@/common/components/icone'
import { ListaInfinita } from '@/common/components/lista-infinita'
import { Pagina } from '@/common/components/pagina'
import { tempoRelativo } from '@/common/lib/formatacao'
import { CENTRO_PADRAO } from '@/common/lib/mapa'
import { cn } from '@/common/lib/utils'
import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'
import { ItemAnimado } from '@/common/components/item-animado'
import {
  aparenciaDaCor,
  CategoriaIcone,
  gruposDoTipo,
  PontoGrupo,
  useAparencia,
  useGrupos,
} from '@/features/categorias'
import { useLocalizacao } from '@/features/localizacao'
import type { Schema } from '@/infrastructure/api'

import { RAIO_RECENTES_KM, useRecentes } from '../api/use-recentes'
import type { FaixaConfianca } from '../models/problema'

type ItemRecente = Schema<'ListRecentIssuesItem'>

const faixa: Record<FaixaConfianca, { label: string; icon: MaterialSymbol }> = {
  high: { label: 'Alta', icon: 'signal_cellular_alt' },
  medium: { label: 'Média', icon: 'signal_cellular_alt_2_bar' },
  low: { label: 'Baixa', icon: 'signal_cellular_alt_1_bar' },
}

function Cartao({ item }: { item: ItemRecente }) {
  const possivel = item.status === 'possiblyResolved'
  return (
    <Link
      to={`/mapa/problema/${item.id}`}
      className="flex pressionavel gap-3 rounded-[20px] border border-border bg-card p-3 shadow-1 hover:bg-superficie-2 focus-visible:outline-2"
    >
      <CategoriaIcone category={item.category} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{item.category.name}</p>
          {item.status === 'new' && (
            <span className="rounded bg-nova px-1.5 text-[11px] leading-4 text-nova-foreground">
              Nova
            </span>
          )}
          {item.band && (
            <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
              <Icone name={faixa[item.band].icon} className="text-[16px] text-primario" />
              {faixa[item.band].label}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">{item.address}</p>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Icone name="schedule" className="text-[16px]" />
            {tempoRelativo(item.createdAt)}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium',
              possivel ? 'bg-primario-suave text-primario' : 'bg-muted',
            )}
          >
            <Icone
              name={
                possivel ? 'help' : item.status === 'new' ? 'hourglass_top' : 'radio_button_checked'
              }
              preenchido
              className="text-[14px]"
            />
            {possivel
              ? 'Possivelmente resolvida'
              : item.status === 'new'
                ? 'Em avaliação'
                : 'Ativa'}
          </span>
        </p>
      </div>
    </Link>
  )
}

export function RecentesPage() {
  const { estado, posicao } = useLocalizacao()
  const { grupos: todos, carregado } = useAparencia()
  const gruposQuery = useGrupos()
  const [escolhidos, setGrupos] = useState<string[]>([])
  const grupos = carregado ? escolhidos.filter((g) => todos.some((t) => t.key === g)) : escolhidos
  const centro =
    estado === 'granted' && posicao ? posicao : { lat: CENTRO_PADRAO[0], lng: CENTRO_PADRAO[1] }
  const recentes = useRecentes(centro, grupos)
  const itens = recentes.data?.pages.flatMap((p) => p.items) ?? []

  const alternar = (grupo: string) =>
    setGrupos(() =>
      grupos.includes(grupo) ? grupos.filter((g) => g !== grupo) : [...grupos, grupo],
    )

  if (gruposQuery.isError) {
    return (
      <Pagina titulo="Recentes">
        <div role="alert" className="space-y-3 py-6">
          <p>Não foi possível carregar os filtros.</p>
          <Button variant="outline" size="sm" onClick={() => void gruposQuery.refetch()}>
            Tentar novamente
          </Button>
        </div>
      </Pagina>
    )
  }

  return (
    <Pagina titulo="Recentes">
      <p className="-mt-2 mb-3 text-xs text-muted-foreground">
        {estado === 'granted' && posicao ? 'Perto de você' : 'Perto de Icaraí'} · até{' '}
        {RAIO_RECENTES_KM} km
      </p>
      <div
        role="group"
        aria-label="Filtros"
        className="-mx-4 mb-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1"
      >
        {gruposDoTipo(todos, 'issue').map((grupo) => {
          const selecionado = grupos.includes(grupo.key)
          return (
            <ChipFiltro
              key={grupo.key}
              selecionado={selecionado}
              aoClicar={() => alternar(grupo.key)}
            >
              {selecionado ? (
                <Icone name="check" preenchido className="text-[18px]" />
              ) : (
                <PontoGrupo color={aparenciaDaCor[grupo.color]} />
              )}
              {grupo.label}
            </ChipFiltro>
          )
        })}
      </div>

      {recentes.isPending ? (
        <div className="space-y-2" aria-label="Carregando recentes">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl bg-muted" />
          ))}
        </div>
      ) : recentes.isError ? (
        <div role="alert" className="space-y-3 py-6">
          <p>Não foi possível carregar os recentes.</p>
          <Button variant="outline" size="sm" onClick={() => void recentes.refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : itens.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Nenhum problema registrado nesta região.
        </p>
      ) : (
        <ListaInfinita consulta={recentes}>
          <ul className="space-y-2">
            {itens.map((item, i) => (
              <ItemAnimado key={item.id} indice={i}>
                <Cartao item={item} />
              </ItemAnimado>
            ))}
          </ul>
        </ListaInfinita>
      )}
    </Pagina>
  )
}
