import { create } from 'zustand'

/**
 * Estado da permissão de localização do navegador.
 * - verificando: consultando a Permissions API na abertura;
 * - prompt: ainda não perguntado (ou o navegador não informa);
 * - granted / denied: resposta do usuário (o navegador não reabre o pedido depois de negado);
 * - indisponivel: sem Geolocation API ou fora de contexto seguro (HTTPS).
 */
export type EstadoLocalizacao = 'verificando' | 'prompt' | 'granted' | 'denied' | 'indisponivel'

export interface Posicao {
  lat: number
  lng: number
  /** Raio de incerteza em metros (coords.accuracy). */
  precisao: number
}

interface LocalizacaoState {
  estado: EstadoLocalizacao
  posicao: Posicao | null
}

// Nunca logue a posição (regra 11).
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

function aplicarEstado(estado: EstadoLocalizacao) {
  if (estado === 'granted') {
    useLocalizacaoStore.setState({ estado })
    acompanharPosicao()
  } else {
    pararDeAcompanhar()
    useLocalizacaoStore.setState({ estado, posicao: null })
  }
}

/**
 * Lê a permissão sem disparar o pedido do navegador e, se já liberada, acompanha a posição.
 * Chamado uma vez pelo layout do app; devolve a limpeza.
 */
export function iniciarMonitoramento(): () => void {
  if (!disponivel()) {
    aplicarEstado('indisponivel')
    return () => {}
  }

  let status: PermissionStatus | null = null
  let cancelado = false
  const aoMudar = () => status && aplicarEstado(status.state)

  if (navigator.permissions?.query) {
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((resultado) => {
        if (cancelado) return
        status = resultado
        status.addEventListener('change', aoMudar)
        aplicarEstado(status.state)
      })
      .catch(() => !cancelado && aplicarEstado('prompt'))
  } else {
    aplicarEstado('prompt')
  }

  return () => {
    cancelado = true
    status?.removeEventListener('change', aoMudar)
    pararDeAcompanhar()
  }
}

/** Dispara o pedido do navegador (só faz sentido em 'prompt'). Resolve com a posição ou null. */
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
