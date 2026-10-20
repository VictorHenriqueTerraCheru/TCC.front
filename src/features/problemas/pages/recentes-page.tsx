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
import {
  aparenciaDaCor,
  CategoriaIcone,
  gruposDoTipo,
  PontoGrupo,
  useAparencia,
} from '@/features/categorias'
import { useLocalizacao } from '@/features/localizacao'
import type { Schema } from '@/infrastructure/api'

import { RAIO_RECENTES_KM, useRecentes } from '../api/use-recentes'
import type { FaixaConfianca } from '../models/problema'

type ItemRecente = Schema<'ListarProblemasRecentesItem'>

const faixa: Record<FaixaConfianca, { rotulo: string; icone: MaterialSymbol }> = {
  alta: { rotulo: 'Alta', icone: 'signal_cellular_alt' },
  media: { rotulo: 'Média', icone: 'signal_cellular_alt_2_bar' },
  baixa: { rotulo: 'Baixa', icone: 'signal_cellular_alt_1_bar' },
}

function Cartao({ item }: { item: ItemRecente }) {
  const possivel = item.status === 'possivelmenteResolvida'
  return (
    <Link
      to={`/mapa/problema/${item.id}`}
      className="flex gap-3 rounded-[20px] border border-border bg-card p-3 hover:bg-superficie-2 focus-visible:outline-2"
    >
      <CategoriaIcone categoria={item.categoria} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{item.categoria.nome}</p>
          {item.status === 'nova' && (
            <span className="rounded bg-nova px-1.5 text-[11px] leading-4 text-nova-foreground">
              Nova
            </span>
          )}
          {item.faixa && (
            <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
              <Icone nome={faixa[item.faixa].icone} className="text-[16px] text-primario" />
              {faixa[item.faixa].rotulo}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">{item.endereco}</p>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Icone nome="schedule" className="text-[16px]" />
            {tempoRelativo(item.criadoEm)}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium',
              possivel ? 'bg-primario-suave text-primario' : 'bg-muted',
            )}
          >
            <Icone
              nome={
                possivel
                  ? 'help'
                  : item.status === 'nova'
                    ? 'hourglass_top'
                    : 'radio_button_checked'
              }
              preenchido
              className="text-[14px]"
            />
            {possivel
              ? 'Possivelmente resolvida'
              : item.status === 'nova'
                ? 'Em avaliação'
                : 'Ativa'}
          </span>
        </p>
      </div>
    </Link>
  )
}

/** Tela 9: problemas não resolvidos num raio de 10 km, mais recentes primeiro. */
export function RecentesPage() {
  const { estado, posicao } = useLocalizacao()
  const { grupos: todos } = useAparencia()
  const [grupos, setGrupos] = useState<string[]>([])
  const centro =
    estado === 'granted' && posicao ? posicao : { lat: CENTRO_PADRAO[0], lng: CENTRO_PADRAO[1] }
  const recentes = useRecentes(centro, grupos)
  const itens = recentes.data?.pages.flatMap((p) => p.itens) ?? []

  const alternar = (grupo: string) =>
    setGrupos((atuais) =>
      atuais.includes(grupo) ? atuais.filter((g) => g !== grupo) : [...atuais, grupo],
    )

  return (
    <Pagina titulo="Recentes">
      <p className="-mt-2 mb-3 text-xs text-muted-foreground">
        {estado === 'granted' && posicao ? 'Perto de você' : 'Perto de Botafogo'} · até{' '}
        {RAIO_RECENTES_KM} km
      </p>
      <div
        role="group"
        aria-label="Filtros"
        className="-mx-4 mb-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1"
      >
        {gruposDoTipo(todos, 'problema').map((grupo) => {
          const selecionado = grupos.includes(grupo.chave)
          return (
            <ChipFiltro
              key={grupo.chave}
              selecionado={selecionado}
              aoClicar={() => alternar(grupo.chave)}
            >
              {selecionado ? (
                <Icone nome="check" preenchido className="text-[18px]" />
              ) : (
                <PontoGrupo cor={aparenciaDaCor[grupo.cor]} />
              )}
              {grupo.rotulo}
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
            {itens.map((item) => (
              <li key={item.id}>
                <Cartao item={item} />
              </li>
            ))}
          </ul>
        </ListaInfinita>
      )}
    </Pagina>
  )
}
