import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { useTemaStore } from '@/common/hooks/use-tema'

export function useRedirecionarEscolhaTema(): boolean {
  const escolhido = useTemaStore((s) => s.escolhido)
  const navigate = useNavigate()
  const { pathname, search } = useLocation()

  useEffect(() => {
    if (escolhido || !pathname.startsWith('/mapa')) return
    navigate('/aparencia', { replace: true, state: { de: `${pathname}${search}` } })
  }, [escolhido, pathname, search, navigate])

  return escolhido
}
