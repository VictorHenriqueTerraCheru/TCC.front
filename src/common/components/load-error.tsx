import { cn } from '@/common/lib/utils'
import { Button } from '@/common/ui/button'

interface LoadErrorProps {
  message: string
  onRetry?(): void
  className?: string
}

export function LoadError({ message, onRetry, className }: LoadErrorProps) {
  return (
    <div role="alert" className={cn('space-y-3 py-6', className)}>
      <p>{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  )
}
