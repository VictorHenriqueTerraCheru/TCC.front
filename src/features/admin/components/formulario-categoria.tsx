import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

import { TextField } from '@/common/components/campo-texto'
import { FilterChip } from '@/common/components/chip-filtro'
import { SegmentedControl } from '@/common/components/segmentado'
import { Button } from '@/common/ui/button'
import { colorAppearance, groupsOfType, GroupDot, type Group } from '@/features/categorias'

import { useCreateCategory, useEditCategory, type AdminCategory } from '../api/use-categorias-admin'
import { categoryErrorMessage } from '../errors'
import { typeHelp, typeOptions } from '../models/tipo'
import { TypeLabel } from './etiqueta-tipo'
import { categorySchema, type CategoryFormValues } from '../validators/categoria'
import { IconPicker } from './seletor-icone'

interface CategoryFormProps {
  category?: AdminCategory
  groups: Group[]
  onDone(): void
}

export function CategoryForm({ category, groups, onDone }: CategoryFormProps) {
  const create = useCreateCategory()
  const edit = useEditCategory()
  const mutation = category ? edit : create
  const { register, handleSubmit, control, setValue, formState } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? '',
      type: category?.type ?? 'issue',
      group: category?.group ?? '',
      icon: category?.icon ?? '',
    },
  })
  const [type, group, icon] = useWatch({ control, name: ['type', 'group', 'icon'] })
  const ofType = groupsOfType(groups, type)

  const send = handleSubmit((form) => {
    const options = { onSuccess: onDone }
    if (category) {
      edit.mutate({ id: category.id, name: form.name, group: form.group, icon: form.icon }, options)
    } else {
      create.mutate(form, options)
    }
  })

  return (
    <form onSubmit={send} noValidate className="mt-2 space-y-5">
      <TextField
        label="Nome"
        maxLength={60}
        error={formState.errors.name?.message}
        {...register('name')}
      />

      <div className="space-y-2">
        <p className="text-sm font-medium">Tipo</p>
        {category ? (
          <p className="text-sm text-muted-foreground">
            <TypeLabel type={category.type} className="mr-2" />O tipo não muda depois de criada.
          </p>
        ) : (
          <SegmentedControl
            label="Tipo"
            options={typeOptions}
            value={type}
            onChange={(value) => {
              setValue('type', value)
              setValue('group', '')
            }}
          />
        )}
        <p className="text-xs text-muted-foreground">{typeHelp[category?.type ?? type]}</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Grupo</p>
        {ofType.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ainda não há grupo desse tipo. Crie um na aba Grupos.
          </p>
        ) : (
          <div role="group" aria-label="Grupo" className="flex flex-wrap gap-2">
            {ofType.map((g) => (
              <FilterChip
                key={g.key}
                selected={g.key === group}
                onClick={() => setValue('group', g.key, { shouldValidate: true })}
              >
                <GroupDot color={colorAppearance[g.color]} />
                {g.label}
              </FilterChip>
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
        <IconPicker
          value={icon}
          onChange={(name) => setValue('icon', name, { shouldValidate: true })}
          error={formState.errors.icon?.message}
        />
      </div>

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
