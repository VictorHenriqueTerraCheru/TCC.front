import { useState } from 'react'
import { InfiniteList } from '@/common/components/lista-infinita'
import { cn } from '@/common/lib/utils'
import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'
import type { VerificationStatus } from '@/features/verificacao'

import { useQueue } from '../api/use-fila'
import { RequestCard } from '../components/cartao-solicitacao'
import { AdminGuard } from '../components/guarda-admin'

const tabs: { status: VerificationStatus; label: string }[] = [
  { status: 'pending', label: 'Pendentes' },
  { status: 'approved', label: 'Aprovadas' },
  { status: 'rejected', label: 'Recusadas' },
]

function Queue({ status }: { status: VerificationStatus }) {
  const queue = useQueue(status)
  if (queue.isPending) return <Skeleton className="h-40 rounded-2xl bg-muted" />
  if (queue.isError) {
    return (
      <div role="alert" className="space-y-3 py-6">
        <p>Não foi possível carregar a fila.</p>
        <Button variant="outline" size="sm" onClick={() => void queue.refetch()}>
          Tentar novamente
        </Button>
      </div>
    )
  }
  const items = queue.data.pages.flatMap((p) => p.items)
  if (items.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Nenhum pedido aqui.</p>
  }
  return (
    <InfiniteList query={queue}>
      <div className="space-y-3">
        {items.map((s) => (
          <RequestCard key={s.id} request={s} />
        ))}
      </div>
    </InfiniteList>
  )
}

function PendingTotal() {
  const { data } = useQueue('pending')
  const total = data?.pages[0]?.total
  return total !== undefined ? <> · {total}</> : null
}

export function VerificationQueuePage() {
  const [aba, setAba] = useState<VerificationStatus>('pending')

  return (
    <AdminGuard title="Fila de verificação" path="/admin/verificacoes">
      <div
        role="tablist"
        aria-label="Situação dos pedidos"
        className="mb-4 flex border-b border-border"
      >
        {tabs.map(({ status, label }) => (
          <button
            key={status}
            type="button"
            role="tab"
            id={`aba-${status}`}
            aria-selected={aba === status}
            aria-controls={`painel-${status}`}
            onClick={() => setAba(status)}
            className={cn(
              '-mb-px flex-1 border-b-2 py-3 text-sm font-medium focus-visible:outline-2',
              aba === status
                ? 'border-primario text-primario'
                : 'border-transparent text-muted-foreground',
            )}
          >
            {label}
            {status === 'pending' && <PendingTotal />}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`painel-${aba}`} aria-labelledby={`aba-${aba}`}>
        <Queue status={aba} />
      </div>
    </AdminGuard>
  )
}
