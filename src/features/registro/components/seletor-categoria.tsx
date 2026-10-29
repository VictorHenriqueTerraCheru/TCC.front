import { useState } from 'react'

import { CampoBusca } from '@/common/components/campo-busca'
import { ChipFiltro } from '@/common/components/chip-filtro'
import { semAcento } from '@/common/lib/texto'
import { cn } from '@/common/lib/utils'
import {
  aparenciaDaCor,
  CategoriaIcone,
  PontoGrupo,
  type Categoria,
  type Grupo,
} from '@/features/categorias'

interface SeletorCategoriaProps {
  categorias: Categoria[]
  grupos: Grupo[]
  selecionadaId: number | null
  recentesIds: number[]
  aoEscolher(id: number): void
}

export function SeletorCategoria({
  categorias,
  grupos,
  selecionadaId,
  recentesIds,
  aoEscolher,
}: SeletorCategoriaProps) {
  const [busca, setBusca] = useState('')
  const [grupoFiltro, setGrupoFiltro] = useState<string | null>(null)

  const termo = semAcento(busca.trim())
  const secoes = grupos
    .filter((g) => grupoFiltro === null || g.key === grupoFiltro)
    .map((grupo) => ({
      group: grupo,
      items: categorias.filter(
        (c) =>
          c.group === grupo.key &&
          (termo === '' ||
            semAcento(c.name).includes(termo) ||
            semAcento(grupo.label).includes(termo)),
      ),
    }))
    .filter((s) => s.items.length > 0)

  const orfas = categorias.filter(
    (c) =>
      !grupos.some((g) => g.key === c.group) && (termo === '' || semAcento(c.name).includes(termo)),
  )
  if (orfas.length > 0 && grupoFiltro === null) {
    secoes.push({
      group: { key: 'outras', label: 'Outras', type: orfas[0]!.type, color: 'gray', sortOrder: 0 },
      items: orfas,
    })
  }

  const recentes = recentesIds
    .map((id) => categorias.find((c) => c.id === id))
    .filter((c): c is Categoria => c !== undefined)
    .slice(0, 3)
  const mostrarRecentes = termo === '' && grupoFiltro === null && recentes.length > 0

  return (
    <div className="space-y-4">
      <CampoBusca value={busca} aoMudar={setBusca} label="Buscar categoria" />

      {grupos.length > 1 && (
        <div
          role="group"
          aria-label="Grupos"
          className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1"
        >
          <ChipFiltro selecionado={grupoFiltro === null} aoClicar={() => setGrupoFiltro(null)}>
            Todas
          </ChipFiltro>
          {grupos.map((grupo) => (
            <ChipFiltro
              key={grupo.key}
              selecionado={grupoFiltro === grupo.key}
              aoClicar={() => setGrupoFiltro(grupoFiltro === grupo.key ? null : grupo.key)}
            >
              <PontoGrupo color={aparenciaDaCor[grupo.color]} />
              {grupo.label}
            </ChipFiltro>
          ))}
        </div>
      )}

      {mostrarRecentes && (
        <section aria-label="Recentes">
          <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Recentes
          </h3>
          <div className="flex flex-wrap gap-2">
            {recentes.map((categoria) => (
              <button
                key={categoria.id}
                type="button"
                aria-label={`Recente: ${categoria.name}`}
                aria-pressed={categoria.id === selecionadaId}
                onClick={() => aoEscolher(categoria.id)}
                className={cn(
                  'flex min-h-11 pressionavel items-center gap-2 rounded-full border py-1 pr-3 pl-1.5 text-sm font-medium focus-visible:outline-2',
                  categoria.id === selecionadaId
                    ? 'border-primario bg-primario-suave'
                    : 'border-border bg-card hover:bg-superficie-2',
                )}
              >
                <CategoriaIcone category={categoria} pageSize="sm" />
                {categoria.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {secoes.map(({ group: grupo, items: itens }) => {
        const cor = aparenciaDaCor[grupo.color]
        return (
          <section key={grupo.key} aria-label={grupo.label}>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <PontoGrupo color={cor} />
              {grupo.label}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {itens.map((categoria) => {
                const ativa = categoria.id === selecionadaId
                return (
                  <button
                    key={categoria.id}
                    type="button"
                    aria-pressed={ativa}
                    onClick={() => aoEscolher(categoria.id)}
                    className={cn(
                      'flex min-h-24 pressionavel flex-col items-center gap-1.5 rounded-2xl border-2 p-2 text-center text-[13px] leading-tight font-medium focus-visible:outline-2',
                      ativa ? cor.claro : 'border-border bg-card shadow-1 hover:bg-superficie-2',
                    )}
                    style={ativa ? { borderColor: cor.corForte } : undefined}
                  >
                    <CategoriaIcone category={categoria} />
                    {categoria.name}
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}

      {secoes.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhuma categoria com esse nome.
          <br />
          Tente outra palavra ou escolha um grupo.
        </p>
      )}
    </div>
  )
}
