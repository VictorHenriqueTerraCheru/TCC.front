import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'

import { TextAreaField } from '@/common/components/campo-texto'
import { Button } from '@/common/ui/button'
import { Avatar } from '@/features/usuarios'
import { verificationErrorMessage, affiliationLabel } from '@/features/verificacao'
import type { Schema } from '@/infrastructure/api'

import { useReviewVerification } from '../api/use-fila'

type VerificationRequest = Schema<'ListVerificationsItem'>

export function RequestCard({ request }: { request: VerificationRequest }) {
  const review = useReviewVerification()
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const { user, affiliationType, justification, status, createdAt, rejectionReason } = request

  return (
    <article
      aria-label={`Pedido de ${user.name}`}
      className="rounded-2xl border border-border/60 bg-card p-4 shadow-1"
    >
      <header className="mb-3 flex items-center gap-3">
        <Avatar name={user.name} />
        <div className="min-w-0">
          <h2 className="font-medium">{user.name}</h2>
          <p className="text-xs text-muted-foreground">
            {format(new Date(createdAt), 'd MMM., HH:mm', { locale: ptBR })} ·{' '}
            {affiliationLabel[affiliationType]}
          </p>
        </div>
      </header>
      <p className="text-sm">{justification}</p>
      {status === 'rejected' && rejectionReason && (
        <p className="mt-2 text-sm text-destructive">Motivo da recusa: {rejectionReason}</p>
      )}

      {review.error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {verificationErrorMessage(review.error)}
        </p>
      )}

      {status === 'pending' && !rejecting && (
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" disabled={review.isPending} onClick={() => setRejecting(true)}>
            Recusar
          </Button>
          <Button
            disabled={review.isPending}
            onClick={() => review.mutate({ id: request.id, decision: 'approve' })}
          >
            Aprovar
          </Button>
        </div>
      )}

      {status === 'pending' && rejecting && (
        <div className="mt-4">
          <TextAreaField
            label="Motivo da recusa *"
            placeholder="Explique por que o pedido foi recusado"
            help="Obrigatório. A pessoa verá este motivo."
            rows={3}
            maximum={500}
            currentValue={reason}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            autoFocus
          />
          <div className="mt-3 flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setRejecting(false)
                setReason('')
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="tonal"
              disabled={!reason.trim() || review.isPending}
              onClick={() =>
                review.mutate({ id: request.id, decision: 'reject', reason: reason.trim() })
              }
            >
              Confirmar recusa
            </Button>
          </div>
        </div>
      )}
    </article>
  )
}
