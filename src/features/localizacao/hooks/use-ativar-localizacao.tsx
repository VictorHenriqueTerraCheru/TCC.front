import { useState } from 'react'

import { AjudaLocalizacaoDialog } from '../components/ajuda-localizacao-dialog'
import { useLocalizacao } from './use-localizacao'

/**
 * "Ativar" das telas 18/19: em `prompt` dispara o pedido do navegador; negada ou indisponível,
 * abre a ajuda (o navegador não reabre o pedido). Renderize `dialogo` junto do botão.
 */
export function useAtivarLocalizacao() {
  const { estado, solicitar } = useLocalizacao()
  const [ajudaAberta, setAjudaAberta] = useState(false)

  async function ativar() {
    if (estado === 'denied' || estado === 'indisponivel') {
      setAjudaAberta(true)
      return null
    }
    return solicitar()
  }

  const dialogo = (
    <AjudaLocalizacaoDialog aberto={ajudaAberta} aoMudarAberto={setAjudaAberta} estado={estado} />
  )

  return { ativar, dialogo }
}
