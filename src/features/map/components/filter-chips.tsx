import { FilterChip } from '@/common/components/filter-chip'
import { Icon } from '@/common/components/icon'
import { colorAppearance, GroupDot, useAppearance } from '@/features/categories'

import { modeGroups, showsIssues, type MapFilters } from '../models/filters'

interface FilterChipsProps extends MapFilters {
  onToggleGroup(group: string): void
  onToggleNew(): void
}

export function FilterChips({
  mode,
  groups,
  onlyNew,
  onToggleGroup,
  onToggleNew,
}: FilterChipsProps) {
  const { groups: all } = useAppearance()
  return (
    <div
      role="group"
      aria-label="Filtros"
      className="pointer-events-auto -mx-3 flex [scrollbar-width:none] gap-2 overflow-x-auto px-3 pb-1"
    >
      {modeGroups(all, mode).map((group) => {
        const selected = groups.includes(group.key)
        return (
          <FilterChip key={group.key} selected={selected} onClick={() => onToggleGroup(group.key)}>
            {selected ? (
              <Icon name="check" filled className="text-[18px]" />
            ) : (
              <GroupDot color={colorAppearance[group.color]} />
            )}
            {group.label}
          </FilterChip>
        )
      })}
      {showsIssues(mode) && (
        <FilterChip selected={onlyNew} onClick={onToggleNew}>
          <Icon name={onlyNew ? 'check' : 'hourglass'} className="text-[18px] text-new-badge" />
          Em avaliação
        </FilterChip>
      )}
    </div>
  )
}
