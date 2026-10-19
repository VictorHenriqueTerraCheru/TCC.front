import {
  iniciarMonitoramento,
  solicitarLocalizacao,
  useLocalizacaoStore,
} from './localizacao-store'

type Sucesso = (p: GeolocationPosition) => void
type Falha = (e: GeolocationPositionError) => void

const posicao = {
  coords: { latitude: -22.95, longitude: -43.18, accuracy: 15 },
} as GeolocationPosition
const negado = { code: 1, PERMISSION_DENIED: 1 } as GeolocationPositionError

function instalarNavegador(estadoPermissao: PermissionState | null) {
  const geolocation = {
    getCurrentPosition: vi.fn<(s: Sucesso, f: Falha) => void>(),
    watchPosition: vi.fn<(s: Sucesso, f: Falha) => number>(() => 1),
    clearWatch: vi.fn(),
  }
  const permissions = estadoPermissao && {
    query: vi.fn(() =>
      Promise.resolve({
        state: estadoPermissao,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    ),
  }
  vi.stubGlobal('isSecureContext', true)
  vi.stubGlobal('navigator', { ...navigator, geolocation, permissions })
  return geolocation
}

describe('localizacao-store', () => {
  let limpar: () => void = () => {}

  beforeEach(() => useLocalizacaoStore.setState({ estado: 'verificando', posicao: null }))
  afterEach(() => {
    limpar()
    vi.unstubAllGlobals()
  })

  it('fica indisponível fora de contexto seguro', () => {
    vi.stubGlobal('isSecureContext', false)
    limpar = iniciarMonitoramento()
    expect(useLocalizacaoStore.getState().estado).toBe('indisponivel')
  })

  it('com permissão já concedida, acompanha a posição sem pedir', async () => {
    const geo = instalarNavegador('granted')
    limpar = iniciarMonitoramento()

    await vi.waitFor(() => expect(useLocalizacaoStore.getState().estado).toBe('granted'))
    expect(geo.watchPosition).toHaveBeenCalledOnce()
    expect(geo.getCurrentPosition).not.toHaveBeenCalled()

    geo.watchPosition.mock.calls[0]![0](posicao)
    expect(useLocalizacaoStore.getState().posicao).toEqual({
      lat: -22.95,
      lng: -43.18,
      precisao: 15,
    })
  })

  it('em prompt, não acompanha até o usuário pedir', async () => {
    const geo = instalarNavegador('prompt')
    limpar = iniciarMonitoramento()

    await vi.waitFor(() => expect(useLocalizacaoStore.getState().estado).toBe('prompt'))
    expect(geo.watchPosition).not.toHaveBeenCalled()

    const pedido = solicitarLocalizacao()
    geo.getCurrentPosition.mock.calls[0]![0](posicao)

    await expect(pedido).resolves.toEqual({ lat: -22.95, lng: -43.18, precisao: 15 })
    expect(useLocalizacaoStore.getState().estado).toBe('granted')
    expect(geo.watchPosition).toHaveBeenCalledOnce()
  })

  it('guarda que a permissão foi concedida', async () => {
    instalarNavegador('granted')
    limpar = iniciarMonitoramento()

    await vi.waitFor(() => expect(useLocalizacaoStore.getState().estado).toBe('granted'))
    expect(localStorage.getItem('ocorrencias.localizacaoConcedida')).toBe('1')
  })

  it('em prompt, se já concedeu antes (iOS esquece), pede de novo sem esperar o Ativar', async () => {
    localStorage.setItem('ocorrencias.localizacaoConcedida', '1')
    const geo = instalarNavegador('prompt')
    limpar = iniciarMonitoramento()

    await vi.waitFor(() => expect(geo.getCurrentPosition).toHaveBeenCalledOnce())
    // Enquanto o navegador responde, o banner de "Localização desativada" não aparece.
    expect(useLocalizacaoStore.getState().estado).toBe('verificando')

    geo.getCurrentPosition.mock.calls[0]![0](posicao)
    expect(useLocalizacaoStore.getState()).toMatchObject({
      estado: 'granted',
      posicao: { lat: -22.95, lng: -43.18, precisao: 15 },
    })
    expect(geo.watchPosition).toHaveBeenCalledOnce()
  })

  it('se o pedido automático for negado, esquece a concessão e fica denied', async () => {
    localStorage.setItem('ocorrencias.localizacaoConcedida', '1')
    const geo = instalarNavegador('prompt')
    limpar = iniciarMonitoramento()

    await vi.waitFor(() => expect(geo.getCurrentPosition).toHaveBeenCalledOnce())
    geo.getCurrentPosition.mock.calls[0]![1](negado)

    expect(useLocalizacaoStore.getState()).toMatchObject({ estado: 'denied', posicao: null })
    expect(localStorage.getItem('ocorrencias.localizacaoConcedida')).toBeNull()
  })

  it('se o pedido automático falhar por outro motivo, volta a prompt', async () => {
    localStorage.setItem('ocorrencias.localizacaoConcedida', '1')
    const geo = instalarNavegador('prompt')
    limpar = iniciarMonitoramento()

    await vi.waitFor(() => expect(geo.getCurrentPosition).toHaveBeenCalledOnce())
    geo.getCurrentPosition.mock.calls[0]![1]({
      code: 3,
      PERMISSION_DENIED: 1,
    } as GeolocationPositionError)

    await vi.waitFor(() => expect(useLocalizacaoStore.getState().estado).toBe('prompt'))
  })

  it('pedido negado vira denied e resolve null', async () => {
    const geo = instalarNavegador(null)
    limpar = iniciarMonitoramento()
    expect(useLocalizacaoStore.getState().estado).toBe('prompt')

    const pedido = solicitarLocalizacao()
    geo.getCurrentPosition.mock.calls[0]![1](negado)

    await expect(pedido).resolves.toBeNull()
    expect(useLocalizacaoStore.getState()).toMatchObject({ estado: 'denied', posicao: null })
  })
})
