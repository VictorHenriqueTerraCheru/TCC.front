import { Navigate, Outlet, useLocation } from 'react-router'

import { useAutenticado } from '@/features/auth'

/** /registrar/*: exige conta (regra 1). Visitante que chega pela URL vai ao login e volta. */
export function RegistroLayout() {
  const autenticado = useAutenticado()
  const { pathname } = useLocation()
  if (!autenticado) return <Navigate to="/login" replace state={{ de: pathname }} />
  return (
    <div className="h-full bg-background">
      <Outlet />
    </div>
  )
}
