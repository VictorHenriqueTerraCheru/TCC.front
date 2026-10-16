import { useEffect } from 'react'

import {
  iniciarMonitoramento,
  solicitarLocalizacao,
  useLocalizacaoStore,
} from '../stores/localizacao-store'

/** Estado da permissão + última posição conhecida. */
export function useLocalizacao() {
  const estado = useLocalizacaoStore((s) => s.estado)
  const posicao = useLocalizacaoStore((s) => s.posicao)
  return { estado, posicao, solicitar: solicitarLocalizacao }
}

/** Liga a leitura da permissão/posição enquanto o app estiver montado (usado no layout). */
export function useMonitorarLocalizacao() {
  useEffect(() => iniciarMonitoramento(), [])
}
