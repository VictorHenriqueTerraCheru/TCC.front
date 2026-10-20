import { Navigate, Outlet, useLocation } from 'react-router'

import { useAutenticado } from '@/features/auth'

/** /registrar/*: exige conta (regra 1). Visitante que chega pela URL vai ao login e volta (com a query, ex.: `?tipo=`). */
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
