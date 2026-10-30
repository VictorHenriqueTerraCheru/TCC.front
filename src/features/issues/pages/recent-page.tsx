import type { MaterialSymbol } from 'material-symbols'
import { useState } from 'react'
import { Link } from 'react-router'

import { FilterChip } from '@/common/components/filter-chip'
import { Icon } from '@/common/components/icon'
import { InfiniteList } from '@/common/components/infinite-list'
import { Page } from '@/common/components/page'
import { relativeTime } from '@/common/lib/formatting'
import { DEFAULT_CENTER } from '@/common/lib/map'
import { cn } from '@/common/lib/utils'
import { Skeleton } from '@/common/ui/skeleton'
import { AnimatedItem } from '@/common/components/animated-item'
import { LoadError } from '@/common/components/load-error'
import {
  colorAppearance,
  CategoryIcon,
  groupsOfType,
  GroupDot,
  useAppearance,
  useGroups,
} from '@/features/categories'
import { useGeolocation } from '@/features/location'
import type { Schema } from '@/infrastructure/api'

import { RECENT_RADIUS_KM, useRecent } from '../api/use-recent'
import type { TrustBand } from '../models/issue'

type RecentItem = Schema<'ListRecentIssuesItem'>

const band: Record<TrustBand, { label: string; icon: MaterialSymbol }> = {
  high: { label: 'Alta', icon: 'signal_cellular_alt' },
  medium: { label: 'Média', icon: 'signal_cellular_alt_2_bar' },
  low: { label: 'Baixa', icon: 'signal_cellular_alt_1_bar' },
}

function RecentCard({ item }: { item: RecentItem }) {
  const possible = item.status === 'possiblyResolved'
  return (
    <Link
      to={`/map/issue/${item.id}`}
      className="flex pressable gap-3 rounded-[20px] border border-border bg-card p-3 shadow-1 hover:bg-surface-2 focus-visible:outline-2"
    >
      <CategoryIcon category={item.category} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{item.category.name}</p>
          {item.status === 'new' && (
            <span className="rounded bg-new-badge px-1.5 text-[11px] leading-4 text-new-badge-foreground">
              Nova
            </span>
          )}
          {item.band && (
            <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
              <Icon name={band[item.band].icon} className="text-[16px] text-brand" />
              {band[item.band].label}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">{item.address}</p>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Icon name="schedule" className="text-[16px]" />
            {relativeTime(item.createdAt)}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium',
              possible ? 'bg-brand-soft text-brand' : 'bg-muted',
            )}
          >
            <Icon
              name={
                possible ? 'help' : item.status === 'new' ? 'hourglass_top' : 'radio_button_checked'
              }
              filled
              className="text-[14px]"
            />
            {possible
              ? 'Possivelmente resolvida'
              : item.status === 'new'
                ? 'Em avaliação'
                : 'Ativa'}
          </span>
        </p>
      </div>
    </Link>
  )
}

export function RecentPage() {
  const { state, position } = useGeolocation()
  const { groups: all, loaded } = useAppearance()
  const groupsQuery = useGroups()
  const [chosenItems, setGroups] = useState<string[]>([])
  const groups = loaded ? chosenItems.filter((g) => all.some((t) => t.key === g)) : chosenItems
  const center =
    state === 'granted' && position ? position : { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] }
  const recent = useRecent(center, groups)
  const items = recent.data?.pages.flatMap((p) => p.items) ?? []

  const toggle = (group: string) =>
    setGroups(() =>
      groups.includes(group) ? groups.filter((g) => g !== group) : [...groups, group],
    )

  if (groupsQuery.isError) {
    return (
      <Page title="Recentes">
        <LoadError
          message="Não foi possível carregar os filtros."
          onRetry={() => void groupsQuery.refetch()}
        />
      </Page>
    )
  }

  return (
    <Page title="Recentes">
      <p className="-mt-2 mb-3 text-xs text-muted-foreground">
        {state === 'granted' && position ? 'Perto de você' : 'Perto de Icaraí'} · até{' '}
        {RECENT_RADIUS_KM} km
      </p>
      <div
        role="group"
        aria-label="Filtros"
        className="-mx-4 mb-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1"
      >
        {groupsOfType(all, 'issue').map((group) => {
          const selected = groups.includes(group.key)
          return (
            <FilterChip key={group.key} selected={selected} onClick={() => toggle(group.key)}>
              {selected ? (
                <Icon name="check" filled className="text-[18px]" />
              ) : (
                <GroupDot color={colorAppearance[group.color]} />
              )}
              {group.label}
            </FilterChip>
          )
        })}
      </div>

      {recent.isPending ? (
        <div className="space-y-2" aria-label="Carregando recentes">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl bg-muted" />
          ))}
        </div>
      ) : recent.isError ? (
        <LoadError
          message="Não foi possível carregar os recentes."
          onRetry={() => void recent.refetch()}
        />
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Nenhum problema registrado nesta região.
        </p>
      ) : (
        <InfiniteList query={recent}>
          <ul className="space-y-2">
            {items.map((item, i) => (
              <AnimatedItem key={item.id} index={i}>
                <RecentCard item={item} />
              </AnimatedItem>
            ))}
          </ul>
        </InfiniteList>
      )}
    </Page>
  )
}
