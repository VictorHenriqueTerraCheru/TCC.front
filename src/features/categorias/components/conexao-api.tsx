import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'

import { useCategorias } from '../api/use-categorias'
import { aparenciaDoGrupo, grupoDe } from '../models/categoria'
import { CategoriaIcone } from './categoria-icone'

/** Teste de integração da Etapa 0: GET /categorias pelo cliente tipado. Sai na Etapa 1. */
export function ConexaoApi() {
  const { data, isPending, isError, error, refetch } = useCategorias()

  return (
    <section aria-labelledby="conexao-api" className="rounded-2xl bg-surface-container p-4">
      <h2 id="conexao-api" className="mb-3 text-sm font-medium">
        Conexão com a API · GET /categorias
      </h2>
      {isPending && (
        <div className="space-y-2" aria-label="Carregando categorias">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl bg-muted" />
          ))}
        </div>
      )}
      {isError && (
        <div role="alert" className="space-y-3">
          <p className="text-sm text-destructive">
            Não foi possível falar com a API: {error.message}
          </p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}
      {data && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {data.map((categoria) => (
            <li key={categoria.id} className="flex items-center gap-3 rounded-xl bg-card p-2">
              <CategoriaIcone categoria={categoria} tamanho="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{categoria.nome}</p>
                <p className="text-xs text-muted-foreground">
                  {aparenciaDoGrupo[grupoDe(categoria)].rotulo} · {categoria.tipo}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
