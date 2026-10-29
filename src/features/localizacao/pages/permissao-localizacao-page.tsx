import type { MaterialSymbol } from 'material-symbols'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { Icone } from '@/common/components/icone'
import { Button } from '@/common/ui/button'

import { marcarPrePermissaoVista } from '../lib/pre-permissao'
import { solicitarLocalizacao } from '../stores/localizacao-store'

const itens: [MaterialSymbol, string][] = [
  ['how_to_vote', 'Sem localização você continua votando, com peso base.'],
  ['settings', 'Você pode mudar isso a qualquer momento em Configurações.'],
]

export function PermissaoLocalizacaoPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [pedindo, setPedindo] = useState(false)
  const destino = (location.state as { de?: string } | null)?.de ?? '/mapa'

  async function continuar() {
    marcarPrePermissaoVista()
    setPedindo(true)
    await solicitarLocalizacao()
    navigate(destino, { replace: true })
  }

  function agoraNao() {
    marcarPrePermissaoVista()
    navigate(destino, { replace: true })
  }

  return (
    <div className="flex min-h-full flex-col px-6 pt-20 pb-6 lg:pt-12">
      <span className="mb-8 flex size-[72px] items-center justify-center rounded-full bg-primario-suave text-primario">
        <Icone nome="my_location" className="text-[36px]" />
      </span>
      <h1 className="mb-6 text-[28px] leading-9">Permitir acesso à sua localização?</h1>
      <p className="mb-6">
        Sua localização é usada para dar mais peso ao seu voto quando você está perto da ocorrência.
        Ela não é exibida para outras pessoas.
      </p>
      <ul className="space-y-4 text-sm">
        {itens.map(([icone, texto]) => (
          <li key={texto} className="flex gap-4">
            <Icone nome={icone} className="text-[22px] text-primario" />
            {texto}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-col gap-2 pt-10">
        <Button onClick={() => void continuar()} disabled={pedindo}>
          Continuar
        </Button>
        <Button variant="ghost" onClick={agoraNao} disabled={pedindo}>
          Agora não
        </Button>
      </div>
    </div>
  )
}
