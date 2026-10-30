import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useId } from 'react'
import { useNavigate } from 'react-router'

import { Icon } from '@/common/components/icon'
import { Button } from '@/common/ui/button'
import { CategoryIcon } from '@/features/categories'

import { useReportIssue } from '../api/use-report'
import { SubmissionFailedDialog } from '../components/submission-failed-dialog'
import { ReportStep } from '../components/report-step'
import { SummaryRow, Summary } from '../components/summary'
import { useSubmission } from '../hooks/use-submission'
import { useResumeReport } from '../hooks/use-resume-report'
import { useDraftAddress, useRequireCategory, useRequireStep, useDraft } from '../hooks/use-draft'
import { categoryPath } from '../models/routes'

const DESCRIPTION_LIMIT = 280

export function IssueReviewPage() {
  const navigate = useNavigate()
  const descriptionId = useId()
  const { category, categoryId, location, description, setDescription } = useDraft()
  const { data: address } = useDraftAddress()
  const report = useReportIssue()
  useRequireCategory('issue')
  useRequireStep(location !== null, '/report/location')

  const submission = useSubmission(report.mutateAsync, (issue) => {
    navigate('/report/success', { replace: true, state: { issue } })
  })

  function send() {
    if (categoryId === null || !location) return
    submission.send({ categoryId, ...location, description })
  }
  useResumeReport('submit', send)

  return (
    <ReportStep
      title="Revisão"
      step={{ current: 4, total: 4, label: 'Revisão' }}
      topAction="back"
      onTopAction={() => navigate('/report/location')}
      footer={
        <Button className="w-full" loading={report.isPending} onClick={send}>
          <Icon name="send" className="text-[18px]" />
          {report.isPending ? 'Enviando…' : 'Enviar registro'}
        </Button>
      }
    >
      <div className="space-y-6 pt-2">
        <div>
          <div className="relative">
            <textarea
              id={descriptionId}
              value={description}
              maxLength={DESCRIPTION_LIMIT}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              aria-describedby={`${descriptionId}-ajuda`}
              className="w-full resize-none rounded-md border border-input bg-background px-4 py-4 text-base outline-none focus:border-2 focus:border-brand focus:px-[15px]"
            />
            <label
              htmlFor={descriptionId}
              className="absolute -top-2 left-3 bg-background px-1 text-xs text-muted-foreground"
            >
              Descrição (opcional)
            </label>
          </div>
          <p
            id={`${descriptionId}-ajuda`}
            className="mt-1 flex justify-between px-4 text-xs text-muted-foreground"
          >
            <span>O que ajuda a identificar o problema</span>
            <span aria-label={`${description.length} de ${DESCRIPTION_LIMIT} caracteres`}>
              {description.length}/{DESCRIPTION_LIMIT}
            </span>
          </p>
        </div>

        <Summary>
          <SummaryRow
            icon={
              category ? (
                <CategoryIcon category={category} pageSize="sm" className="bg-transparent" />
              ) : (
                'category'
              )
            }
            label="Categoria"
            value={category?.name ?? '—'}
            onEdit={() => navigate(categoryPath('issue'))}
          />
          <SummaryRow icon="keep" label="Tipo" value="Problema — fica no mapa até ser resolvido" />
          <SummaryRow
            icon="location_on"
            label="Local aproximado"
            value={address?.address ?? 'Buscando endereço…'}
            onEdit={() => navigate('/report/location')}
          />
          <SummaryRow
            icon="schedule"
            label="Data e hora"
            value={format(new Date(), "'Hoje', d MMM. · HH:mm", { locale: ptBR })}
          />
        </Summary>

        <p className="flex gap-2 text-xs text-muted-foreground">
          <Icon name="info" className="text-[18px]" />
          Seu registro entra com o selo "Nova" até receber avaliações de quem está por perto.
        </p>

        {submission.ruleError && (
          <p role="alert" className="text-sm text-destructive">
            {submission.ruleError}
          </p>
        )}
      </div>
      <SubmissionFailedDialog {...submission.failure} />
    </ReportStep>
  )
}
