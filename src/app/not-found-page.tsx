import { isRouteErrorResponse, Link, useRouteError } from 'react-router'

import { Button } from '@/common/ui/button'

export function NotFoundPage() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl">{notFound ? 'Página não encontrada' : 'Algo deu errado'}</h1>
      <Button asChild>
        <Link to="/map">Voltar ao mapa</Link>
      </Button>
    </div>
  )
}
