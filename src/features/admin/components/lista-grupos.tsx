import { useState } from 'react'

import { FolhaResponsiva } from '@/common/components/folha-responsiva'
import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'
import { aparenciaDaCor, PontoGrupo, useGrupos, type Grupo } from '@/features/categorias'

import { useCategoriasAdmin } from '../api/use-categorias-admin'
import { useApagarGrupo } from '../api/use-grupos-admin'
import { mensagemErroCategorias } from '../errors'
import { FormularioGrupo } from './formulario-grupo'

const rotuloTipo = { problema: 'Continua lá', incidente: 'Aconteceu e passou' } as const

export function ListaGrupos() {
  const grupos = useGrupos()
  const categorias = useCategoriasAdmin()
  const apagar = useApagarGrupo()
  const [formulario, setFormulario] = useState<'novo' | Grupo | null>(null)
  const [apagando, setApagando] = useState<Grupo | null>(null)

  if (grupos.isPending) return <Skeleton className="h-60 rounded-2xl bg-muted" />
  if (grupos.isError) {
    return (
      <div role="alert" className="space-y-3 py-6">
        <p>Não foi possível carregar os grupos.</p>
        <Button variant="outline" size="sm" onClick={() => void grupos.refetch()}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  const total = (chave: string) => categorias.data?.filter((c) => c.grupo === chave).length

  function confirmarApagar() {
    if (!apagando) return
    apagar.mutate(apagando.chave, { onSuccess: () => setApagando(null) })
  }

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Os grupos organizam as categorias no mapa e na escolha de categoria.
        </p>
        <Button size="sm" onClick={() => setFormulario('novo')}>
          Novo grupo
        </Button>
      </div>

      <ul className="divide-y divide-border rounded-[20px] bg-card">
        {grupos.data.map((grupo) => {
          const quantas = total(grupo.chave)
          return (
            <li key={grupo.chave} className="flex items-center gap-3 p-3">
              <PontoGrupo cor={aparenciaDaCor[grupo.cor]} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{grupo.rotulo}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {rotuloTipo[grupo.tipo]}
                  {quantas !== undefined &&
                    ` · ${quantas} ${quantas === 1 ? 'categoria' : 'categorias'}`}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                aria-label={`Editar ${grupo.rotulo}`}
                onClick={() => setFormulario(grupo)}
              >
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                aria-label={`Apagar ${grupo.rotulo}`}
                disabled={quantas !== 0}
                title={quantas === 0 ? undefined : 'Só grupos sem categorias podem ser apagados'}
                onClick={() => {
                  apagar.reset()
                  setApagando(grupo)
                }}
              >
                Apagar
              </Button>
            </li>
          )
        })}
      </ul>

      <FolhaResponsiva
        aberto={formulario !== null}
        aoMudarAberto={(aberto) => !aberto && setFormulario(null)}
        titulo={formulario === 'novo' ? 'Novo grupo' : 'Editar grupo'}
      >
        {formulario !== null && (
          <FormularioGrupo
            key={formulario === 'novo' ? 'novo' : formulario.chave}
            grupo={formulario === 'novo' ? undefined : formulario}
            aoConcluir={() => setFormulario(null)}
          />
        )}
      </FolhaResponsiva>

      <FolhaResponsiva
        aberto={apagando !== null}
        aoMudarAberto={(aberto) => !aberto && setApagando(null)}
        titulo={`Apagar o grupo ${apagando?.rotulo ?? ''}?`}
      >
        <p className="mb-4 text-sm text-muted-foreground">
          Essa ação não pode ser desfeita. O grupo some dos filtros e da escolha de categoria.
        </p>
        {apagar.isError && (
          <p role="alert" className="mb-3 text-sm text-destructive">
            {mensagemErroCategorias(apagar.error)}
          </p>
        )}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setApagando(null)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            disabled={apagar.isPending}
            onClick={confirmarApagar}
          >
            {apagar.isPending ? 'Apagando…' : 'Apagar'}
          </Button>
        </div>
      </FolhaResponsiva>
    </>
  )
}
