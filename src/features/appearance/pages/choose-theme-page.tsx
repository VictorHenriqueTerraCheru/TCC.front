import { useLocation, useNavigate } from 'react-router'

import { Icon } from '@/common/components/icon'
import { useThemeStore } from '@/common/hooks/use-theme'
import { Button } from '@/common/ui/button'

import { ThemePicker } from '../components/theme-picker'

export function ChooseThemePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const completeChoice = useThemeStore((s) => s.completeChoice)
  const destination = (location.state as { de?: string } | null)?.de ?? '/map'

  function proceed() {
    completeChoice()
    navigate(destination, { replace: true })
  }

  return (
    <div className="flex min-h-full flex-col px-6 pt-20 pb-6 lg:pt-12">
      <span className="mb-8 flex size-[72px] items-center justify-center rounded-full bg-brand-soft text-brand">
        <Icon name="palette" className="text-[36px]" />
      </span>
      <h1 className="mb-3 text-[28px] leading-9">Escolha a aparência</h1>
      <p className="mb-8 text-muted-foreground">
        No automático, o app fica claro ou escuro junto com o seu celular. Dá para mudar quando
        quiser em Configurações.
      </p>
      <ThemePicker />
      <div className="mt-auto pt-10">
        <Button className="w-full" onClick={proceed}>
          Continuar
        </Button>
      </div>
    </div>
  )
}
