import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { Schema } from '@/infrastructure/api'

export type AccountReason = 'vote' | 'report'

export type PendingActionKind =
  | { type: 'vote'; issueId: string; value: Schema<'VoteAnswer'> }
  | { type: 'resumeReport'; step: 'checkDuplicates' | 'submit' }

export interface PendingAction {
  returnTo: string
  action: PendingActionKind | null
}

interface GuardState {
  reason: AccountReason | null
  expired: boolean
  pendingAction: PendingAction | null
  askForAccount(reason: AccountReason, pendingAction: PendingAction, expired?: boolean): void
  closeSheet(): void
  discard(): void
  completeLogin(): string | null
  consumeAction(filter: (action: PendingActionKind) => boolean): PendingActionKind | null
}

export const useGuardStore = create<GuardState>()(
  persist(
    (set, get) => ({
      reason: null,
      expired: false,
      pendingAction: null,
      askForAccount: (reason, pendingAction, expired = false) =>
        set({ reason, pendingAction, expired }),
      closeSheet: () => set({ reason: null }),
      discard: () => set({ reason: null, pendingAction: null, expired: false }),
      completeLogin: () => {
        const { pendingAction } = get()
        set({
          reason: null,
          expired: false,
          pendingAction: pendingAction?.action ? pendingAction : null,
        })
        return pendingAction?.returnTo ?? null
      },
      consumeAction: (filter) => {
        const action = get().pendingAction?.action ?? null
        if (!action || !filter(action)) return null
        set({ pendingAction: null })
        return action
      },
    }),
    {
      name: 'urbanReports.pendingAction',
      storage: createJSONStorage(() => sessionStorage),
      partialize: ({ pendingAction }) => ({ pendingAction }),
    },
  ),
)
