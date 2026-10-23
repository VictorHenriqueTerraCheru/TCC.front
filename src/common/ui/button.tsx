import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/common/lib/utils'

// Botões em pílula. Cheio = --primary (#1f74db, texto branco AA); tonal/contorno/ghost em --primario.
// Os cheios ganham um gradiente que só escurece a base (o contraste com o texto branco não cai),
// o realce de 1 px no topo e uma sombra da própria cor.
const cheio =
  'bg-linear-to-b from-black/0 to-black/12 shadow-[inset_0_1px_0_rgb(255_255_255/0.22),0_1px_2px_rgb(0_0_0/0.18)]'

const buttonVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-sm font-semibold whitespace-nowrap pressionavel outline-none select-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: `bg-primary text-primary-foreground ${cheio} hover:brightness-110 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.22),0_6px_18px_color-mix(in_srgb,var(--primary)_40%,transparent)]`,
        tonal: 'bg-primario-suave text-primario hover:bg-primario/25',
        outline: 'border border-input bg-card/40 text-primario hover:bg-primario-suave',
        destructive: `bg-destructive text-destructive-foreground ${cheio} hover:brightness-105`,
        ghost: 'text-primario hover:bg-primario-suave',
        link: 'text-primario underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-6',
        sm: 'h-9 gap-1.5 px-4',
        lg: 'h-12 px-6 text-base',
        icon: 'size-10',
        'icon-sm': 'size-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  carregando = false,
  disabled,
  children,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    /** Mostra o indicador girando ao lado do texto e desabilita o botão (envio em andamento). */
    carregando?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {carregando && (
            <span
              aria-hidden
              className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
            />
          )}
          {children}
        </>
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
