import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { SearchField } from '@/common/components/search-field'
import { Icon } from '@/common/components/icon'
import { DynamicIcon } from '@/common/components/remote-icon'
import { useDebouncedValue } from '@/common/hooks/use-debounced-value'
import { fetchIcons } from '@/common/lib/iconify'
import { cn } from '@/common/lib/utils'
import { iconOf } from '@/features/categories'

const MIN_LETTERS = 2
const MAX_RESULTS = 48

interface IconPickerProps {
  value: string
  onChange(name: string): void
  error?: string
}

export function IconPicker({ value, onChange, error }: IconPickerProps) {
  const [search, setSearch] = useState('')
  const term = useDebouncedValue(search.trim().toLowerCase(), 350)
  const result = useQuery({
    queryKey: ['iconify', 'search', term],
    queryFn: ({ signal }) => fetchIcons(term, signal),
    enabled: term.length >= MIN_LETTERS,
    staleTime: Infinity,
    retry: false,
  })
  const names = result.data?.slice(0, MAX_RESULTS) ?? []

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-sm">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted text-[26px]">
          {value ? <DynamicIcon name={iconOf({ icon: value })} /> : <Icon name="category" />}
        </span>
        <span className={cn(!value && 'text-muted-foreground')}>
          {value ? (
            <>
              Ícone: <span className="font-mono">{value}</span>
            </>
          ) : (
            'Nenhum ícone escolhido'
          )}
        </span>
      </div>

      <SearchField
        value={search}
        onChange={setSearch}
        label="Buscar ícone"
        placeholder="Buscar ícone (em inglês: flood, tree, fire…)"
      />

      {term.length >= MIN_LETTERS && result.isPending && (
        <p className="text-sm text-muted-foreground">Buscando…</p>
      )}
      {result.isError && (
        <p role="alert" className="text-sm text-destructive">
          Não foi possível buscar ícones agora. Tente de novo.
        </p>
      )}
      {result.isSuccess && names.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhum ícone encontrado. A busca é em inglês.
        </p>
      )}
      {names.length > 0 && (
        <div role="group" aria-label="Resultados da busca" className="grid grid-cols-6 gap-2">
          {names.map((name) => (
            <button
              key={name}
              type="button"
              aria-label={name}
              aria-pressed={name === value}
              title={name}
              onClick={() => onChange(name)}
              className={cn(
                'flex aspect-square pressable items-center justify-center rounded-xl border-2 text-[26px] focus-visible:outline-2',
                name === value
                  ? 'border-brand bg-brand-soft text-brand'
                  : 'border-border bg-card hover:bg-surface-2',
              )}
            >
              <DynamicIcon name={name} />
            </button>
          ))}
        </div>
      )}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
