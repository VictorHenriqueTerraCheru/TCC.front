import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { prePermissionSeen } from '../lib/pre-permission'
import { useGeolocationStore } from '../stores/geolocation-store'

export function useRedirectToPrePermission(active = true) {
  const state = useGeolocationStore((s) => s.state)
  const navigate = useNavigate()
  const { pathname, search } = useLocation()

  useEffect(() => {
    if (!active || state !== 'prompt' || !pathname.startsWith('/map') || prePermissionSeen()) return
    navigate('/location-permission', { replace: true, state: { de: `${pathname}${search}` } })
  }, [active, state, pathname, search, navigate])
}
