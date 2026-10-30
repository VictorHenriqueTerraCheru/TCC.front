import type { MaterialSymbol } from 'material-symbols'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { Icon } from '@/common/components/icon'
import { Button } from '@/common/ui/button'

import { markPrePermissionSeen } from '../lib/pre-permission'
import { requestLocation } from '../stores/geolocation-store'

const items: [MaterialSymbol, string][] = [
  ['how_to_vote', 'Sem localização você continua votando, com peso base.'],
  ['settings', 'Você pode mudar isso a qualquer momento em Configurações.'],
]

export function LocationPermissionPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [requesting, setRequesting] = useState(false)
  const destination = (location.state as { de?: string } | null)?.de ?? '/map'

  async function proceed() {
    markPrePermissionSeen()
    setRequesting(true)
    await requestLocation()
    navigate(destination, { replace: true })
  }

  function notNow() {
    markPrePermissionSeen()
    navigate(destination, { replace: true })
  }

  return (
    <div className="flex min-h-full flex-col px-6 pt-20 pb-6 lg:pt-12">
      <span className="mb-8 flex size-[72px] items-center justify-center rounded-full bg-brand-soft text-brand">
        <Icon name="my_location" className="text-[36px]" />
      </span>
      <h1 className="mb-6 text-[28px] leading-9">Permitir acesso à sua localização?</h1>
      <p className="mb-6">
        Sua localização é usada para dar mais peso ao seu voto quando você está perto da ocorrência.
        Ela não é exibida para outras pessoas.
      </p>
      <ul className="space-y-4 text-sm">
        {items.map(([icon, text]) => (
          <li key={text} className="flex gap-4">
            <Icon name={icon} className="text-[22px] text-brand" />
            {text}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-col gap-2 pt-10">
        <Button onClick={() => void proceed()} disabled={requesting}>
          Continuar
        </Button>
        <Button variant="ghost" onClick={notNow} disabled={requesting}>
          Agora não
        </Button>
      </div>
    </div>
  )
}
