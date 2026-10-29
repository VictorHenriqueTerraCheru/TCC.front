import { useState } from 'react'

import { AjudaLocalizacaoDialog } from '../components/ajuda-localizacao-dialog'
import { useLocalizacao } from './use-localizacao'

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
