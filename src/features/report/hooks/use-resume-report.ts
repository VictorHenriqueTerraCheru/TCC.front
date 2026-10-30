import { useEffect, useRef } from 'react'

import { useAuthenticated, useConsumePendingAction } from '@/features/auth'

type Step = 'checkDuplicates' | 'submit'

export function useResumeReport(step: Step, action: () => void) {
  const authenticated = useAuthenticated()
  const consumeAction = useConsumePendingAction()
  const actionRef = useRef(action)
  useEffect(() => {
    actionRef.current = action
  })

  useEffect(() => {
    if (!authenticated) return
    const pending = consumeAction((a) => a.type === 'resumeReport' && a.step === step)
    if (pending) actionRef.current()
  }, [authenticated, consumeAction, step])
}
