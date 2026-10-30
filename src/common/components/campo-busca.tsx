import { AnimatePresence, m } from 'motion/react'
import { useRef } from 'react'

import { Icon } from '@/common/components/icone'
import { APPEAR } from '@/common/lib/movimento'

interface SearchFieldProps {
  value: string
  onChange(value: string): void
  label: string
  placeholder?: string
}

export function SearchField({ value, onChange, label, placeholder }: SearchFieldProps) {
  const field = useRef<HTMLInputElement>(null)
  return (
    <div
      onClick={() => field.current?.focus()}
      className="flex h-11 items-center gap-2 rounded-xl border border-transparent bg-muted px-3 text-muted-foreground transition-[border-color,box-shadow,background-color] duration-200 focus-within:border-ring focus-within:bg-card focus-within:shadow-[0_0_0_4px_color-mix(in_srgb,var(--ring)_18%,transparent)]"
    >
      <Icon name="search" className="text-[20px]" />
      <input
        ref={field}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? label}
        aria-label={label}
        className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
      />
      <AnimatePresence initial={false}>
        {value && (
          <m.button
            type="button"
            aria-label="Limpar busca"
            onClick={() => {
              onChange('')
              field.current?.focus()
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={APPEAR}
            className="-mr-1 flex size-7 items-center justify-center rounded-full hover:bg-foreground/10 focus-visible:outline-2"
          >
            <Icon name="cancel" filled className="text-[18px]" />
          </m.button>
        )}
      </AnimatePresence>
    </div>
  )
}
