import { useState } from 'react'

import { SearchField } from '@/common/components/search-field'
import { FilterChip } from '@/common/components/filter-chip'
import { ResponsiveSheet } from '@/common/components/responsive-sheet'
import { SegmentedControl } from '@/common/components/segmented-control'
import { withoutAccents } from '@/common/lib/text'
import { cn } from '@/common/lib/utils'
import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'
import { LoadError } from '@/common/components/load-error'
import {
  colorAppearance,
  CategoryIcon,
  GroupDot,
  useAppearance,
  useGroups,
} from '@/features/categories'

import {
  useSetCategoryActive,
  useAdminCategories,
  type AdminCategory,
} from '../api/use-admin-categories'
import { categoryErrorMessage } from '../errors'
import { TypeLabel } from './type-label'
import { CategoryForm } from './category-form'
import { FilterSummary, TypeSegmentedControl, type TypeFilter } from './list-filters'

type ActiveFilter = 'all' | 'active' | 'inactive'

const statuses: { value: ActiveFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'active', label: 'Ativas' },
  { value: 'inactive', label: 'Inativas' },
]

export function CategoryList() {
  const categories = useAdminCategories()
  const groupsQuery = useGroups()
  const { groups, groupOf } = useAppearance()
  const setActive = useSetCategoryActive()
  const [form, setForm] = useState<'new' | AdminCategory | null>(null)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<TypeFilter>('all')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all')
  const [group, setGroup] = useState<string | null>(null)

  if (categories.isPending || groupsQuery.isPending) {
    return <Skeleton className="h-60 rounded-2xl bg-muted" />
  }
  if (categories.isError || groupsQuery.isError) {
    return (
      <LoadError
        message={
          categories.isError
            ? 'Não foi possível carregar as categorias.'
            : 'Não foi possível carregar os grupos.'
        }
        onRetry={() => {
          if (categories.isError) void categories.refetch()
          if (groupsQuery.isError) void groupsQuery.refetch()
        }}
      />
    )
  }

  const groupOrder = (key: string) => groups.find((g) => g.key === key)?.sortOrder ?? 0
  const sorted = [...categories.data].sort(
    (a, b) =>
      (a.type === b.type ? 0 : a.type === 'issue' ? -1 : 1) ||
      groupOrder(a.group) - groupOrder(b.group) ||
      a.name.localeCompare(b.name),
  )

  const term = withoutAccents(search.trim())
  const visible = sorted.filter(
    (c) =>
      (type === 'all' || c.type === type) &&
      (activeFilter === 'all' || c.active === (activeFilter === 'active')) &&
      (group === null || c.group === group) &&
      (term === '' ||
        withoutAccents(c.name).includes(term) ||
        withoutAccents(groupOf(c)?.label ?? c.group).includes(term)),
  )
  const filtering = term !== '' || type !== 'all' || activeFilter !== 'all' || group !== null
  const filterGroups = groups.filter((g) => type === 'all' || g.type === type)

  function clear() {
    setSearch('')
    setType('all')
    setActiveFilter('all')
    setGroup(null)
  }

  function handleTypeChange(newPoint: TypeFilter) {
    setType(newPoint)
    if (
      group !== null &&
      newPoint !== 'all' &&
      groups.find((g) => g.key === group)?.type !== newPoint
    ) {
      setGroup(null)
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Desativar esconde a categoria sem apagar o histórico.
        </p>
        <Button size="sm" onClick={() => setForm('new')}>
          Nova categoria
        </Button>
      </div>

      <div className="mb-3 space-y-3">
        <SearchField
          value={search}
          onChange={setSearch}
          label="Buscar categoria"
          placeholder="Buscar por nome ou grupo"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <TypeSegmentedControl value={type} onChange={handleTypeChange} />
          <SegmentedControl<ActiveFilter>
            label="Situação"
            options={statuses}
            value={activeFilter}
            onChange={setActiveFilter}
          />
        </div>
        <div
          role="group"
          aria-label="Filtrar por grupo"
          className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1"
        >
          <FilterChip selected={group === null} onClick={() => setGroup(null)}>
            Todos os grupos
          </FilterChip>
          {filterGroups.map((g) => (
            <FilterChip
              key={g.key}
              selected={group === g.key}
              onClick={() => setGroup(group === g.key ? null : g.key)}
            >
              <GroupDot color={colorAppearance[g.color]} />
              {g.label}
            </FilterChip>
          ))}
        </div>
        <FilterSummary
          shown={visible.length}
          total={sorted.length}
          noun="categorias"
          filtering={filtering}
          onClear={clear}
        />
      </div>

      {setActive.isError && (
        <p role="alert" className="mb-3 text-sm text-destructive">
          {categoryErrorMessage(setActive.error)}
        </p>
      )}

      {visible.length === 0 ? (
        <p className="rounded-[20px] bg-card py-10 text-center text-sm text-muted-foreground shadow-1">
          Nenhuma categoria com esses filtros.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-[20px] bg-card shadow-1">
          {visible.map((category) => (
            <li
              key={category.id}
              className={cn('flex items-center gap-3 p-3', !category.active && 'opacity-60')}
            >
              <CategoryIcon category={category} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{category.name}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <TypeLabel type={category.type} />
                  <span className="truncate">{groupOf(category)?.label ?? category.group}</span>
                  {!category.active && <span className="font-medium">Inativa</span>}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                aria-label={`Editar ${category.name}`}
                onClick={() => setForm(category)}
              >
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                aria-label={`${category.active ? 'Desativar' : 'Ativar'} ${category.name}`}
                disabled={setActive.isPending}
                onClick={() => setActive.mutate({ id: category.id, active: !category.active })}
              >
                {category.active ? 'Desativar' : 'Ativar'}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <ResponsiveSheet
        open={form !== null}
        onOpenChange={(open) => !open && setForm(null)}
        title={form === 'new' ? 'Nova categoria' : 'Editar categoria'}
      >
        {form !== null && (
          <CategoryForm
            key={form === 'new' ? 'new' : form.id}
            category={form === 'new' ? undefined : form}
            groups={groups}
            onDone={() => setForm(null)}
          />
        )}
      </ResponsiveSheet>
    </>
  )
}
