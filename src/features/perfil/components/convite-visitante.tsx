import { Link } from 'react-router'

import { Icone } from '@/common/components/icone'
import { Button } from '@/common/ui/button'

/** Perfil para visitante: o mesmo convite das folhas "Entre para…". */
export function ConviteVisitante() {
  return (
    <section className="rounded-2xl bg-surface-container p-6">
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-mint text-mint-foreground">
        <Icone nome="person_add" className="text-[28px]" />
      </span>
      <h2 className="mb-2 text-2xl">Entre para acompanhar sua participação</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Com uma conta você registra ocorrências, vota no que está no mapa e acompanha seu histórico.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild>
          <Link to="/cadastro" state={{ de: '/perfil' }}>
            Criar conta
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/login" state={{ de: '/perfil' }}>
            Já tenho conta
          </Link>
        </Button>
      </div>
    </section>
  )
}
