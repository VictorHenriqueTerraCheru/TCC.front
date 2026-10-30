import { useState } from 'react'

import { SearchField } from '@/common/components/search-field'
import { ResponsiveSheet } from '@/common/components/responsive-sheet'
import { withoutAccents } from '@/common/lib/text'
import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'
import { LoadError } from '@/common/components/load-error'
import { colorAppearance, GroupDot, useGroups, type Group } from '@/features/categories'

import { useAdminCategories } from '../api/use-admin-categories'
import { useDeleteGroup } from '../api/use-admin-groups'
import { categoryErrorMessage } from '../errors'
import { TypeLabel } from './type-label'
import { FilterSummary, TypeSegmentedControl, type TypeFilter } from './list-filters'
import { GroupForm } from './group-form'

export function GroupList() {
  const groups = useGroups()
  const categories = useAdminCategories()
  const remove = useDeleteGroup()
  const [form, setForm] = useState<'new' | Group | null>(null)
  const [deleting, setDeleting] = useState<Group | null>(null)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<TypeFilter>('all')

  if (groups.isPending || categories.isPending) {
    return <Skeleton className="h-60 rounded-2xl bg-muted" />
  }
  if (groups.isError || categories.isError) {
    return (
      <LoadError
        message={
          groups.isError
            ? 'Não foi possível carregar os grupos.'
            : 'Não foi possível carregar as categorias.'
        }
        onRetry={() => {
          if (groups.isError) void groups.refetch()
          if (categories.isError) void categories.refetch()
        }}
      />
    )
  }

  const total = (key: string) => categories.data.filter((c) => c.group === key).length

  const term = withoutAccents(search.trim())
  const visible = groups.data.filter(
    (g) =>
      (type === 'all' || g.type === type) &&
      (term === '' || withoutAccents(g.label).includes(term)),
  )
  const filtering = term !== '' || type !== 'all'

  function confirmDelete() {
    if (!deleting) return
    remove.mutate(deleting.key, { onSuccess: () => setDeleting(null) })
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Os grupos organizam as categorias no mapa e na escolha de categoria.
        </p>
        <Button size="sm" onClick={() => setForm('new')}>
          Novo grupo
        </Button>
      </div>

      <div className="mb-3 space-y-3">
        <SearchField value={search} onChange={setSearch} label="Buscar grupo" />
        <TypeSegmentedControl value={type} onChange={setType} />
        <FilterSummary
          shown={visible.length}
          total={groups.data.length}
          noun="grupos"
          filtering={filtering}
          onClear={() => {
            setSearch('')
            setType('all')
          }}
        />
      </div>

      {visible.length === 0 ? (
        <p className="rounded-[20px] bg-card py-10 text-center text-sm text-muted-foreground shadow-1">
          Nenhum grupo com esses filtros.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-[20px] bg-card shadow-1">
          {visible.map((group) => {
            const howMany = total(group.key)
            return (
              <li key={group.key} className="flex items-center gap-3 p-3">
                <GroupDot color={colorAppearance[group.color]} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{group.label}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <TypeLabel type={group.type} />
                    {howMany !== undefined && (
                      <span>
                        {howMany} {howMany === 1 ? 'categoria' : 'categorias'}
                      </span>
                    )}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={`Editar ${group.label}`}
                  onClick={() => setForm(group)}
                >
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={`Apagar ${group.label}`}
                  disabled={howMany !== 0}
                  title={howMany === 0 ? undefined : 'Só grupos sem categorias podem ser apagados'}
                  onClick={() => {
                    remove.reset()
                    setDeleting(group)
                  }}
                >
                  Apagar
                </Button>
              </li>
            )
          })}
        </ul>
      )}

      <ResponsiveSheet
        open={form !== null}
        onOpenChange={(open) => !open && setForm(null)}
        title={form === 'new' ? 'Novo grupo' : 'Editar grupo'}
      >
        {form !== null && (
          <GroupForm
            key={form === 'new' ? 'new' : form.key}
            group={form === 'new' ? undefined : form}
            onDone={() => setForm(null)}
          />
        )}
      </ResponsiveSheet>

      <ResponsiveSheet
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Apagar o grupo ${deleting?.label ?? ''}?`}
      >
        <p className="mb-4 text-sm text-muted-foreground">
          Essa ação não pode ser desfeita. O grupo some dos filtros e da escolha de categoria.
        </p>
        {remove.isError && (
          <p role="alert" className="mb-3 text-sm text-destructive">
            {categoryErrorMessage(remove.error)}
          </p>
        )}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setDeleting(null)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            disabled={remove.isPending}
            onClick={confirmDelete}
          >
            {remove.isPending ? 'Apagando…' : 'Apagar'}
          </Button>
        </div>
      </ResponsiveSheet>
    </>
  )
}
