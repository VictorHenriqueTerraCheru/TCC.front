import { useNavigate } from 'react-router'

import { Skeleton } from '@/common/ui/skeleton'
import { Button } from '@/common/ui/button'
import { CategoryIcon } from '@/features/categories'

import { ReportMap } from '../components/report-map'
import { ReportStep } from '../components/report-step'
import { TimePicker } from '../components/time-picker'
import { useDraftAddress, useRequireCategory, useDraft } from '../hooks/use-draft'
import { categoryPath } from '../models/routes'

export function IncidentLocationPage() {
  const navigate = useNavigate()
  const { category, location, time, setTime } = useDraft()
  const { data: address, updating } = useDraftAddress()
  useRequireCategory('incident')

  return (
    <ReportStep
      title="Onde aconteceu?"
      step={{ current: 2, total: 3, label: `Local · ${category?.name ?? ''}` }}
      topAction="back"
      onTopAction={() => navigate(categoryPath('incident'))}
      map={<ReportMap mode="area" />}
      footer={
        <Button
          className="w-full"
          disabled={!location}
          onClick={() => navigate('/registrar/incidente/revisao')}
        >
          Continuar
        </Button>
      }
    >
      <div className="space-y-5">
        <div className="flex gap-3" aria-live="polite">
          {category && <CategoryIcon category={category} />}
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Área aproximada · raio de 150 m</p>
            {updating || !address ? (
              <Skeleton className="mt-1 h-5 w-4/5 bg-muted" />
            ) : (
              <p className="font-medium">{address.areaLabel ?? address.address}</p>
            )}
            <p className="text-xs text-muted-foreground">O ponto exato não é salvo nem exibido.</p>
          </div>
        </div>
        <TimePicker time={time} onChange={setTime} />
      </div>
    </ReportStep>
  )
}
