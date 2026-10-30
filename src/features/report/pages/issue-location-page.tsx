import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { Button } from '@/common/ui/button'
import { useRequireAccount } from '@/features/auth'
import { isApiError } from '@/infrastructure/api'

import { duplicatesQuery } from '../api/use-report'
import { AddressCard } from '../components/address-card'
import { ReportMap } from '../components/report-map'
import { ReportStep } from '../components/report-step'
import { useRequireCategory, useDraft } from '../hooks/use-draft'
import { useResumeReport } from '../hooks/use-resume-report'
import { categoryPath } from '../models/routes'

export function IssueLocationPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const requireAccount = useRequireAccount()
  const { category, categoryId, location } = useDraft()
  const [checkingDuplicates, setCheckingDuplicates] = useState(false)
  useRequireCategory('issue')

  async function confirm() {
    if (categoryId === null || !location) return
    setCheckingDuplicates(true)
    try {
      const duplicates = await queryClient.fetchQuery(duplicatesQuery(categoryId, location))
      navigate(duplicates.length > 0 ? '/registrar/conferencia' : '/registrar/revisao')
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        requireAccount('report', () => {}, {
          returnTo: '/registrar/local',
          pending: { type: 'resumeReport', step: 'checkDuplicates' },
        })
        return
      }
      navigate('/registrar/revisao')
    } finally {
      setCheckingDuplicates(false)
    }
  }
  useResumeReport('checkDuplicates', () => void confirm())

  return (
    <ReportStep
      title="Onde fica?"
      step={{ current: 2, total: 4, label: 'Local' }}
      topAction="back"
      onTopAction={() => navigate(categoryPath('issue'))}
      map={<ReportMap mode="pin" category={category} />}
      footer={
        <Button
          className="w-full"
          disabled={!location || checkingDuplicates}
          onClick={() => void confirm()}
        >
          {checkingDuplicates ? 'Conferindo…' : 'Confirmar local'}
        </Button>
      }
    >
      <AddressCard />
    </ReportStep>
  )
}
