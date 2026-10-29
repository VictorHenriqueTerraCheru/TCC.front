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

const situacoes: { valor: Situacao; rotulo: string }[] = [
  { valor: 'todas', rotulo: 'Todas' },
  { valor: 'ativas', rotulo: 'Ativas' },
  { valor: 'inativas', rotulo: 'Inativas' },
]

export function ListaCategorias() {
  const categorias = useCategoriasAdmin()
  const gruposQuery = useGrupos()
  const { grupos, grupoDe } = useAparencia()
  const alterarAtiva = useAlterarAtivaCategoria()
  const [formulario, setFormulario] = useState<'nova' | CategoriaAdmin | null>(null)
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

  const ordemDoGrupo = (chave: string) => grupos.find((g) => g.chave === chave)?.ordem ?? 0
  const ordenadas = [...categorias.data].sort(
    (a, b) =>
      (a.tipo === b.tipo ? 0 : a.tipo === 'problema' ? -1 : 1) ||
      ordemDoGrupo(a.grupo) - ordemDoGrupo(b.grupo) ||
      a.nome.localeCompare(b.nome),
  )

  const termo = semAcento(busca.trim())
  const visiveis = ordenadas.filter(
    (c) =>
      (tipo === 'todos' || c.tipo === tipo) &&
      (situacao === 'todas' || c.ativa === (situacao === 'ativas')) &&
      (grupo === null || c.grupo === grupo) &&
      (termo === '' ||
        semAcento(c.nome).includes(termo) ||
        semAcento(grupoDe(c)?.rotulo ?? c.grupo).includes(termo)),
  )
  const filtrando = termo !== '' || tipo !== 'todos' || situacao !== 'todas' || grupo !== null
  const gruposDoFiltro = grupos.filter((g) => tipo === 'todos' || g.tipo === tipo)

  function limpar() {
    setBusca('')
    setTipo('todos')
    setSituacao('todas')
    setGrupo(null)
  }

  function mudarTipo(novo: FiltroTipo) {
    setTipo(novo)
    if (
      grupo !== null &&
      novo !== 'todos' &&
      grupos.find((g) => g.chave === grupo)?.tipo !== novo
    ) {
      setGrupo(null)
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Desativar esconde a categoria sem apagar o histórico.
        </p>
        <Button size="sm" onClick={() => setFormulario('nova')}>
          Nova categoria
        </Button>
      </div>

      <div className="mb-3 space-y-3">
        <CampoBusca
          valor={busca}
          aoMudar={setBusca}
          rotulo="Buscar categoria"
          placeholder="Buscar por nome ou grupo"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <SegmentadoTipo valor={tipo} aoMudar={mudarTipo} />
          <Segmentado<Situacao>
            rotulo="Situação"
            opcoes={situacoes}
            valor={situacao}
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
              key={g.chave}
              selecionado={grupo === g.chave}
              aoClicar={() => setGrupo(grupo === g.chave ? null : g.chave)}
            >
              <PontoGrupo cor={aparenciaDaCor[g.cor]} />
              {g.rotulo}
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
              className={cn('flex items-center gap-3 p-3', !categoria.ativa && 'opacity-60')}
            >
              <CategoriaIcone categoria={categoria} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{categoria.nome}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <EtiquetaTipo tipo={categoria.tipo} />
                  <span className="truncate">{grupoDe(categoria)?.rotulo ?? categoria.grupo}</span>
                  {!categoria.ativa && <span className="font-medium">Inativa</span>}
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
      )}

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
