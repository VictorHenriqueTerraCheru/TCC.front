import { useState, type ReactNode } from 'react'

import { Icone } from '@/common/components/icone'
import { useDesktop } from '@/common/hooks/use-media-query'
import { ContextoPainel } from '@/common/hooks/use-painel-responsivo'
import { cn } from '@/common/lib/utils'
import { Drawer, DrawerContent, DrawerTitle } from '@/common/ui/drawer'

interface PainelResponsivoProps {
  /** Nome acessível do painel (o título visível fica no conteúdo). */
  titulo: string
  aoFechar(): void
  /** Celular: abre só com os primeiros `alturaResumo` px (card rápido); arrastar expande. */
  alturaResumo?: number
  children: ReactNode
}

/**
 * Detalhe/área sobre o mapa (regra 8): folha inferior (vaul) no celular, painel lateral de 420 px
 * no desktop. Não modal: o mapa continua tocável. Montado pela rota; desmontar = fechar.
 * No desktop precisa estar dentro de um contêiner `relative` (a página do mapa).
 */
export function PainelResponsivo({
  titulo,
  aoFechar,
  alturaResumo,
  children,
}: PainelResponsivoProps) {
  const desktop = useDesktop()
  // O vaul calcula os estágios supondo a folha da altura da tela: ela tem h-dvh e o estágio
  // aberto para em 85 %, deixando o mapa à vista em cima.
  const snaps = alturaResumo ? [`${alturaResumo}px`, 0.85] : undefined
  const [snap, setSnap] = useState<number | string | null>(snaps?.[0] ?? null)

  if (desktop) {
    return (
      <aside
        aria-label={titulo}
        className="absolute inset-y-0 left-0 z-[1001] flex w-[420px] flex-col border-y-0 border-l-0 shadow-xl vidro"
      >
        <div className="flex-1 overflow-y-auto p-4 pt-5">{children}</div>
        <BotaoFechar aoFechar={aoFechar} className="absolute top-4 right-4" />
      </aside>
    )
  }

  const recolhido = !!snaps && snap === snaps[0]
  const expandir = () => {
    if (snaps) setSnap(snaps[1] ?? null)
  }

  return (
    <ContextoPainel.Provider value={{ recolhido, expandir }}>
      <Drawer
        open
        modal={false}
        onOpenChange={(aberto) => !aberto && aoFechar()}
        {...(snaps && { snapPoints: snaps, activeSnapPoint: snap, setActiveSnapPoint: setSnap })}
      >
        <DrawerContent
          semFundo
          aria-describedby={undefined}
          data-estagio={snaps ? (recolhido ? 'resumo' : 'aberto') : undefined}
          className={snaps ? 'mt-0! h-dvh max-h-none!' : undefined}
        >
          <DrawerTitle className="sr-only">{titulo}</DrawerTitle>
          <div
            // Teclado: foco num elemento abaixo da borda do resumo expande a folha (senão ele
            // ficaria escondido fora da tela).
            onFocusCapture={(evento) => {
              if (!snaps || snap !== snaps[0]) return
              if (evento.target.getBoundingClientRect().bottom > window.innerHeight) {
                setSnap(snaps[1] ?? null)
              }
            }}
            className={cn(
              'overflow-y-auto px-4 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]',
              // Os 15 % de baixo da folha ficam fora da tela no estágio aberto: a rolagem termina
              // na parte visível (senão o foco do teclado pode parar fora da tela). 1,25rem = alça.
              snaps && 'max-h-[calc(85dvh-1.25rem)]',
            )}
          >
            {children}
          </div>
          <BotaoFechar aoFechar={aoFechar} className="absolute top-5 right-4" />
        </DrawerContent>
      </Drawer>
    </ContextoPainel.Provider>
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
