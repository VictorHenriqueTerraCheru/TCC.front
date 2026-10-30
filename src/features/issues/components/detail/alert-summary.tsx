import type { MaterialSymbol } from 'material-symbols'
import { m } from 'motion/react'

import { Icon } from '@/common/components/icon'
import { DynamicIcon } from '@/common/components/remote-icon'
import { useResponsivePanel } from '@/common/hooks/use-responsive-panel'
import { distanceText } from '@/common/lib/formatting'
import { FAST_SPRING } from '@/common/lib/motion'
import { cn } from '@/common/lib/utils'
import { iconOf, useAppearance } from '@/features/categories'

import { voteErrorMessage } from '../../errors'
import { useDistanceTo } from '../../hooks/use-distance-to'
import { useVotes } from '../../hooks/use-votes'
import type { IssueDetail } from '../../models/issue'

export const SUMMARY_HEIGHT = 236

interface Thumb {
  label: string
  icon: MaterialSymbol
  color: string
  checked: boolean
  vote(): void
}

function ThumbButton({ thumb, disabled }: { thumb: Thumb; disabled: boolean }) {
  return (
    <button
      type="button"
      aria-label={`Voto rápido: ${thumb.label}`}
      aria-pressed={thumb.checked}
      disabled={disabled}
      onClick={thumb.vote}
      className={cn(
        'flex size-11 pressable items-center justify-center rounded-full bg-foreground/8 hover:bg-foreground/12 focus-visible:outline-2 disabled:opacity-40',
        thumb.checked && 'ring-2 ring-current',
      )}
      style={{ color: thumb.color }}
    >
      <m.span
        initial={false}
        animate={thumb.checked ? { scale: [1, 1.3, 1], rotate: [0, -12, 0] } : { scale: 1 }}
        transition={thumb.checked ? { duration: 0.4, ease: 'easeOut' } : FAST_SPRING}
        className="flex"
      >
        <Icon name={thumb.icon} filled={thumb.checked} className="text-[21px]" />
      </m.span>
    </button>
  )
}

export function AlertSummary({ issue }: { issue: IssueDetail }) {
  const { appearanceOf } = useAppearance()
  const appearance = appearanceOf(issue.category)
  const { collapsed, expand, measureSummary } = useResponsivePanel()
  const distance = useDistanceTo(issue)
  const { error, vote, myVote, voting, canVote } = useVotes(issue)

  const thumbs: [Thumb, Thumb] = [
    {
      label: 'Sim, está lá',
      icon: 'thumb_up',
      color: 'var(--vote-yes)',
      checked: myVote === 'yes',
      vote: () => vote('yes'),
    },
    {
      label: 'Não está lá',
      icon: 'thumb_down',
      color: 'var(--vote-no)',
      checked: myVote === 'no',
      vote: () => vote('no'),
    },
  ]

  return (
    <section
      ref={measureSummary}
      aria-label="Resumo do alerta"
      className={cn(collapsed && 'cursor-pointer')}
      onClick={(event) => {
        if (!(event.target as Element).closest('button')) expand()
      }}
    >
      <div className="flex items-center gap-3 pr-10">
        <span
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-full text-white"
          style={{ background: appearance.strongColor }}
        >
          <DynamicIcon name={iconOf(issue.category)} filled className="text-[26px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn('text-xs font-semibold', appearance.strong)}>{appearance.label}</p>
          <h2 className="truncate text-[20px] leading-7 font-semibold">{issue.category.name}</h2>
        </div>
      </div>
      <div className="mt-3 space-y-1 text-[13px] text-muted-foreground">
        <p className="flex items-start gap-1.5">
          <Icon name="location_on" className="mt-px text-[16px]" />
          <span className="line-clamp-2">{issue.address}</span>
        </p>
        <p className="flex items-center gap-1.5">
          <Icon name="group" className="text-[16px]" />
          {issue.votes.yes} confirmaram
          {distance !== null && ` · ${distanceText(distance)} de você`}
        </p>
      </div>

      {canVote && collapsed && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-foreground/5 py-2 pr-2 pl-4">
          <p className="min-w-0 flex-1 text-[15px] font-semibold">Ainda está lá?</p>
          {thumbs.map((thumb) => (
            <ThumbButton key={thumb.label} thumb={thumb} disabled={voting} />
          ))}
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {voteErrorMessage(error)}
        </p>
      )}
    </section>
  )
}
