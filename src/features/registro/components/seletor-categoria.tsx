import { useState } from 'react'

import { ChipFiltro } from '@/common/components/chip-filtro'
import { Icone } from '@/common/components/icone'
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
  /** Categorias do tipo escolhido. */
  categorias: Categoria[]
  /** Grupos do mesmo tipo, em ordem de exibição. */
  grupos: Grupo[]
  selecionadaId: number | null
  /** Ids das últimas categorias usadas neste aparelho, a mais nova primeiro. */
  recentesIds: number[]
  aoEscolher(id: number): void
}

/**
 * Escolha da categoria numa tela só: busca, recentes, chips de grupo e grade 3 colunas por
 * grupo. Sem passo extra de grupo: com 10 a 20 categorias por tipo, rolar custa menos que um toque.
 */
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
    .filter((g) => grupoFiltro === null || g.chave === grupoFiltro)
    .map((grupo) => ({
      grupo,
      itens: categorias.filter(
        (c) =>
          c.grupo === grupo.chave &&
          (termo === '' ||
            semAcento(c.nome).includes(termo) ||
            semAcento(grupo.rotulo).includes(termo)),
      ),
    }))
    .filter((s) => s.itens.length > 0)

  // Categoria cujo grupo não está na lista (removido, ou de outro tipo): não some, vai em "Outras".
  const orfas = categorias.filter(
    (c) =>
      !grupos.some((g) => g.chave === c.grupo) &&
      (termo === '' || semAcento(c.nome).includes(termo)),
  )
  if (orfas.length > 0 && grupoFiltro === null) {
    secoes.push({
      grupo: { chave: 'outras', rotulo: 'Outras', tipo: orfas[0]!.tipo, cor: 'cinza', ordem: 0 },
      itens: orfas,
    })
  }

  const recentes = recentesIds
    .map((id) => categorias.find((c) => c.id === id))
    .filter((c): c is Categoria => c !== undefined)
    .slice(0, 3)
  const mostrarRecentes = termo === '' && grupoFiltro === null && recentes.length > 0

  return (
    <div className="space-y-4">
      <label className="flex h-11 items-center gap-2 rounded-xl bg-muted px-3 text-muted-foreground focus-within:outline-2">
        <Icone nome="search" className="text-[20px]" />
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar categoria"
          aria-label="Buscar categoria"
          className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label>

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
              key={grupo.chave}
              selecionado={grupoFiltro === grupo.chave}
              aoClicar={() => setGrupoFiltro(grupoFiltro === grupo.chave ? null : grupo.chave)}
            >
              <PontoGrupo cor={aparenciaDaCor[grupo.cor]} />
              {grupo.rotulo}
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
                aria-label={`Recente: ${categoria.nome}`}
                aria-pressed={categoria.id === selecionadaId}
                onClick={() => aoEscolher(categoria.id)}
                className={cn(
                  'flex min-h-11 items-center gap-2 rounded-full border py-1 pr-3 pl-1.5 text-sm font-medium focus-visible:outline-2',
                  categoria.id === selecionadaId
                    ? 'border-primario bg-primario-suave'
                    : 'border-border bg-card hover:bg-superficie-2',
                )}
              >
                <CategoriaIcone categoria={categoria} tamanho="sm" />
                {categoria.nome}
              </button>
            ))}
          </div>
        </section>
      )}

      {secoes.map(({ grupo, itens }) => {
        const cor = aparenciaDaCor[grupo.cor]
        return (
          <section key={grupo.chave} aria-label={grupo.rotulo}>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <PontoGrupo cor={cor} />
              {grupo.rotulo}
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
                      'flex min-h-24 flex-col items-center gap-1.5 rounded-2xl border-2 p-2 text-center text-[13px] leading-tight font-medium transition-colors focus-visible:outline-2',
                      ativa ? cor.claro : 'border-border bg-card hover:bg-superficie-2',
                    )}
                    style={ativa ? { borderColor: cor.corForte } : undefined}
                  >
                    <CategoriaIcone categoria={categoria} />
                    {categoria.nome}
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
