import { create } from 'zustand'

export type AccountReason = 'vote' | 'report'

interface GuardState {
  reason: AccountReason | null
  returnTo: string | null
  expired: boolean
  askForAccount(reason: AccountReason, returnTo: string): void
  closeSheet(): void
  discard(): void
}

export const useGuardStore = create<GuardState>()((set) => ({
  reason: null,
  returnTo: null,
  expired: false,
  askForAccount: (reason, returnTo) => set({ reason, returnTo }),
  closeSheet: () => set({ reason: null, returnTo: null }),
  discard: () => set({ reason: null, returnTo: null, expired: false }),
}))
