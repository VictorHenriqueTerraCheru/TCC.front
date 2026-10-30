import { useLocation } from 'react-router'

import { useGuardStore, type AccountReason } from '../stores/guard-store'
import { currentSession } from '../stores/session-store'

export function useRequireAccount() {
  const location = useLocation()

  return (reason: AccountReason, action: () => void, returnTo?: string) => {
    if (currentSession()) {
      action()
      return
    }
    useGuardStore
      .getState()
      .askForAccount(reason, returnTo ?? `${location.pathname}${location.search}`)
  }
}
