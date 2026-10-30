import type { MaterialSymbol } from 'material-symbols'
import type { ReactNode } from 'react'

import { Icon } from '@/common/components/icon'

interface SummaryRowProps {
  icon: ReactNode | MaterialSymbol
  label: string
  value: ReactNode
  onEdit?(): void
}

export function SummaryRow({ icon, label, value, onEdit }: SummaryRowProps) {
  return (
    <li className="flex items-center gap-3 border-t border-border/60 px-4 py-3 first:border-t-0">
      <span className="flex w-6 justify-center text-muted-foreground">
        {typeof icon === 'string' ? (
          <Icon name={icon as MaterialSymbol} className="text-[22px]" />
        ) : (
          icon
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p>{value}</p>
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Editar ${label.toLowerCase()}`}
          className="flex size-10 pressable items-center justify-center rounded-full hover:bg-foreground/5 focus-visible:outline-2"
        >
          <Icon name="edit" className="text-[20px]" />
        </button>
      )}
    </li>
  )
}

export function Summary({ children }: { children: ReactNode }) {
  return (
    <section aria-labelledby="summary-title">
      <h2 id="summary-title" className="mb-2 font-medium">
        Resumo
      </h2>
      <ul className="rounded-2xl border border-border/60 bg-card shadow-1">{children}</ul>
    </section>
  )
}
