import { create } from 'zustand'

export type AccountReason = 'vote' | 'report'

interface GuardState {
  reason: AccountReason | null
  returnTo: string | null
  expired: boolean
  askForAccount(reason: AccountReason, returnTo: string): void
  closeSheet(): void
  discard(): void
  completeLogin(): string | null
}

export const useGuardStore = create<GuardState>()((set, get) => ({
  reason: null,
  returnTo: null,
  expired: false,
  askForAccount: (reason, returnTo) => set({ reason, returnTo }),
  closeSheet: () => set({ reason: null }),
  discard: () => set({ reason: null, returnTo: null, expired: false }),
  completeLogin: () => {
    const { returnTo } = get()
    set({ reason: null, returnTo: null, expired: false })
    return returnTo
  },
}))
