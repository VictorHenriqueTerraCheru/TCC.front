import { m } from 'motion/react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import { useState, type ComponentProps } from 'react'

import { cn } from '@/common/lib/utils'

function Checkbox({
  className,
  checked,
  defaultChecked,
  onCheckedChange,
  ...props
}: ComponentProps<typeof CheckboxPrimitive.Root>) {
  const [interno, setInterno] = useState(defaultChecked ?? false)
  const marcado = (checked ?? interno) === true

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      checked={checked ?? interno}
      onCheckedChange={(valor) => {
        if (checked === undefined) setInterno(valor)
        onCheckedChange?.(valor)
      }}
      className={cn(
        'flex size-5 shrink-0 pressionavel items-center justify-center rounded-[6px] border-2 border-input bg-card text-primary-foreground outline-none',
        'focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive',
        'disabled:opacity-40 data-[state=checked]:border-primary data-[state=checked]:bg-primary',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator forceMount asChild>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3.5}
          aria-hidden
          className="size-3.5"
        >
          <m.path
            d="M4.5 12.75l6 6 9-13.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: marcado ? 1 : 0, opacity: marcado ? 1 : 0 }}
            transition={{ duration: 0.22, ease: 'easeOut', delay: marcado ? 0.05 : 0 }}
          />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
