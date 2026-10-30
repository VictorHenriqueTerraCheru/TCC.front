import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Link } from 'react-router'

import { Icon } from '@/common/components/icon'
import { Button } from '@/common/ui/button'
import type { Me } from '@/features/users'

import { affiliationLabel } from '../models/verification'

const data = (iso: string) => format(new Date(iso), 'd MMM. yyyy', { locale: ptBR })

export function VerificationCard({ me }: { me: Me }) {
  if (me.role === 'verifiedCitizen') {
    return (
      <section className="rounded-2xl bg-brand-soft p-4 text-brand">
        <h2 className="mb-1 flex items-center gap-2 font-medium">
          <Icon name="how_to_reg" className="text-[22px]" />
          Seu voto tem peso maior
        </h2>
        <p className="text-sm">
          Suas confirmações e respostas de “Ainda está lá?” contam mais no cálculo de confiança das
          ocorrências — ainda mais perto de onde você mora.
        </p>
        <p className="mt-3 border-t border-brand/15 pt-3 text-xs">
          {me.verifiedAt ? `Verificado em ${data(me.verifiedAt)}` : 'Perfil verificado'}
          {me.verification && ` · ${affiliationLabel[me.verification.affiliationType]}`}
        </p>
      </section>
    )
  }

  if (me.role !== 'citizen') return null

  if (me.verification?.status === 'pending') {
    return (
      <section className="rounded-[20px] border border-border bg-card p-4 shadow-1">
        <h2 className="mb-1 flex items-center gap-2 font-medium">
          <Icon name="hourglass_top" className="text-[22px] text-new-badge" />
          Pedido em análise
        </h2>
        <p className="text-sm text-muted-foreground">
          Enviado em {data(me.verification.createdAt)}. A equipe de moderação vai analisar seu
          vínculo com a região.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-[20px] border border-border bg-card p-4 shadow-1">
      <h2 className="mb-1 flex items-center gap-2 font-medium">
        <Icon name="verified_user" className="text-[22px] text-brand" />
        Verifique seu perfil
      </h2>
      <p className="mb-3 text-sm text-muted-foreground">
        Perfis verificados têm voto com peso maior no cálculo de confiança.
      </p>
      <Button asChild>
        <Link to="/profile/verification">Solicitar verificação</Link>
      </Button>
    </section>
  )
}
