import { create } from 'zustand'

export type EstadoLocalizacao = 'verificando' | 'prompt' | 'granted' | 'denied' | 'indisponivel'

export interface Posicao {
  lat: number
  lng: number
  precisao: number
}

interface LocalizacaoState {
  estado: EstadoLocalizacao
  posicao: Posicao | null
}

export const useLocalizacaoStore = create<LocalizacaoState>()(() => ({
  estado: 'verificando',
  posicao: null,
}))

const OPCOES: PositionOptions = { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 }

let idMonitoramento: number | null = null

function paraPosicao({ coords }: GeolocationPosition): Posicao {
  return { lat: coords.latitude, lng: coords.longitude, precisao: coords.accuracy }
}

function disponivel(): boolean {
  return globalThis.isSecureContext === true && 'geolocation' in navigator
}

function acompanharPosicao() {
  if (idMonitoramento !== null) return
  idMonitoramento = navigator.geolocation.watchPosition(
    (posicao) => useLocalizacaoStore.setState({ estado: 'granted', posicao: paraPosicao(posicao) }),
    (erro) => {
      if (erro.code === erro.PERMISSION_DENIED) aplicarEstado('denied')
    },
    OPCOES,
  )
}

function pararDeAcompanhar() {
  if (idMonitoramento === null) return
  navigator.geolocation.clearWatch(idMonitoramento)
  idMonitoramento = null
}

const CHAVE_CONCEDIDA = 'ocorrencias.localizacaoConcedida'

function concedeuAntes(): boolean {
  try {
    return localStorage.getItem(CHAVE_CONCEDIDA) === '1'
  } catch {
    return false
  }
}

function lembrarConcessao(concedida: boolean) {
  try {
    if (concedida) localStorage.setItem(CHAVE_CONCEDIDA, '1')
    else localStorage.removeItem(CHAVE_CONCEDIDA)
  } catch {
    void 0
  }
}

function aplicarEstado(estado: EstadoLocalizacao) {
  if (estado === 'granted') {
    lembrarConcessao(true)
    useLocalizacaoStore.setState({ estado })
    acompanharPosicao()
  } else {
    if (estado === 'denied') lembrarConcessao(false)
    pararDeAcompanhar()
    useLocalizacaoStore.setState({ estado, posicao: null })
  }
}

export function iniciarMonitoramento(): () => void {
  if (!disponivel()) {
    aplicarEstado('indisponivel')
    return () => {}
  }

  let status: PermissionStatus | null = null
  let cancelado = false
  const aplicarPermissao = (estado: PermissionState) => {
    if (estado !== 'prompt' || !concedeuAntes()) return aplicarEstado(estado)
    pararDeAcompanhar()
    useLocalizacaoStore.setState({ estado: 'verificando' })
    void solicitarLocalizacao().then((posicao) => {
      if (!posicao && !cancelado && useLocalizacaoStore.getState().estado === 'verificando')
        aplicarEstado('prompt')
    })
  }
  const aoMudar = () => status && aplicarPermissao(status.state)

  if (navigator.permissions?.query) {
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((resultado) => {
        if (cancelado) return
        status = resultado
        status.addEventListener('change', aoMudar)
        aplicarPermissao(status.state)
      })
      .catch(() => !cancelado && aplicarPermissao('prompt'))
  } else {
    aplicarPermissao('prompt')
  }

  return () => {
    cancelado = true
    status?.removeEventListener('change', aoMudar)
    pararDeAcompanhar()
  }
}

export function solicitarLocalizacao(): Promise<Posicao | null> {
  if (!disponivel()) return Promise.resolve(null)
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (resultado) => {
        const posicao = paraPosicao(resultado)
        useLocalizacaoStore.setState({ posicao })
        aplicarEstado('granted')
        resolve(posicao)
      },
      (erro) => {
        if (erro.code === erro.PERMISSION_DENIED) aplicarEstado('denied')
        resolve(null)
      },
      OPCOES,
    )
  })
}
