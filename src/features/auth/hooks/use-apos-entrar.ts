import { useLocation, useNavigate } from 'react-router'

import { useGuardaStore } from '../stores/guarda-store'

export function useAposEntrar() {
  const navigate = useNavigate()
  const location = useLocation()
  return () => {
    const retorno = useGuardaStore.getState().concluirLogin()
    const de = (location.state as { de?: string } | null)?.de
    navigate(retorno ?? de ?? '/mapa', { replace: true })
  }
}
