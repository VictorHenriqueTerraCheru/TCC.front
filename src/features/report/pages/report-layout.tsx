import { Navigate, Outlet, useLocation } from 'react-router'

import { useAuthenticated } from '@/features/auth'

export function ReportLayout() {
  const authenticated = useAuthenticated()
  const { pathname, search } = useLocation()
  if (!authenticated) return <Navigate to="/login" replace state={{ de: pathname + search }} />
  return (
    <div className="h-full bg-background">
      <Outlet />
    </div>
  )
}
