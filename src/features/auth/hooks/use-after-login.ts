import { useLocation, useNavigate } from 'react-router'

import { useGuardStore } from '../stores/guard-store'

export function useAfterLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  return () => {
    const returnTo = useGuardStore.getState().completeLogin()
    const de = (location.state as { de?: string } | null)?.de
    navigate(returnTo ?? de ?? '/mapa', { replace: true })
  }
}
