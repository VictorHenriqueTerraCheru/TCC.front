import { useState } from 'react'

import { FolhaResponsiva } from '@/common/components/folha-responsiva'
import { cn } from '@/common/lib/utils'
import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'
import { CategoriaIcone, useAparencia } from '@/features/categorias'

import {
  useAlterarAtivaCategoria,
  useCategoriasAdmin,
  type CategoriaAdmin,
} from '../api/use-categorias-admin'
import { mensagemErroCategorias } from '../errors'
import { FormularioCategoria } from './formulario-categoria'

const rotuloTipo = { problema: 'Continua lá', incidente: 'Aconteceu e passou' } as const

export function ListaCategorias() {
  const categorias = useCategoriasAdmin()
  const { grupos, grupoDe } = useAparencia()
  const alterarAtiva = useAlterarAtivaCategoria()
  // 'nova' abre o formulário vazio; uma categoria abre a edição dela.
  const [formulario, setFormulario] = useState<'nova' | CategoriaAdmin | null>(null)

  if (categorias.isPending) return <Skeleton className="h-60 rounded-2xl bg-muted" />
  if (categorias.isError) {
    return (
      <div role="alert" className="space-y-3 py-6">
        <p>Não foi possível carregar as categorias.</p>
        <Button variant="outline" size="sm" onClick={() => void categorias.refetch()}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  const ordemDoGrupo = (chave: string) => grupos.find((g) => g.chave === chave)?.ordem ?? 0
  const ordenadas = [...categorias.data].sort(
    (a, b) =>
      (a.tipo === b.tipo ? 0 : a.tipo === 'problema' ? -1 : 1) ||
      ordemDoGrupo(a.grupo) - ordemDoGrupo(b.grupo) ||
      a.nome.localeCompare(b.nome),
  )

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Desativar esconde a categoria sem apagar o histórico.
        </p>
        <Button size="sm" onClick={() => setFormulario('nova')}>
          Nova categoria
        </Button>
      </div>

      {alterarAtiva.isError && (
        <p role="alert" className="mb-3 text-sm text-destructive">
          {mensagemErroCategorias(alterarAtiva.error)}
        </p>
      )}

      <ul className="divide-y divide-border rounded-[20px] bg-card">
        {ordenadas.map((categoria) => (
          <li
            key={categoria.id}
            className={cn('flex items-center gap-3 p-3', !categoria.ativa && 'opacity-60')}
          >
            <CategoriaIcone categoria={categoria} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{categoria.nome}</p>
              <p className="truncate text-xs text-muted-foreground">
                {grupoDe(categoria)?.rotulo ?? categoria.grupo} · {rotuloTipo[categoria.tipo]}
                {!categoria.ativa && ' · Inativa'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              aria-label={`Editar ${categoria.nome}`}
              onClick={() => setFormulario(categoria)}
            >
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              aria-label={`${categoria.ativa ? 'Desativar' : 'Ativar'} ${categoria.nome}`}
              disabled={alterarAtiva.isPending}
              onClick={() => alterarAtiva.mutate({ id: categoria.id, ativa: !categoria.ativa })}
            >
              {categoria.ativa ? 'Desativar' : 'Ativar'}
            </Button>
          </li>
        ))}
      </ul>

      <FolhaResponsiva
        aberto={formulario !== null}
        aoMudarAberto={(aberto) => !aberto && setFormulario(null)}
        titulo={formulario === 'nova' ? 'Nova categoria' : 'Editar categoria'}
      >
        {formulario !== null && (
          <FormularioCategoria
            key={formulario === 'nova' ? 'nova' : formulario.id}
            categoria={formulario === 'nova' ? undefined : formulario}
            grupos={grupos}
            aoConcluir={() => setFormulario(null)}
          />
        )}
      </FolhaResponsiva>
    </>
  )
}
