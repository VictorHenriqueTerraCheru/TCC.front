import { m } from 'motion/react'
import { useEffect, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { FAST_SPRING } from '@/common/lib/motion'
import { Button } from '@/common/ui/button'
import { iconOf, useAppearance } from '@/features/categories'
import { IssueMarker, type IssueDetailData } from '@/features/issues'

import { useDraftStore } from '../stores/draft-store'

interface SuccessScreenProps {
  title: string
  text: string
  card?: ReactNode
  viewOnMap: string
}

export function SuccessScreen({ title, text, card, viewOnMap }: SuccessScreenProps) {
  const navigate = useNavigate()
  const clear = useDraftStore((s) => s.clear)

  useEffect(() => clear(), [clear])

  return (
    <div className="mx-auto flex h-full max-w-md flex-col px-6 pt-20 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:pt-16">
      <m.span
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={FAST_SPRING}
        className="mb-8 flex size-16 items-center justify-center rounded-full bg-primario-suave text-primario"
      >
        <svg viewBox="0 0 24 24" aria-hidden className="size-9">
          <circle cx="12" cy="12" r="10" fill="currentColor" />
          <m.path
            d="M7.5 12.5l3 3 6-6.5"
            fill="none"
            stroke="var(--card)"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.35, delay: 0.2, ease: 'easeOut' }}
          />
        </svg>
      </m.span>
      <h1 className="mb-4 text-[28px] leading-9">{title}</h1>
      <p className="mb-6">{text}</p>
      {card}
      <div className="mt-auto flex flex-col gap-2 pt-8">
        <Button onClick={() => navigate(viewOnMap, { replace: true })}>Ver no mapa</Button>
        <Button
          variant="outline"
          onClick={() => {
            clear()
            navigate('/registrar', { replace: true })
          }}
        >
          Registrar outra
        </Button>
      </div>
    </div>
  )
}

export function IssueSuccessPage() {
  const { state } = useLocation()
  const { appearanceOf } = useAppearance()
  const { issue, confirmation } = (state ?? {}) as {
    issue?: IssueDetailData
    confirmation?: boolean
  }

  const card = issue && (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-1">
      <span className="shrink-0 pr-6">
        <IssueMarker
          color={appearanceOf(issue.category).strongColor}
          icon={iconOf(issue.category)}
          status={issue.status}
          band={issue.band}
        />
      </span>
      <div className="min-w-0">
        <p className="font-medium">{issue.category.name}</p>
        <p className="text-xs text-muted-foreground">{issue.address}</p>
      </div>
    </div>
  )

  if (confirmation) {
    return (
      <SuccessScreen
        title="Confirmação registrada"
        text="Sua confirmação foi registrada e reforça o registro que já estava no mapa, em vez de criar uma duplicata."
        card={card}
        viewOnMap={issue ? `/mapa/problema/${issue.id}` : '/mapa'}
      />
    )
  }

  return (
    <SuccessScreen
      title="Registro enviado"
      text='Sua ocorrência já aparece no mapa com o selo "Nova". Ela fica em período de avaliação até que pessoas por perto confirmem.'
      card={card}
      viewOnMap={issue ? `/mapa/problema/${issue.id}` : '/mapa'}
    />
  )
}
