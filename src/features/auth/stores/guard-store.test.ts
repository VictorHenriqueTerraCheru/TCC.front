import { useGuardStore, type PendingActionKind } from './guard-store'

const vote: PendingActionKind = { type: 'vote', issueId: 'p-1', value: 'yes' }
const pendingAction = { returnTo: '/problemas/p-1?tab=1', action: vote }

beforeEach(() => {
  useGuardStore.setState({ reason: null, expired: false, pendingAction: null })
  sessionStorage.clear()
})

describe('guard-store (rules 1 and 13)', () => {
  it('askForAccount opens the sheet and stores the action with the return route', () => {
    useGuardStore.getState().askForAccount('vote', pendingAction)

    expect(useGuardStore.getState()).toMatchObject({
      reason: 'vote',
      expired: false,
      pendingAction,
    })
  })

  it('askForAccount marks the expiration when the token expired', () => {
    useGuardStore.getState().askForAccount('vote', pendingAction, true)

    expect(useGuardStore.getState().expired).toBe(true)
  })

  it('closeSheet keeps the pending action (the guest went to login/sign up)', () => {
    useGuardStore.getState().askForAccount('report', pendingAction)
    useGuardStore.getState().closeSheet()

    expect(useGuardStore.getState().reason).toBeNull()
    expect(useGuardStore.getState().pendingAction).toEqual(pendingAction)
  })

  it('discard ("Agora não") forgets sheet, action and expiration', () => {
    useGuardStore.getState().askForAccount('vote', pendingAction, true)
    useGuardStore.getState().discard()

    expect(useGuardStore.getState()).toMatchObject({
      reason: null,
      expired: false,
      pendingAction: null,
    })
  })

  it('completeLogin returns the return route and keeps the action for the destination screen', () => {
    useGuardStore.getState().askForAccount('vote', pendingAction, true)

    expect(useGuardStore.getState().completeLogin()).toBe('/problemas/p-1?tab=1')
    expect(useGuardStore.getState()).toMatchObject({ reason: null, expired: false, pendingAction })
  })

  it('completeLogin without a pending action returns the return route but stores nothing', () => {
    useGuardStore.getState().askForAccount('report', { returnTo: '/map', action: null })

    expect(useGuardStore.getState().completeLogin()).toBe('/map')
    expect(useGuardStore.getState().pendingAction).toBeNull()
  })

  it('completeLogin without pending returns null', () => {
    expect(useGuardStore.getState().completeLogin()).toBeNull()
  })

  it('consumeAction delivers the action only once', () => {
    useGuardStore.getState().askForAccount('vote', pendingAction)

    expect(useGuardStore.getState().consumeAction((a) => a.type === 'vote')).toEqual(vote)
    expect(useGuardStore.getState().consumeAction((a) => a.type === 'vote')).toBeNull()
  })

  it('consumeAction keeps the action when it does not belong to the asking screen', () => {
    useGuardStore.getState().askForAccount('vote', pendingAction)

    expect(useGuardStore.getState().consumeAction((a) => a.type === 'resumeReport')).toBeNull()
    expect(useGuardStore.getState().pendingAction).toEqual(pendingAction)
  })

  it('only the pending action goes to sessionStorage; the open sheet does not survive a reload', () => {
    useGuardStore.getState().askForAccount('vote', pendingAction, true)

    const stored = JSON.parse(sessionStorage.getItem('urbanReports.pendingAction') ?? '{}')
    expect(stored.state).toEqual({ pendingAction })
  })
})
