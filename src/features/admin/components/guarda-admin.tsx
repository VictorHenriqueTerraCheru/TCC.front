import type { ReactNode } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'

import { TelaComVoltar } from '@/common/components/tela-com-voltar'
import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'
import { useAutenticado } from '@/features/auth'
import { useMe } from '@/features/usuarios'

interface GuardaAdminProps {
  titulo: string
  caminho: string
  children: ReactNode
}

export function GuardaAdmin({ titulo, caminho, children }: GuardaAdminProps) {
  const navigate = useNavigate()
  const autenticado = useAutenticado()
  const { data: me, isPending, isError, refetch } = useMe()

  if (!autenticado) return <Navigate to="/login" replace state={{ de: caminho }} />

  return (
    <div className="mx-auto h-full w-full lg:max-w-3xl">
      <TelaComVoltar titulo={titulo} aoVoltar={() => navigate('/perfil')}>
        {isPending ? (
          <Skeleton className="h-60 rounded-2xl bg-muted" />
        ) : isError ? (
          <div role="alert" className="space-y-3 py-10 text-center">
            <p>Não foi possível confirmar seu perfil.</p>
            <Button variant="outline" onClick={() => void refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : me.perfil !== 'administrador' ? (
          <div className="space-y-3 py-10 text-center">
            <p>Esta área é só para administradores.</p>
            <Button asChild variant="outline">
              <Link to="/perfil">Voltar ao perfil</Link>
            </Button>
          </div>
        ) : (
          children
        )}
      </TelaComVoltar>
    </div>
  )
}
