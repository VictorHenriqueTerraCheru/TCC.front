import { Outlet } from 'react-router'

import { useApplyTheme } from '@/common/hooks/use-theme'
import { useRedirectToThemeChoice } from '@/features/appearance'

import { LoginToContinue, useSyncCacheWithSession } from '@/features/auth'
import { useWatchLocation, useRedirectToPrePermission } from '@/features/location'

export function RootLayout() {
  useApplyTheme()
  useWatchLocation()
  const chosenTheme = useRedirectToThemeChoice()
  useRedirectToPrePermission(chosenTheme)
  useSyncCacheWithSession()
  return (
    <>
      <Outlet />
      <LoginToContinue />
    </>
  )
}
