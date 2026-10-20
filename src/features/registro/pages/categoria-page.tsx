import { Navigate, useNavigate, useSearchParams } from 'react-router'

import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'
import { gruposDoTipo, useCategorias, useGrupos } from '@/features/categorias'

import { PassoRegistro } from '../components/passo-registro'
import { SeletorCategoria } from '../components/seletor-categoria'
import { useRascunho } from '../hooks/use-rascunho'
import { lerTipo } from '../models/rotas'
import { useRecentesStore } from '../stores/recentes-store'

/** Tela 5, passo 1b: a categoria do tipo escolhido em `/registrar`. */
export function CategoriaPage() {
  const tipo = lerTipo(useSearchParams()[0].get('tipo'))
  if (!tipo) return <Navigate to="/registrar" replace />
  return <CategoriaDoTipo tipo={tipo} />
}

function CategoriaDoTipo({ tipo }: { tipo: NonNullable<ReturnType<typeof lerTipo>> }) {
  const navigate = useNavigate()
  const categorias = useCategorias()
  const grupos = useGrupos()
  const { categoria, escolherCategoria } = useRascunho()
  const recentesIds = useRecentesStore((s) => s.ids)
  const registrarRecente = useRecentesStore((s) => s.registrar)

  const doTipo = categorias.data?.filter((c) => c.tipo === tipo) ?? []
  // Rascunho de outro tipo (voltou e trocou de ideia): conta como sem escolha.
  const escolhida = categoria?.tipo === tipo ? categoria : null

  function continuar() {
    if (!escolhida) return
    registrarRecente(escolhida.id)
    navigate(tipo === 'incidente' ? '/registrar/incidente/local' : '/registrar/local')
  }

  return (
    <PassoRegistro
      titulo="Nova ocorrência"
      passo={{ atual: 1, total: 4, rotulo: 'Categoria' }}
      acaoTopo="voltar"
      aoTopo={() => navigate('/registrar')}
      rodape={
        <div className="space-y-2">
          <p className="min-h-5 text-center text-[13px] text-muted-foreground" aria-live="polite">
            {escolhida ? `Selecionada: ${escolhida.nome}` : 'Escolha uma categoria para continuar'}
          </p>
          <Button className="w-full" disabled={!escolhida} onClick={continuar}>
            Continuar
          </Button>
        </div>
      }
    >
      <h2 className="mb-4 text-2xl">
        {tipo === 'problema' ? 'Qual é o estado?' : 'Qual foi o evento?'}
      </h2>
      {categorias.isPending || grupos.isPending ? (
        <Skeleton className="h-60 rounded-2xl bg-muted" />
      ) : categorias.isError || grupos.isError ? (
        <div role="alert" className="space-y-3 py-6">
          <p>Não foi possível carregar as categorias.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void categorias.refetch()
              void grupos.refetch()
            }}
          >
            Tentar novamente
          </Button>
        </div>
      ) : (
        <SeletorCategoria
          categorias={doTipo}
          grupos={gruposDoTipo(grupos.data, tipo)}
          selecionadaId={escolhida?.id ?? null}
          recentesIds={recentesIds}
          aoEscolher={escolherCategoria}
        />
      )}
    </PassoRegistro>
  )
}
