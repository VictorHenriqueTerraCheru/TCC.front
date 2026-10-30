import { useState } from 'react'

import { SearchField } from '@/common/components/search-field'
import { FilterChip } from '@/common/components/filter-chip'
import { withoutAccents } from '@/common/lib/text'
import { cn } from '@/common/lib/utils'
import {
  colorAppearance,
  CategoryIcon,
  GroupDot,
  type Category,
  type Group,
} from '@/features/categories'

interface CategoryPickerProps {
  categories: Category[]
  groups: Group[]
  selectedId: number | null
  recentIds: number[]
  onChoose(id: number): void
}

export function CategoryPicker({
  categories,
  groups,
  selectedId,
  recentIds,
  onChoose,
}: CategoryPickerProps) {
  const [search, setSearch] = useState('')
  const [groupFilter, setGroupFilter] = useState<string | null>(null)

  const term = withoutAccents(search.trim())
  const sections = groups
    .filter((g) => groupFilter === null || g.key === groupFilter)
    .map((group) => ({
      group,
      items: categories.filter(
        (c) =>
          c.group === group.key &&
          (term === '' ||
            withoutAccents(c.name).includes(term) ||
            withoutAccents(group.label).includes(term)),
      ),
    }))
    .filter((s) => s.items.length > 0)

  const orphans = categories.filter(
    (c) =>
      !groups.some((g) => g.key === c.group) &&
      (term === '' || withoutAccents(c.name).includes(term)),
  )
  if (orphans.length > 0 && groupFilter === null) {
    sections.push({
      group: {
        key: 'others',
        label: 'Outras',
        type: orphans[0]!.type,
        color: 'gray',
        sortOrder: 0,
      },
      items: orphans,
    })
  }

  const recent = recentIds
    .map((id) => categories.find((c) => c.id === id))
    .filter((c): c is Category => c !== undefined)
    .slice(0, 3)
  const showRecent = term === '' && groupFilter === null && recent.length > 0

  return (
    <div className="space-y-4">
      <SearchField value={search} onChange={setSearch} label="Buscar categoria" />

      {groups.length > 1 && (
        <div
          role="group"
          aria-label="Grupos"
          className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1"
        >
          <FilterChip selected={groupFilter === null} onClick={() => setGroupFilter(null)}>
            Todas
          </FilterChip>
          {groups.map((group) => (
            <FilterChip
              key={group.key}
              selected={groupFilter === group.key}
              onClick={() => setGroupFilter(groupFilter === group.key ? null : group.key)}
            >
              <GroupDot color={colorAppearance[group.color]} />
              {group.label}
            </FilterChip>
          ))}
        </div>
      )}

      {showRecent && (
        <section aria-label="Recentes">
          <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Recentes
          </h3>
          <div className="flex flex-wrap gap-2">
            {recent.map((category) => (
              <button
                key={category.id}
                type="button"
                aria-label={`Recente: ${category.name}`}
                aria-pressed={category.id === selectedId}
                onClick={() => onChoose(category.id)}
                className={cn(
                  'flex min-h-11 pressable items-center gap-2 rounded-full border py-1 pr-3 pl-1.5 text-sm font-medium focus-visible:outline-2',
                  category.id === selectedId
                    ? 'border-brand bg-brand-soft'
                    : 'border-border bg-card hover:bg-surface-2',
                )}
              >
                <CategoryIcon category={category} size="sm" />
                {category.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {sections.map(({ group, items }) => {
        const color = colorAppearance[group.color]
        return (
          <section key={group.key} aria-label={group.label}>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <GroupDot color={color} />
              {group.label}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {items.map((category) => {
                const active = category.id === selectedId
                return (
                  <button
                    key={category.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onChoose(category.id)}
                    className={cn(
                      'flex min-h-24 pressable flex-col items-center gap-1.5 rounded-2xl border-2 p-2 text-center text-[13px] leading-tight font-medium focus-visible:outline-2',
                      active ? color.light : 'border-border bg-card shadow-1 hover:bg-surface-2',
                    )}
                    style={active ? { borderColor: color.strongColor } : undefined}
                  >
                    <CategoryIcon category={category} />
                    {category.name}
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}

      {sections.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhuma categoria com esse nome.
          <br />
          Tente outra palavra ou escolha um grupo.
        </p>
      )}
    </div>
  )
}
