import { useLocation, useNavigate } from 'react-router'

import { useGuardaStore } from '../stores/guarda-store'

/**
 * Depois do login/cadastro: volta para onde o visitante estava (a ação pendente é executada
 * pela tela de destino) ou para a rota que mandou ao login.
 */
export function useAposEntrar() {
  const navigate = useNavigate()
  const location = useLocation()
  return () => {
    const retorno = useGuardaStore.getState().concluirLogin()
    const de = (location.state as { de?: string } | null)?.de
    navigate(retorno ?? de ?? '/mapa', { replace: true })
  }
}
