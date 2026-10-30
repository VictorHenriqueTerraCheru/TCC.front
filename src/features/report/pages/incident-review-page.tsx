import { useNavigate } from 'react-router'

import { Icon } from '@/common/components/icon'
import { Button } from '@/common/ui/button'
import { CategoryIcon } from '@/features/categories'

import { useReportIncident } from '../api/use-report'
import { SubmissionFailedDialog } from '../components/submission-failed-dialog'
import { ReportStep } from '../components/report-step'
import { SummaryRow, Summary } from '../components/summary'
import { useSubmission } from '../hooks/use-submission'
import { useResumeReport } from '../hooks/use-resume-report'
import { useDraftAddress, useRequireCategory, useRequireStep, useDraft } from '../hooks/use-draft'
import { describeTime, occurredAt } from '../models/time'
import { categoryPath } from '../models/routes'

export function IncidentReviewPage() {
  const navigate = useNavigate()
  const { category, categoryId, location, time } = useDraft()
  const { data: address } = useDraftAddress()
  const report = useReportIncident()
  useRequireCategory('incident')
  useRequireStep(location !== null, '/registrar/incidente/local')

  const submission = useSubmission(
    report.mutateAsync,
    (area, { categoryId: chosenCategoryId, lat, lng }) => {
      navigate('/registrar/incidente/sucesso', {
        replace: true,
        state: {
          area,
          categoryId: chosenCategoryId,
          areaLabel: address?.areaLabel ?? null,
          neighborhood: address?.neighborhood ?? null,
          point: { lat, lng },
        },
      })
    },
  )

  function send() {
    if (categoryId === null || !location) return
    submission.send({ categoryId, ...location, occurredAt: occurredAt(time) })
  }
  useResumeReport('submit', send)

  return (
    <ReportStep
      title="Revisão"
      step={{ current: 3, total: 3, label: 'Revisão' }}
      topAction="back"
      onTopAction={() => navigate('/registrar/incidente/local')}
      footer={
        <Button className="w-full" loading={report.isPending} onClick={send}>
          <Icon name="send" className="text-[18px]" />
          {report.isPending ? 'Enviando…' : 'Enviar registro'}
        </Button>
      }
    >
      <div className="space-y-6 pt-2">
        <section className="flex gap-3 rounded-2xl bg-brand-soft p-4 text-brand">
          <Icon name="visibility_off" className="text-[22px]" />
          <div>
            <h2 className="font-medium">Registro anônimo e agregado</h2>
            <p className="text-sm">
              Seu nome não aparece. O relato soma-se ao mapa de calor da região e não vira marcador
              individual. Incidentes não recebem votos.
            </p>
          </div>
        </section>

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
            onEdit={() => navigate(categoryPath('incident'))}
          />
          <SummaryRow icon="blur_on" label="Tipo" value="Incidente — entra no mapa de calor" />
          <SummaryRow
            icon="location_on"
            label="Área aproximada"
            value={address ? (address.areaLabel ?? address.address) : 'Buscando endereço…'}
            onEdit={() => navigate('/registrar/incidente/local')}
          />
          <SummaryRow
            icon="schedule"
            label="Quando"
            value={describeTime(time)}
            onEdit={() => navigate('/registrar/incidente/local')}
          />
        </Summary>

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
