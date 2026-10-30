import type { MaterialSymbol } from 'material-symbols'
import { Link } from 'react-router'

import { Icon } from '@/common/components/icone'
import { cn } from '@/common/lib/utils'
import { CategoryIcon, useAppearance } from '@/features/categorias'

import { itemTitle, type HistoryItem } from '../models/historico'

const chips: Partial<
  Record<NonNullable<HistoryItem['issueStatus']>, { label: string; cssClass: string }>
> = {
  new: { label: 'Nova', cssClass: 'bg-primario-suave text-primario' },
  active: { label: 'Ativa', cssClass: 'bg-muted text-foreground' },
  possiblyResolved: {
    label: 'Possivelmente resolvida',
    cssClass: 'bg-primario-suave text-primario',
  },
  resolved: { label: 'Resolvida', cssClass: 'bg-primario-suave text-primario' },
}

const isReport = (type: HistoryItem['type']) => type === 'issueReport' || type === 'incidentReport'

function IconItem({ item }: { item: HistoryItem }) {
  const { appearanceOf } = useAppearance()
  if (isReport(item.type)) return <CategoryIcon category={item.category} />
  const appearance = appearanceOf(item.category)
  const icon: MaterialSymbol = 'how_to_vote'
  return (
    <span
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-full',
        appearance.light,
        appearance.strong,
      )}
    >
      <Icon name={icon} className="text-[22px]" />
    </span>
  )
}

export function HistoryItemRow({ item, when }: { item: HistoryItem; when: string }) {
  const chip = item.type === 'issueReport' && item.issueStatus ? chips[item.issueStatus] : undefined
  const content = (
    <>
      <IconItem item={item} />
      <div className="min-w-0 flex-1">
        <p className="leading-5">{itemTitle(item)}</p>
        <p className="text-sm text-muted-foreground">
          {[item.address, when].filter(Boolean).join(' · ')}
        </p>
      </div>
      {chip && (
        <span className={cn('shrink-0 rounded-md px-2 py-0.5 text-xs font-medium', chip.cssClass)}>
          {chip.label}
        </span>
      )}
    </>
  )
  const cssClass = 'flex items-center gap-3 py-2.5'
  return item.reportId ? (
    <Link
      to={`/mapa/problema/${item.reportId}`}
      className={cn(cssClass, '-mx-2 rounded-xl px-2 hover:bg-card focus-visible:outline-2')}
    >
      {content}
    </Link>
  ) : (
    <div className={cssClass}>{content}</div>
  )
}
