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
  /** Sem categoria = criar. */
  categoria?: CategoriaAdmin
  grupos: Grupo[]
  aoConcluir(): void
}

export function FormularioCategoria({ categoria, grupos, aoConcluir }: FormularioCategoriaProps) {
  const criar = useCriarCategoria()
  const editar = useEditarCategoria()
  const mutacao = categoria ? editar : criar
  const { register, handleSubmit, control, setValue, formState } = useForm<CategoriaForm>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nome: categoria?.nome ?? '',
      tipo: categoria?.tipo ?? 'problema',
      grupo: categoria?.grupo ?? '',
      icone: categoria?.icone ?? '',
    },
  })
  const [tipo, grupo, icone] = useWatch({ control, name: ['tipo', 'grupo', 'icone'] })
  const doTipo = gruposDoTipo(grupos, tipo)

  const enviar = handleSubmit((form) => {
    const opcoes = { onSuccess: aoConcluir }
    if (categoria) {
      editar.mutate(
        { id: categoria.id, nome: form.nome, grupo: form.grupo, icone: form.icone },
        opcoes,
      )
    } else {
      criar.mutate(form, opcoes)
    }
  })

  return (
    <form onSubmit={enviar} noValidate className="mt-2 space-y-5">
      <CampoTexto
        rotulo="Nome"
        maxLength={60}
        erro={formState.errors.nome?.message}
        {...register('nome')}
      />

      <div className="space-y-2">
        <p className="text-sm font-medium">Tipo</p>
        {categoria ? (
          <p className="text-sm text-muted-foreground">
            <EtiquetaTipo tipo={categoria.tipo} className="mr-2" />O tipo não muda depois de criada.
          </p>
        ) : (
          <Segmentado
            rotulo="Tipo"
            opcoes={opcoesDeTipo}
            valor={tipo}
            aoMudar={(valor) => {
              setValue('tipo', valor)
              setValue('grupo', '') // o grupo escolhido pode ser do outro tipo
            }}
          />
        )}
        <p className="text-xs text-muted-foreground">{ajudaDoTipo[categoria?.tipo ?? tipo]}</p>
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
                key={g.chave}
                selecionado={g.chave === grupo}
                aoClicar={() => setValue('grupo', g.chave, { shouldValidate: true })}
              >
                <PontoGrupo cor={aparenciaDaCor[g.cor]} />
                {g.rotulo}
              </ChipFiltro>
            ))}
          </div>
        )}
        {formState.errors.grupo && (
          <p role="alert" className="text-xs text-destructive">
            {formState.errors.grupo.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Ícone</p>
        <SeletorIcone
          valor={icone}
          aoMudar={(nome) => setValue('icone', nome, { shouldValidate: true })}
          erro={formState.errors.icone?.message}
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
