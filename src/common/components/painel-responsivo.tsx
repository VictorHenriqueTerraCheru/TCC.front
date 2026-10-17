import type { ReactNode } from 'react'

import { Icone } from '@/common/components/icone'
import { useDesktop } from '@/common/hooks/use-media-query'
import { Drawer, DrawerContent, DrawerTitle } from '@/common/ui/drawer'

interface PainelResponsivoProps {
  /** Nome acessível do painel (o título visível fica no conteúdo). */
  titulo: string
  aoFechar(): void
  children: ReactNode
}

/**
 * Detalhe/área sobre o mapa (regra 8): folha inferior (vaul) no celular, painel lateral de 420 px
 * no desktop. Não modal: o mapa continua tocável. Montado pela rota; desmontar = fechar.
 * No desktop precisa estar dentro de um contêiner `relative` (a página do mapa).
 */
export function PainelResponsivo({ titulo, aoFechar, children }: PainelResponsivoProps) {
  const desktop = useDesktop()

  if (desktop) {
    return (
      <aside
        aria-label={titulo}
        className="absolute inset-y-0 left-0 z-[1001] flex w-[420px] flex-col bg-surface-container shadow-xl"
      >
        <div className="flex-1 overflow-y-auto p-4 pt-5">{children}</div>
        <BotaoFechar aoFechar={aoFechar} className="absolute top-4 right-4" />
      </aside>
    )
  }

  return (
    <Drawer open modal={false} onOpenChange={(aberto) => !aberto && aoFechar()}>
      <DrawerContent semFundo aria-describedby={undefined}>
        <DrawerTitle className="sr-only">{titulo}</DrawerTitle>
        <div className="overflow-y-auto px-4 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
        <BotaoFechar aoFechar={aoFechar} className="absolute top-5 right-4" />
      </DrawerContent>
    </Drawer>
  )
}

function BotaoFechar({ aoFechar, className }: { aoFechar(): void; className: string }) {
  return (
    <button
      type="button"
      onClick={aoFechar}
      aria-label="Fechar"
      className={`flex size-10 items-center justify-center rounded-full hover:bg-foreground/5 focus-visible:outline-2 ${className}`}
    >
      <Icone nome="close" />
    </button>
  )
}
