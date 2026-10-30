import { useState } from 'react'

import { useRequireAccount } from '@/features/auth'
import { isApiError, isNetworkError } from '@/infrastructure/api'

import { reportErrorMessage } from '../errors'

export function useSubmission<Variables, Result>(
  run: (variables: Variables) => Promise<Result>,
  onSuccess: (result: Result, variables: Variables) => void,
) {
  const requireAccount = useRequireAccount()
  const [failureOpen, setFailureOpen] = useState(false)
  const [ruleError, setRuleError] = useState<string | null>(null)
  const [lastVariables, setLastVariables] = useState<Variables | null>(null)

  function send(variables: Variables) {
    setRuleError(null)
    setFailureOpen(false)
    setLastVariables(variables)
    run(variables).then(
      (result) => onSuccess(result, variables),
      (error: unknown) => {
        if (isNetworkError(error)) setFailureOpen(true)
        else if (isApiError(error) && error.status === 401) requireAccount('report', () => {})
        else setRuleError(reportErrorMessage(error))
      },
    )
  }

  return {
    send,
    ruleError,
    failure: {
      open: failureOpen,
      onOpenChange: setFailureOpen,
      onRetry: () => lastVariables !== null && send(lastVariables),
    },
  }
}
