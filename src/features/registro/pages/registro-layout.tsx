import { Navigate, Outlet, useLocation } from 'react-router'

import { useAutenticado } from '@/features/auth'

export function RegistroLayout() {
  const autenticado = useAutenticado()
  const { pathname, search } = useLocation()
  if (!autenticado) return <Navigate to="/login" replace state={{ de: pathname + search }} />
  return (
    <div className="h-full bg-background">
      <Outlet />
    </div>
  )
}
