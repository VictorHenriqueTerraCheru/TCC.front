import type { ReactNode } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'

import { ScreenWithBack } from '@/common/components/screen-with-back'
import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'
import { useAuthenticated } from '@/features/auth'
import { useMe } from '@/features/users'

interface AdminGuardProps {
  title: string
  path: string
  children: ReactNode
}

export function AdminGuard({ title, path, children }: AdminGuardProps) {
  const navigate = useNavigate()
  const authenticated = useAuthenticated()
  const { data: me, isPending, isError, refetch } = useMe()

  if (!authenticated) return <Navigate to="/login" replace state={{ de: path }} />

  return (
    <div className="mx-auto h-full w-full lg:max-w-3xl">
      <ScreenWithBack title={title} onBack={() => navigate('/profile')}>
        {isPending ? (
          <Skeleton className="h-60 rounded-2xl bg-muted" />
        ) : isError ? (
          <div role="alert" className="space-y-3 py-10 text-center">
            <p>Não foi possível confirmar seu perfil.</p>
            <Button variant="outline" onClick={() => void refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : me.role !== 'administrator' ? (
          <div className="space-y-3 py-10 text-center">
            <p>Esta área é só para administradores.</p>
            <Button asChild variant="outline">
              <Link to="/profile">Voltar ao perfil</Link>
            </Button>
          </div>
        ) : (
          children
        )}
      </ScreenWithBack>
    </div>
  )
}
