import { useEffect } from 'react'

import {
  iniciarMonitoramento,
  solicitarLocalizacao,
  useLocalizacaoStore,
} from '../stores/localizacao-store'

export function useLocalizacao() {
  const estado = useLocalizacaoStore((s) => s.estado)
  const posicao = useLocalizacaoStore((s) => s.posicao)
  return { estado, posicao, solicitar: solicitarLocalizacao }
}

export function useMonitorarLocalizacao() {
  useEffect(() => iniciarMonitoramento(), [])
}
