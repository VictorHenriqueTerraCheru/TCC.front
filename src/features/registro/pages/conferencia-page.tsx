import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { Icon } from '@/common/components/icone'
import { distanceText, relativeTime } from '@/common/lib/formatacao'
import { cn } from '@/common/lib/utils'
import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'
import { CategoryIcon } from '@/features/categorias'
import { issueDetailQuery, useVote } from '@/features/problemas'
import type { Schema } from '@/infrastructure/api'

import { duplicatesQuery } from '../api/use-registro'
import { reportErrorMessage } from '../errors'
import { ReportMap } from '../components/mapa-registro'
import { ReportStep } from '../components/passo-registro'
import { useRequireCategory, useRequireStep, useDraft } from '../hooks/use-rascunho'

type Duplicate = Schema<'SearchDuplicatesResponse'>

const bandLabel = { high: 'Confiança alta', medium: 'Confiança média', low: 'Confiança baixa' }

function DuplicateCard({
  duplicate,
  selected,
  onChoose,
}: {
  duplicate: Duplicate
  selected: boolean
  onChoose?(): void
}) {
  return (
    <button
      type="button"
      onClick={onChoose}
      aria-pressed={onChoose ? selected : undefined}
      disabled={!onChoose}
      className={cn(
        'flex w-full gap-3 rounded-2xl border bg-card p-3 text-left shadow-1 disabled:opacity-100',
        selected ? 'border-primario' : 'border-border/60',
      )}
    >
      <CategoryIcon category={duplicate.category} pageSize="sm" />
      <div className="min-w-0 text-sm">
        <p className="font-medium">{duplicate.category.name}</p>
        <p className="text-xs text-muted-foreground">
          {duplicate.address} · {relativeTime(duplicate.createdAt)}
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-primario">
          <Icon
            name={duplicate.band ? 'check_circle' : 'hourglass_top'}
            filled
            className="text-[16px]"
          />
          {duplicate.band ? bandLabel[duplicate.band] : 'Em avaliação'} · {duplicate.confirmations}{' '}
          {duplicate.confirmations === 1 ? 'confirmação' : 'confirmações'}
        </p>
      </div>
    </button>
  )
}

export function DuplicateCheckPage() {
  const navigate = useNavigate()
  const { category, categoryId, location } = useDraft()
  useRequireCategory('issue')
  useRequireStep(location !== null, '/registrar/local')

  const { data: duplicates } = useQuery({
    ...duplicatesQuery(categoryId ?? 0, location ?? { lat: 0, lng: 0 }),
    enabled: categoryId !== null && location !== null,
  })
  const [chosenId, setChosenId] = useState<string | null>(null)
  const chosen = duplicates?.find((d) => d.id === chosenId) ?? duplicates?.[0]
  const confirm = useVote(chosen?.id ?? '')
  const { data: neighbor } = useQuery({
    ...issueDetailQuery(chosen?.id ?? ''),
    enabled: chosen !== undefined,
  })

  useRequireStep(duplicates === undefined || duplicates.length > 0, '/registrar/revisao')

  function confirmExisting() {
    if (!chosen) return
    confirm.mutate('yes', {
      onSuccess: (issue) => {
        navigate('/registrar/sucesso', {
          replace: true,
          state: { issue, confirmation: true },
        })
      },
    })
  }

  const first = duplicates?.[0]
  return (
    <ReportStep
      title="Conferência"
      step={{ current: 3, total: 4, label: 'Registros próximos' }}
      topAction="back"
      onTopAction={() => navigate('/registrar/local')}
      map={
        location && chosen && neighbor?.id === chosen.id ? (
          <ReportMap
            mode="duplicateCheck"
            newPoint={location}
            existing={{ ...chosen, lat: neighbor.lat, lng: neighbor.lng }}
          />
        ) : (
          <ReportMap mode="static" />
        )
      }
      footer={
        <div className="flex flex-col gap-2">
          <Button disabled={!chosen || confirm.isPending} onClick={confirmExisting}>
            Sim, confirmar esse
          </Button>
          <Button variant="outline" onClick={() => navigate('/registrar/revisao')}>
            Não, é outro
          </Button>
        </div>
      }
    >
      {!first || !chosen ? (
        <Skeleton className="h-40 rounded-2xl bg-muted" />
      ) : (
        <div className="space-y-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-primario-suave text-primario">
            <Icon name="content_copy" className="text-[20px]" />
          </span>
          <h2 className="text-[22px] leading-7">
            Já existe um registro de {category?.name ?? first.category.name} a{' '}
            {distanceText(first.distanceMeters)}. É o mesmo?
          </h2>
          <p className="text-sm text-muted-foreground">
            Se for, sua confirmação reforça o registro existente em vez de criar uma duplicata.
          </p>
          <div className="max-h-56 space-y-2 overflow-y-auto">
            {duplicates.map((d) => (
              <DuplicateCard
                key={d.id}
                duplicate={d}
                selected={d.id === chosen.id}
                onChoose={duplicates.length > 1 ? () => setChosenId(d.id) : undefined}
              />
            ))}
          </div>
          {confirm.error && (
            <p role="alert" className="text-sm text-destructive">
              {reportErrorMessage(confirm.error)}
            </p>
          )}
        </div>
      )}
    </ReportStep>
  )
}
