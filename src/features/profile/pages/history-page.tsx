import { Navigate, useNavigate } from 'react-router'
import { useState } from 'react'

import { InfiniteList } from '@/common/components/infinite-list'
import { SegmentedControl } from '@/common/components/segmented-control'
import { ScreenWithBack } from '@/common/components/screen-with-back'
import { Skeleton } from '@/common/ui/skeleton'
import { AnimatedItem } from '@/common/components/animated-item'
import { LoadError } from '@/common/components/load-error'
import { useAuthenticated } from '@/features/auth'
import {
  groupByPeriod,
  HistoryItemRow,
  itemTime,
  useHistory,
  type HistoryFilter,
} from '@/features/users'

const filters: { value: HistoryFilter; label: string }[] = [
  { value: 'all', label: 'Tudo' },
  { value: 'reports', label: 'Registros' },
  { value: 'votes', label: 'Votos' },
]

function List({ filter }: { filter: HistoryFilter }) {
  const history = useHistory(filter)
  if (history.isPending) return <Skeleton className="h-60 rounded-2xl bg-muted" />
  if (history.isError) {
    return (
      <LoadError
        message="Não foi possível carregar o histórico."
        onRetry={() => void history.refetch()}
      />
    )
  }
  const items = history.data.pages.flatMap((p) => p.items)
  if (items.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Nada por aqui ainda.</p>
  }
  return (
    <InfiniteList query={history}>
      {groupByPeriod(items).map((group) => (
        <section key={group.title} aria-labelledby={`grupo-${group.title}`} className="mb-4">
          <h2
            id={`grupo-${group.title}`}
            className="mb-1 text-sm font-medium text-muted-foreground"
          >
            {group.title}
          </h2>
          <ul>
            {group.items.map((item, i) => (
              <AnimatedItem key={`${item.date}-${i}`} index={i}>
                <HistoryItemRow item={item} when={itemTime(item.date)} />
              </AnimatedItem>
            ))}
          </ul>
        </section>
      ))}
    </InfiniteList>
  )
}

export function HistoryPage() {
  const navigate = useNavigate()
  const authenticated = useAuthenticated()
  const [filter, setFilter] = useState<HistoryFilter>('all')

  if (!authenticated) return <Navigate to="/login" replace state={{ de: '/profile/history' }} />

  return (
    <div className="mx-auto h-full w-full lg:max-w-3xl">
      <ScreenWithBack title="Histórico" onBack={() => navigate('/profile')}>
        <SegmentedControl<HistoryFilter>
          label="Filtrar histórico"
          options={filters}
          value={filter}
          onChange={setFilter}
          className="mb-4"
        />
        <List filter={filter} />
      </ScreenWithBack>
    </div>
  )
}
