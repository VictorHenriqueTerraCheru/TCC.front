import type { ReactNode } from 'react'

import { SegmentedControl } from '@/common/components/segmented-control'
import { Button } from '@/common/ui/button'
import type { GroupType } from '@/features/categories'

import { typeLabel } from '../models/type'

export type TypeFilter = 'all' | GroupType

const typeOptions: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'issue', label: typeLabel.issue },
  { value: 'incident', label: typeLabel.incident },
]

export function TypeSegmentedControl({
  value,
  onChange,
}: {
  value: TypeFilter
  onChange(value: TypeFilter): void
}) {
  return (
    <SegmentedControl<TypeFilter>
      label="Tipo"
      options={typeOptions}
      value={value}
      onChange={onChange}
    />
  )
}

export function FilterSummary({
  shown,
  total,
  noun,
  filtering,
  onClear,
}: {
  shown: number
  total: number
  noun: string
  filtering: boolean
  onClear(): void
}): ReactNode {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {filtering ? `${shown} de ${total} ${noun}` : `${total} ${noun}`}
      </p>
      {filtering && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Limpar filtros
        </Button>
      )}
    </div>
  )
}
