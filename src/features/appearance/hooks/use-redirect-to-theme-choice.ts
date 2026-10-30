import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { useThemeStore } from '@/common/hooks/use-theme'

export function useRedirectToThemeChoice(): boolean {
  const chosen = useThemeStore((s) => s.chosen)
  const navigate = useNavigate()
  const { pathname, search } = useLocation()

  useEffect(() => {
    if (chosen || !pathname.startsWith('/map')) return
    navigate('/appearance', { replace: true, state: { de: `${pathname}${search}` } })
  }, [chosen, pathname, search, navigate])

  return chosen
}
