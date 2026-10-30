import { m } from 'motion/react'
import { useId } from 'react'

import { SOFT_SPRING } from '@/common/lib/motion'
import { cn } from '@/common/lib/utils'

interface SegmentedControlProps<T extends string> {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange(value: T): void
  className?: string
}

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  const pillId = useId()
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('grid h-10 gap-[3px] rounded-[14px] p-[3px] vidro', className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative flex pressionavel items-center justify-center rounded-[11px] text-[13px] font-semibold focus-visible:outline-2 focus-visible:-outline-offset-2',
              selected ? 'text-primario' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {selected && (
              <m.span
                layoutId={pillId}
                transition={SOFT_SPRING}
                className="absolute inset-0 rounded-[11px] bg-primario-suave shadow-1 ring-1 ring-primario/15"
              />
            )}
            <span className="relative">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
