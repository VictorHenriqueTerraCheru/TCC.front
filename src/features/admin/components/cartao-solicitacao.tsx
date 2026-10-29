import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'

import { CampoAreaTexto } from '@/common/components/campo-texto'
import { Button } from '@/common/ui/button'
import { Avatar } from '@/features/usuarios'
import { mensagemErroVerificacao, rotuloVinculo } from '@/features/verificacao'
import type { Schema } from '@/infrastructure/api'

import { useAnalisarVerificacao } from '../api/use-fila'

type Solicitacao = Schema<'ListVerificationsItem'>

export function CartaoSolicitacao({ solicitacao }: { solicitacao: Solicitacao }) {
  const analisar = useAnalisarVerificacao()
  const [recusando, setRecusando] = useState(false)
  const [motivo, setMotivo] = useState('')
  const {
    user: usuario,
    affiliationType: tipoVinculo,
    justification: justificativa,
    status,
    createdAt: criadaEm,
    rejectionReason: motivoRecusa,
  } = solicitacao

  return (
    <article
      aria-label={`Pedido de ${usuario.name}`}
      className="rounded-2xl border border-border/60 bg-card p-4 shadow-1"
    >
      <header className="mb-3 flex items-center gap-3">
        <Avatar name={usuario.name} />
        <div className="min-w-0">
          <h2 className="font-medium">{usuario.name}</h2>
          <p className="text-xs text-muted-foreground">
            {format(new Date(criadaEm), 'd MMM., HH:mm', { locale: ptBR })} ·{' '}
            {rotuloVinculo[tipoVinculo]}
          </p>
        </div>
      </header>
      <p className="text-sm">{justificativa}</p>
      {status === 'rejected' && motivoRecusa && (
        <p className="mt-2 text-sm text-destructive">Motivo da recusa: {motivoRecusa}</p>
      )}

      {analisar.error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {mensagemErroVerificacao(analisar.error)}
        </p>
      )}

      {status === 'pending' && !recusando && (
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            disabled={analisar.isPending}
            onClick={() => setRecusando(true)}
          >
            Recusar
          </Button>
          <Button
            disabled={analisar.isPending}
            onClick={() => analisar.mutate({ id: solicitacao.id, decisao: 'aprovar' })}
          >
            Aprovar
          </Button>
        </div>
      )}

      {status === 'pending' && recusando && (
        <div className="mt-4">
          <CampoAreaTexto
            label="Motivo da recusa *"
            placeholder="Explique por que o pedido foi recusado"
            ajuda="Obrigatório. A pessoa verá este motivo."
            rows={3}
            maximo={500}
            valorAtual={motivo}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            autoFocus
          />
          <div className="mt-3 flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setRecusando(false)
                setMotivo('')
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="tonal"
              disabled={!motivo.trim() || analisar.isPending}
              onClick={() =>
                analisar.mutate({ id: solicitacao.id, decisao: 'recusar', reason: motivo.trim() })
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
