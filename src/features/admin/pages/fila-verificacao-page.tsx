import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'

import { ListaInfinita } from '@/common/components/lista-infinita'
import { TelaComVoltar } from '@/common/components/tela-com-voltar'
import { cn } from '@/common/lib/utils'
import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'
import { useAutenticado } from '@/features/auth'
import { useMe } from '@/features/usuarios'
import type { StatusVerificacao } from '@/features/verificacao'

import { useFila } from '../api/use-fila'
import { CartaoSolicitacao } from '../components/cartao-solicitacao'

const abas: { status: StatusVerificacao; rotulo: string }[] = [
  { status: 'pendente', rotulo: 'Pendentes' },
  { status: 'aprovada', rotulo: 'Aprovadas' },
  { status: 'recusada', rotulo: 'Recusadas' },
]

function Fila({ status }: { status: StatusVerificacao }) {
  const fila = useFila(status)
  if (fila.isPending) return <Skeleton className="h-40 rounded-2xl bg-muted" />
  if (fila.isError) {
    return (
      <div role="alert" className="space-y-3 py-6">
        <p>Não foi possível carregar a fila.</p>
        <Button variant="outline" size="sm" onClick={() => void fila.refetch()}>
          Tentar novamente
        </Button>
      </div>
    )
  }
  const itens = fila.data.pages.flatMap((p) => p.itens)
  if (itens.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Nenhum pedido aqui.</p>
  }
  return (
    <ListaInfinita consulta={fila}>
      <div className="space-y-3">
        {itens.map((s) => (
          <CartaoSolicitacao key={s.id} solicitacao={s} />
        ))}
      </div>
    </ListaInfinita>
  )
}

/** Contagem da aba "Pendentes · 4". */
function TotalPendentes() {
  const { data } = useFila('pendente')
  const total = data?.pages[0]?.total
  return total !== undefined ? <> · {total}</> : null
}

/** Tela 13: só para administrador (perfil atual de GET /me, regra 14). */
export function FilaVerificacaoPage() {
  const navigate = useNavigate()
  const autenticado = useAutenticado()
  const { data: me, isPending, isError, refetch } = useMe()
  const [aba, setAba] = useState<StatusVerificacao>('pendente')

  if (!autenticado) return <Navigate to="/login" replace state={{ de: '/admin/verificacoes' }} />

  return (
    <div className="mx-auto h-full w-full lg:max-w-3xl">
      <TelaComVoltar titulo="Fila de verificação" aoVoltar={() => navigate('/perfil')}>
        {isPending ? (
          <Skeleton className="h-60 rounded-2xl bg-muted" />
        ) : isError ? (
          // Falha de rede/servidor no /me não é falta de permissão: oferece tentar de novo.
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
          <>
            <div
              role="tablist"
              aria-label="Situação dos pedidos"
              className="mb-4 flex border-b border-border"
            >
              {abas.map(({ status, rotulo }) => (
                <button
                  key={status}
                  type="button"
                  role="tab"
                  id={`aba-${status}`}
                  aria-selected={aba === status}
                  aria-controls={`painel-${status}`}
                  onClick={() => setAba(status)}
                  className={cn(
                    '-mb-px flex-1 border-b-2 py-3 text-sm font-medium focus-visible:outline-2',
                    aba === status
                      ? 'border-primario text-primario'
                      : 'border-transparent text-muted-foreground',
                  )}
                >
                  {rotulo}
                  {status === 'pendente' && <TotalPendentes />}
                </button>
              ))}
            </div>
            <div role="tabpanel" id={`painel-${aba}`} aria-labelledby={`aba-${aba}`}>
              <Fila status={aba} />
            </div>
          </>
        )}
      </TelaComVoltar>
    </div>
  )
}
