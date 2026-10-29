import { useState } from 'react'

import { CampoBusca } from '@/common/components/campo-busca'
import { ChipFiltro } from '@/common/components/chip-filtro'
import { FolhaResponsiva } from '@/common/components/folha-responsiva'
import { Segmentado } from '@/common/components/segmentado'
import { semAcento } from '@/common/lib/texto'
import { cn } from '@/common/lib/utils'
import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'
import {
  aparenciaDaCor,
  CategoriaIcone,
  PontoGrupo,
  useAparencia,
  useGrupos,
} from '@/features/categorias'

import {
  useAlterarAtivaCategoria,
  useCategoriasAdmin,
  type CategoriaAdmin,
} from '../api/use-categorias-admin'
import { mensagemErroCategorias } from '../errors'
import { EtiquetaTipo } from './etiqueta-tipo'
import { FormularioCategoria } from './formulario-categoria'
import { ResumoDosFiltros, SegmentadoTipo, type FiltroTipo } from './filtros-lista'

type Situacao = 'todas' | 'ativas' | 'inativas'

const situacoes: { value: Situacao; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'ativas', label: 'Ativas' },
  { value: 'inativas', label: 'Inativas' },
]

export function ListaCategorias() {
  const categorias = useCategoriasAdmin()
  const gruposQuery = useGrupos()
  const { grupos, grupoDe } = useAparencia()
  const alterarAtiva = useAlterarAtivaCategoria()
  const [formulario, setFormulario] = useState<'new' | CategoriaAdmin | null>(null)
  const [busca, setBusca] = useState('')
  const [tipo, setTipo] = useState<FiltroTipo>('todos')
  const [situacao, setSituacao] = useState<Situacao>('todas')
  const [grupo, setGrupo] = useState<string | null>(null)

  if (categorias.isPending || gruposQuery.isPending) {
    return <Skeleton className="h-60 rounded-2xl bg-muted" />
  }
  if (categorias.isError || gruposQuery.isError) {
    return (
      <div role="alert" className="space-y-3 py-6">
        <p>
          {categorias.isError
            ? 'Não foi possível carregar as categorias.'
            : 'Não foi possível carregar os grupos.'}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (categorias.isError) void categorias.refetch()
            if (gruposQuery.isError) void gruposQuery.refetch()
          }}
        >
          Tentar novamente
        </Button>
      </div>
    )
  }

  const ordemDoGrupo = (chave: string) => grupos.find((g) => g.key === chave)?.sortOrder ?? 0
  const ordenadas = [...categorias.data].sort(
    (a, b) =>
      (a.type === b.type ? 0 : a.type === 'issue' ? -1 : 1) ||
      ordemDoGrupo(a.group) - ordemDoGrupo(b.group) ||
      a.name.localeCompare(b.name),
  )

  const termo = semAcento(busca.trim())
  const visiveis = ordenadas.filter(
    (c) =>
      (tipo === 'todos' || c.type === tipo) &&
      (situacao === 'todas' || c.active === (situacao === 'ativas')) &&
      (grupo === null || c.group === grupo) &&
      (termo === '' ||
        semAcento(c.name).includes(termo) ||
        semAcento(grupoDe(c)?.label ?? c.group).includes(termo)),
  )
  const filtrando = termo !== '' || tipo !== 'todos' || situacao !== 'todas' || grupo !== null
  const gruposDoFiltro = grupos.filter((g) => tipo === 'todos' || g.type === tipo)

  function limpar() {
    setBusca('')
    setTipo('todos')
    setSituacao('todas')
    setGrupo(null)
  }

  function mudarTipo(novo: FiltroTipo) {
    setTipo(novo)
    if (grupo !== null && novo !== 'todos' && grupos.find((g) => g.key === grupo)?.type !== novo) {
      setGrupo(null)
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Desativar esconde a categoria sem apagar o histórico.
        </p>
        <Button size="sm" onClick={() => setFormulario('new')}>
          Nova categoria
        </Button>
      </div>

      <div className="mb-3 space-y-3">
        <CampoBusca
          value={busca}
          aoMudar={setBusca}
          label="Buscar categoria"
          placeholder="Buscar por nome ou grupo"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <SegmentadoTipo value={tipo} aoMudar={mudarTipo} />
          <Segmentado<Situacao>
            label="Situação"
            opcoes={situacoes}
            value={situacao}
            aoMudar={setSituacao}
          />
        </div>
        <div
          role="group"
          aria-label="Filtrar por grupo"
          className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1"
        >
          <ChipFiltro selecionado={grupo === null} aoClicar={() => setGrupo(null)}>
            Todos os grupos
          </ChipFiltro>
          {gruposDoFiltro.map((g) => (
            <ChipFiltro
              key={g.key}
              selecionado={grupo === g.key}
              aoClicar={() => setGrupo(grupo === g.key ? null : g.key)}
            >
              <PontoGrupo color={aparenciaDaCor[g.color]} />
              {g.label}
            </ChipFiltro>
          ))}
        </div>
        <ResumoDosFiltros
          mostradas={visiveis.length}
          total={ordenadas.length}
          substantivo="categorias"
          filtrando={filtrando}
          aoLimpar={limpar}
        />
      </div>

      {alterarAtiva.isError && (
        <p role="alert" className="mb-3 text-sm text-destructive">
          {mensagemErroCategorias(alterarAtiva.error)}
        </p>
      )}

      {visiveis.length === 0 ? (
        <p className="rounded-[20px] bg-card py-10 text-center text-sm text-muted-foreground shadow-1">
          Nenhuma categoria com esses filtros.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-[20px] bg-card shadow-1">
          {visiveis.map((categoria) => (
            <li
              key={categoria.id}
              className={cn('flex items-center gap-3 p-3', !categoria.active && 'opacity-60')}
            >
              <CategoriaIcone category={categoria} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{categoria.name}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <EtiquetaTipo type={categoria.type} />
                  <span className="truncate">{grupoDe(categoria)?.label ?? categoria.group}</span>
                  {!categoria.active && <span className="font-medium">Inativa</span>}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                aria-label={`Editar ${categoria.name}`}
                onClick={() => setFormulario(categoria)}
              >
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                aria-label={`${categoria.active ? 'Desativar' : 'Ativar'} ${categoria.name}`}
                disabled={alterarAtiva.isPending}
                onClick={() => alterarAtiva.mutate({ id: categoria.id, active: !categoria.active })}
              >
                {categoria.active ? 'Desativar' : 'Ativar'}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <FolhaResponsiva
        aberto={formulario !== null}
        aoMudarAberto={(aberto) => !aberto && setFormulario(null)}
        titulo={formulario === 'new' ? 'Nova categoria' : 'Editar categoria'}
      >
        {formulario !== null && (
          <FormularioCategoria
            key={formulario === 'new' ? 'new' : formulario.id}
            category={formulario === 'new' ? undefined : formulario}
            grupos={grupos}
            aoConcluir={() => setFormulario(null)}
          />
        )}
      </FolhaResponsiva>
    </>
  )
}
