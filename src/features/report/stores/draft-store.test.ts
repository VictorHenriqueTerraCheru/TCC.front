import { useDraftStore } from './draft-store'

beforeEach(() => {
  useDraftStore.getState().clear()
  sessionStorage.clear()
})

describe('report draft (rule 5)', () => {
  it('starts empty, with time "now"', () => {
    expect(useDraftStore.getState()).toMatchObject({
      categoryId: null,
      location: null,
      description: '',
      time: { mode: 'now', otherAt: null },
    })
  })

  it('stores category, location, description and time', () => {
    const { chooseCategory, setLocation, setDescription, setTime } = useDraftStore.getState()
    chooseCategory(3)
    setLocation({ lat: -22.95, lng: -43.18 })
    setDescription('Buraco fundo na calçada')
    setTime({ mode: 'other', otherAt: '2026-10-20T10:00:00.000Z' })

    expect(useDraftStore.getState()).toMatchObject({
      categoryId: 3,
      location: { lat: -22.95, lng: -43.18 },
      description: 'Buraco fundo na calçada',
      time: { mode: 'other', otherAt: '2026-10-20T10:00:00.000Z' },
    })
  })

  it('setLocation with the same center keeps the object (does not restart the address debounce)', () => {
    useDraftStore.getState().setLocation({ lat: -22.95, lng: -43.18 })
    const before = useDraftStore.getState().location

    useDraftStore.getState().setLocation({ lat: -22.95, lng: -43.18 })

    expect(useDraftStore.getState().location).toBe(before)
  })

  it('setLocation with another center replaces the object', () => {
    useDraftStore.getState().setLocation({ lat: -22.95, lng: -43.18 })
    const before = useDraftStore.getState().location

    useDraftStore.getState().setLocation({ lat: -22.95, lng: -43.19 })

    expect(useDraftStore.getState().location).not.toBe(before)
    expect(useDraftStore.getState().location).toEqual({ lat: -22.95, lng: -43.19 })
  })

  it('clear goes back to the initial state', () => {
    const { chooseCategory, setLocation, setDescription, clear } = useDraftStore.getState()
    chooseCategory(3)
    setLocation({ lat: -22.95, lng: -43.18 })
    setDescription('x')

    clear()

    expect(useDraftStore.getState()).toMatchObject({
      categoryId: null,
      location: null,
      description: '',
      time: { mode: 'now', otherAt: null },
    })
  })

  it('persists in sessionStorage, to survive a reload and a submit failure', () => {
    useDraftStore.getState().setDescription('Poste apagado')

    const stored = JSON.parse(sessionStorage.getItem('ocorrencias.rascunhoRegistro') ?? '{}')
    expect(stored.state.description).toBe('Poste apagado')
  })
})
