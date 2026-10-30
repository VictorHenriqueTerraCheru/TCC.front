import type { MaterialSymbol } from 'material-symbols'
import { useNavigate } from 'react-router'

import { ResponsiveSheet } from '@/common/components/responsive-sheet'
import { Icon } from '@/common/components/icon'
import { Button } from '@/common/ui/button'

import { useGuardStore, type AccountReason } from '../stores/guard-store'
import { ExpiredNotice } from './expired-notice'

interface Content {
  icon: MaterialSymbol
  title: string
  text: string
  items: [MaterialSymbol, string][]
}

const contents: Record<AccountReason, Content> = {
  vote: {
    icon: 'how_to_vote',
    title: 'Entre para votar',
    text: 'Seu voto ajuda a mostrar o que é confiável no mapa. Para evitar votos repetidos, cada voto fica ligado a uma conta.',
    items: [
      ['verified', 'Confirmar que um problema existe'],
      ['autorenew', 'Dizer se ele ainda está lá'],
      ['near_me', 'Ter mais peso quando estiver perto'],
    ],
  },
  report: {
    icon: 'person_add',
    title: 'Entre para registrar',
    text: 'Cada registro fica ligado a uma conta — é isso que permite medir a confiança do que aparece no mapa. Sem conta, você continua vendo o mapa normalmente.',
    items: [
      ['add_location_alt', 'Registrar problemas e incidentes'],
      ['how_to_vote', 'Confirmar e avaliar ocorrências perto de você'],
      ['history', 'Acompanhar o andamento dos seus registros'],
    ],
  },
}

export function LoginToContinue() {
  const reason = useGuardStore((s) => s.reason)
  const expired = useGuardStore((s) => s.expired)
  const closeSheet = useGuardStore((s) => s.closeSheet)
  const discard = useGuardStore((s) => s.discard)
  const navigate = useNavigate()
  const content = contents[reason ?? 'vote']

  function goTo(route: string) {
    closeSheet()
    navigate(route)
  }

  return (
    <ResponsiveSheet
      open={reason !== null}
      onOpenChange={(open) => !open && discard()}
      title={content.title}
      icon={
        <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Icon name={content.icon} className="text-[28px]" />
        </span>
      }
    >
      {expired && <ExpiredNotice />}
      <p className="mb-4 text-sm text-muted-foreground">{content.text}</p>
      <ul className="mb-6 space-y-3">
        {content.items.map(([icon, text]) => (
          <li key={text} className="flex items-center gap-3 text-sm">
            <Icon name={icon} className="text-[22px] text-brand" />
            {text}
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2">
        <Button onClick={() => goTo('/register')}>Criar conta</Button>
        <Button variant="outline" onClick={() => goTo('/login')}>
          Já tenho conta
        </Button>
        <Button variant="ghost" onClick={discard}>
          Agora não
        </Button>
      </div>
    </ResponsiveSheet>
  )
}
