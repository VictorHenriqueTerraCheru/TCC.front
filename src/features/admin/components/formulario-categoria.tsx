import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

import { CampoTexto } from '@/common/components/campo-texto'
import { ChipFiltro } from '@/common/components/chip-filtro'
import { Segmentado } from '@/common/components/segmentado'
import { Button } from '@/common/ui/button'
import { aparenciaDaCor, gruposDoTipo, PontoGrupo, type Grupo } from '@/features/categorias'

import {
  useCriarCategoria,
  useEditarCategoria,
  type CategoriaAdmin,
} from '../api/use-categorias-admin'
import { mensagemErroCategorias } from '../errors'
import { ajudaDoTipo, opcoesDeTipo } from '../models/tipo'
import { EtiquetaTipo } from './etiqueta-tipo'
import { categoriaSchema, type CategoriaForm } from '../validators/categoria'
import { SeletorIcone } from './seletor-icone'

interface FormularioCategoriaProps {
  category?: CategoriaAdmin
  grupos: Grupo[]
  aoConcluir(): void
}

export function FormularioCategoria({
  category: categoria,
  grupos,
  aoConcluir,
}: FormularioCategoriaProps) {
  const criar = useCriarCategoria()
  const editar = useEditarCategoria()
  const mutacao = categoria ? editar : criar
  const { register, handleSubmit, control, setValue, formState } = useForm<CategoriaForm>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      name: categoria?.name ?? '',
      type: categoria?.type ?? 'issue',
      group: categoria?.group ?? '',
      icon: categoria?.icon ?? '',
    },
  })
  const [tipo, grupo, icone] = useWatch({ control, name: ['type', 'group', 'icon'] })
  const doTipo = gruposDoTipo(grupos, tipo)

  const enviar = handleSubmit((form) => {
    const opcoes = { onSuccess: aoConcluir }
    if (categoria) {
      editar.mutate(
        { id: categoria.id, name: form.name, group: form.group, icon: form.icon },
        opcoes,
      )
    } else {
      criar.mutate(form, opcoes)
    }
  })

  return (
    <form onSubmit={enviar} noValidate className="mt-2 space-y-5">
      <CampoTexto
        label="Nome"
        maxLength={60}
        erro={formState.errors.name?.message}
        {...register('name')}
      />

      <div className="space-y-2">
        <p className="text-sm font-medium">Tipo</p>
        {categoria ? (
          <p className="text-sm text-muted-foreground">
            <EtiquetaTipo type={categoria.type} className="mr-2" />O tipo não muda depois de criada.
          </p>
        ) : (
          <Segmentado
            label="Tipo"
            opcoes={opcoesDeTipo}
            value={tipo}
            aoMudar={(valor) => {
              setValue('type', valor)
              setValue('group', '')
            }}
          />
        )}
        <p className="text-xs text-muted-foreground">{ajudaDoTipo[categoria?.type ?? tipo]}</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Grupo</p>
        {doTipo.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ainda não há grupo desse tipo. Crie um na aba Grupos.
          </p>
        ) : (
          <div role="group" aria-label="Grupo" className="flex flex-wrap gap-2">
            {doTipo.map((g) => (
              <ChipFiltro
                key={g.key}
                selecionado={g.key === grupo}
                aoClicar={() => setValue('group', g.key, { shouldValidate: true })}
              >
                <PontoGrupo color={aparenciaDaCor[g.color]} />
                {g.label}
              </ChipFiltro>
            ))}
          </div>
        )}
        {formState.errors.group && (
          <p role="alert" className="text-xs text-destructive">
            {formState.errors.group.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Ícone</p>
        <SeletorIcone
          value={icone}
          aoMudar={(nome) => setValue('icon', nome, { shouldValidate: true })}
          erro={formState.errors.icon?.message}
        />
      </div>

      {mutacao.isError && (
        <p role="alert" className="text-sm text-destructive">
          {mensagemErroCategorias(mutacao.error)}
        </p>
      )}
      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={aoConcluir}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" carregando={mutacao.isPending}>
          {mutacao.isPending ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}
