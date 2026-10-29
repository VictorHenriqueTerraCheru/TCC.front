import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

import { CampoTexto } from '@/common/components/campo-texto'
import { Segmentado } from '@/common/components/segmentado'
import { cn } from '@/common/lib/utils'
import { Button } from '@/common/ui/button'
import { aparenciaDaCor, coresGrupo, nomeDaCor, type Grupo } from '@/features/categorias'

import { useCriarGrupo, useEditarGrupo } from '../api/use-grupos-admin'
import { mensagemErroCategorias } from '../errors'
import { ajudaDoTipo, opcoesDeTipo } from '../models/tipo'
import { EtiquetaTipo } from './etiqueta-tipo'
import { grupoSchema, type GrupoForm } from '../validators/grupo'

interface FormularioGrupoProps {
  group?: Grupo
  aoConcluir(): void
}

export function FormularioGrupo({ group: grupo, aoConcluir }: FormularioGrupoProps) {
  const criar = useCriarGrupo()
  const editar = useEditarGrupo()
  const mutacao = grupo ? editar : criar
  const { register, handleSubmit, control, setValue, formState } = useForm<GrupoForm>({
    resolver: zodResolver(grupoSchema),
    defaultValues: {
      label: grupo?.label ?? '',
      type: grupo?.type ?? 'issue',
      color: grupo?.color ?? 'blue',
      sortOrder: grupo?.sortOrder ?? 1,
    },
  })
  const [tipo, cor] = useWatch({ control, name: ['type', 'color'] })

  const enviar = handleSubmit((form) => {
    const opcoes = { onSuccess: aoConcluir }
    if (grupo) {
      editar.mutate(
        { key: grupo.key, label: form.label, color: form.color, sortOrder: form.sortOrder },
        opcoes,
      )
    } else {
      criar.mutate({ label: form.label, type: form.type, color: form.color }, opcoes)
    }
  })

  return (
    <form onSubmit={enviar} noValidate className="mt-2 space-y-5">
      <CampoTexto
        label="Nome do grupo"
        maxLength={40}
        erro={formState.errors.label?.message}
        {...register('label')}
      />

      <div className="space-y-2">
        <p className="text-sm font-medium">Tipo</p>
        {grupo ? (
          <p className="text-sm text-muted-foreground">
            <EtiquetaTipo type={grupo.type} className="mr-2" />O tipo não muda depois de criado.
          </p>
        ) : (
          <Segmentado
            label="Tipo"
            opcoes={opcoesDeTipo}
            value={tipo}
            aoMudar={(valor) => setValue('type', valor)}
          />
        )}
        <p className="text-xs text-muted-foreground">{ajudaDoTipo[grupo?.type ?? tipo]}</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Cor</p>
        <div role="radiogroup" aria-label="Cor" className="flex flex-wrap gap-3">
          {coresGrupo.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={c === cor}
              aria-label={nomeDaCor[c]}
              title={nomeDaCor[c]}
              onClick={() => setValue('color', c, { shouldValidate: true })}
              className={cn(
                'size-10 rounded-full border-[3px] border-card ring-1 ring-border focus-visible:outline-2',
                c === cor && 'ring-2 ring-foreground',
              )}
              style={{ background: aparenciaDaCor[c].corForte }}
            />
          ))}
        </div>
      </div>

      {grupo && (
        <CampoTexto
          label="Ordem de exibição"
          type="number"
          inputMode="numeric"
          min={1}
          max={100000}
          erro={formState.errors.sortOrder?.message}
          ajuda="Menor aparece primeiro nos filtros e na escolha de categoria."
          {...register('sortOrder', { valueAsNumber: true })}
        />
      )}

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
