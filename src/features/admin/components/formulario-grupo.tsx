import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

import { TextField } from '@/common/components/campo-texto'
import { SegmentedControl } from '@/common/components/segmentado'
import { cn } from '@/common/lib/utils'
import { Button } from '@/common/ui/button'
import { colorAppearance, groupColors, colorName, type Group } from '@/features/categorias'

import { useCreateGroup, useEditGroup } from '../api/use-grupos-admin'
import { categoryErrorMessage } from '../errors'
import { typeHelp, typeOptions } from '../models/tipo'
import { TypeLabel } from './etiqueta-tipo'
import { groupSchema, type GroupFormValues } from '../validators/grupo'

interface GroupFormProps {
  group?: Group
  onDone(): void
}

export function GroupForm({ group, onDone }: GroupFormProps) {
  const create = useCreateGroup()
  const edit = useEditGroup()
  const mutation = group ? edit : create
  const { register, handleSubmit, control, setValue, formState } = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      label: group?.label ?? '',
      type: group?.type ?? 'issue',
      color: group?.color ?? 'blue',
      sortOrder: group?.sortOrder ?? 1,
    },
  })
  const [type, color] = useWatch({ control, name: ['type', 'color'] })

  const send = handleSubmit((form) => {
    const options = { onSuccess: onDone }
    if (group) {
      edit.mutate(
        { key: group.key, label: form.label, color: form.color, sortOrder: form.sortOrder },
        options,
      )
    } else {
      create.mutate({ label: form.label, type: form.type, color: form.color }, options)
    }
  })

  return (
    <form onSubmit={send} noValidate className="mt-2 space-y-5">
      <TextField
        label="Nome do grupo"
        maxLength={40}
        error={formState.errors.label?.message}
        {...register('label')}
      />

      <div className="space-y-2">
        <p className="text-sm font-medium">Tipo</p>
        {group ? (
          <p className="text-sm text-muted-foreground">
            <TypeLabel type={group.type} className="mr-2" />O tipo não muda depois de criado.
          </p>
        ) : (
          <SegmentedControl
            label="Tipo"
            options={typeOptions}
            value={type}
            onChange={(value) => setValue('type', value)}
          />
        )}
        <p className="text-xs text-muted-foreground">{typeHelp[group?.type ?? type]}</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Cor</p>
        <div role="radiogroup" aria-label="Cor" className="flex flex-wrap gap-3">
          {groupColors.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={c === color}
              aria-label={colorName[c]}
              title={colorName[c]}
              onClick={() => setValue('color', c, { shouldValidate: true })}
              className={cn(
                'size-10 rounded-full border-[3px] border-card ring-1 ring-border focus-visible:outline-2',
                c === color && 'ring-2 ring-foreground',
              )}
              style={{ background: colorAppearance[c].strongColor }}
            />
          ))}
        </div>
      </div>

      {group && (
        <TextField
          label="Ordem de exibição"
          type="number"
          inputMode="numeric"
          min={1}
          max={100000}
          error={formState.errors.sortOrder?.message}
          help="Menor aparece primeiro nos filtros e na escolha de categoria."
          {...register('sortOrder', { valueAsNumber: true })}
        />
      )}

      {mutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          {categoryErrorMessage(mutation.error)}
        </p>
      )}
      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" loading={mutation.isPending}>
          {mutation.isPending ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}
