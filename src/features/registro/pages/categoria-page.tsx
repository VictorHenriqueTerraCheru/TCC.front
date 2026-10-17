import { useNavigate } from 'react-router'

import { cn } from '@/common/lib/utils'
import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'
import { CategoriaIcone, useCategorias, type Categoria } from '@/features/categorias'

import { PassoRegistro } from '../components/passo-registro'
import { useRascunho } from '../hooks/use-rascunho'

function Grade({
  categorias,
  selecionada,
  aoEscolher,
}: {
  categorias: Categoria[]
  selecionada: number | null
  aoEscolher(id: number): void
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {categorias.map((categoria) => {
        const ativa = categoria.id === selecionada
        return (
          <button
            key={categoria.id}
            type="button"
            aria-pressed={ativa}
            onClick={() => aoEscolher(categoria.id)}
            className={cn(
              'flex min-h-16 items-center gap-3 rounded-xl border p-2 text-left text-sm font-medium transition-colors focus-visible:outline-2',
              ativa
                ? 'border-primary bg-secondary'
                : 'border-border bg-card hover:bg-surface-container-high',
            )}
          >
            <CategoriaIcone categoria={categoria} tamanho="sm" />
            {categoria.nome}
          </button>
        )
      })}
    </div>
  )
}

/** Tela 5: passo 1 — categoria. */
export function CategoriaPage() {
  const navigate = useNavigate()
  const { data: categorias, isPending } = useCategorias()
  const { categoria, categoriaId, escolherCategoria, limpar } = useRascunho()

  const problemas = categorias?.filter((c) => c.tipo === 'problema') ?? []
  const incidentes = categorias?.filter((c) => c.tipo === 'incidente') ?? []

  function fechar() {
    limpar()
    navigate('/mapa')
  }

  return (
    <PassoRegistro
      titulo="Nova ocorrência"
      passo={{ atual: 1, total: 4, rotulo: 'Categoria' }}
      acaoTopo="fechar"
      aoTopo={fechar}
      rodape={
        <Button
          className="w-full"
          disabled={!categoria}
          onClick={() =>
            navigate(
              categoria?.tipo === 'incidente' ? '/registrar/incidente/local' : '/registrar/local',
            )
          }
        >
          Continuar
        </Button>
      }
    >
      <h2 className="mb-4 text-2xl">O que você quer registrar?</h2>
      {isPending ? (
        <Skeleton className="h-60 rounded-2xl bg-muted" />
      ) : (
        <div className="space-y-6">
          <section>
            <h3 className="text-sm font-medium">Problemas que continuam no local</h3>
            <p className="mb-3 text-xs text-muted-foreground">
              Viram um marcador no mapa e ficam lá até a comunidade confirmar que foram resolvidos.
            </p>
            <Grade
              categorias={problemas}
              selecionada={categoriaId}
              aoEscolher={escolherCategoria}
            />
          </section>
          <section>
            <h3 className="text-sm font-medium">Algo que aconteceu agora</h3>
            <p className="mb-3 text-xs text-muted-foreground">
              Não viram marcador: entram de forma anônima no mapa de calor da região.
            </p>
            <Grade
              categorias={incidentes}
              selecionada={categoriaId}
              aoEscolher={escolherCategoria}
            />
          </section>
        </div>
      )}
    </PassoRegistro>
  )
}
