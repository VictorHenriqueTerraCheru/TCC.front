import { useLocation } from 'react-router'

import { useGuardStore, type PendingActionKind, type AccountReason } from '../stores/guard-store'
import { currentSession } from '../stores/session-store'

interface GuardOptions {
  pending?: PendingActionKind
  returnTo?: string
}

export function useRequireAccount() {
  const location = useLocation()

  return (reason: AccountReason, action: () => void, options: GuardOptions = {}) => {
    if (currentSession()) {
      action()
      return
    }
    const guard = useGuardStore.getState()
    guard.askForAccount(
      reason,
      {
        returnTo: options.returnTo ?? `${location.pathname}${location.search}`,
        action: options.pending ?? null,
      },
      guard.expired,
    )
  }
}

export function useConsumePendingAction() {
  return useGuardStore((s) => s.consumeAction)
}
