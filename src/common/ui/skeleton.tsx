import { cn } from '@/common/lib/utils'

/** Bloco de carregamento com o brilho que o atravessa (estático com "Reduzir movimento"). */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="skeleton" className={cn('brilho rounded-md bg-accent', className)} {...props} />
  )
}

export { Skeleton }
