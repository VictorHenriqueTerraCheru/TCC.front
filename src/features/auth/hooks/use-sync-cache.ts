import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { useSessionStore } from '../stores/session-store'

const ACCOUNT_QUERY_KEYS = [['me'], ['admin']]

export function useSyncCacheWithSession() {
  const queryClient = useQueryClient()
  useEffect(
    () =>
      useSessionStore.subscribe((current, previous) => {
        if (current.session?.token === previous.session?.token) return
        ACCOUNT_QUERY_KEYS.forEach((queryKey) => queryClient.removeQueries({ queryKey }))
        void queryClient.resetQueries({ queryKey: ['issues', 'detail'] })
        void queryClient.invalidateQueries()
      }),
    [queryClient],
  )
}
