import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'

import { useGuardStore } from '../stores/guard-store'
import { useSessionStore } from '../stores/session-store'

const LOGIN_SCREENS = new Set(['/login', '/cadastro'])

export function useDiscardPendingActionOnLeavingLogin() {
  const { pathname } = useLocation()
  const previousRef = useRef(pathname)

  useEffect(() => {
    const leftLogin = LOGIN_SCREENS.has(previousRef.current) && !LOGIN_SCREENS.has(pathname)
    previousRef.current = pathname
    if (leftLogin && !useSessionStore.getState().session) useGuardStore.getState().discard()
  }, [pathname])
}
