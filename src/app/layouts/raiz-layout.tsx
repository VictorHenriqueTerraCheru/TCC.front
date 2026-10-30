import { Outlet } from 'react-router'

import { useApplyTheme } from '@/common/hooks/use-tema'
import { useRedirectToThemeChoice } from '@/features/aparencia'

import {
  LoginToContinue,
  useDiscardPendingActionOnLeavingLogin,
  useSyncCacheWithSession,
} from '@/features/auth'
import { useWatchLocation, useRedirectToPrePermission } from '@/features/localizacao'

export function RootLayout() {
  useApplyTheme()
  useWatchLocation()
  const chosenTheme = useRedirectToThemeChoice()
  useRedirectToPrePermission(chosenTheme)
  useSyncCacheWithSession()
  useDiscardPendingActionOnLeavingLogin()
  return (
    <>
      <Outlet />
      <LoginToContinue />
    </>
  )
}
