import { useLocation, useNavigate } from 'react-router'

import { Icone } from '@/common/components/icone'
import { useTemaStore } from '@/common/hooks/use-tema'
import { Button } from '@/common/ui/button'

import { SeletorTema } from '../components/seletor-tema'

export function EscolherTemaPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const concluirEscolha = useTemaStore((s) => s.concluirEscolha)
  const destino = (location.state as { de?: string } | null)?.de ?? '/mapa'

  function continuar() {
    concluirEscolha()
    navigate(destino, { replace: true })
  }

  return (
    <div className="flex min-h-full flex-col px-6 pt-20 pb-6 lg:pt-12">
      <span className="mb-8 flex size-[72px] items-center justify-center rounded-full bg-primario-suave text-primario">
        <Icone nome="palette" className="text-[36px]" />
      </span>
      <h1 className="mb-3 text-[28px] leading-9">Escolha a aparência</h1>
      <p className="mb-8 text-muted-foreground">
        No automático, o app fica claro ou escuro junto com o seu celular. Dá para mudar quando
        quiser em Configurações.
      </p>
      <SeletorTema />
      <div className="mt-auto pt-10">
        <Button className="w-full" onClick={continuar}>
          Continuar
        </Button>
      </div>
    </div>
  )
}
