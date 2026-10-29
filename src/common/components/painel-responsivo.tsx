import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'

import { Icone } from '@/common/components/icone'
import { useDesktop } from '@/common/hooks/use-media-query'
import { ContextoPainel } from '@/common/hooks/use-painel-responsivo'
import { cn } from '@/common/lib/utils'
import { Drawer, DrawerContent, DrawerTitle } from '@/common/ui/drawer'

interface PainelResponsivoProps {
  titulo: string
  aoFechar(): void
  alturaResumo?: number
  children: ReactNode
}

export function PainelResponsivo({
  titulo,
  aoFechar,
  alturaResumo,
  children,
}: PainelResponsivoProps) {
  const desktop = useDesktop()
  const [alturaMedida, setAlturaMedida] = useState<number | null>(null)
  const altura = alturaResumo ? (alturaMedida ?? alturaResumo) : null
  const snaps = useMemo(() => (altura ? [`${altura}px`, 0.85] : undefined), [altura])
  const [aberto, setAberto] = useState(false)
  const snap = snaps ? snaps[aberto ? 1 : 0]! : null

  const observador = useRef<ResizeObserver | null>(null)
  const abertoRef = useRef(aberto)
  const mudarAberto = useCallback((valor: boolean) => {
    abertoRef.current = valor
    setAberto(valor)
  }, [])
  const medirResumo = useCallback((elemento: HTMLElement | null) => {
    observador.current?.disconnect()
    observador.current = null
    if (!elemento) return
    const medir = () => {
      if (abertoRef.current || elemento.offsetHeight === 0) return
      const rolagem = elemento.closest<HTMLElement>('[data-rolagem-painel]')
      const respiro = rolagem ? parseFloat(getComputedStyle(rolagem).paddingBottom) || 0 : 0
      setAlturaMedida(Math.ceil(elemento.offsetTop + elemento.offsetHeight + respiro))
    }
    medir()
    if (typeof ResizeObserver !== 'undefined') {
      observador.current = new ResizeObserver(medir)
      observador.current.observe(elemento)
    }
  }, [])

  if (desktop) {
    return (
      <aside
        aria-label={titulo}
        className="absolute inset-y-0 left-0 z-[1001] flex w-[420px] animate-in flex-col border-y-0 border-l-0 shadow-3 vidro duration-300 ease-[cubic-bezier(0.2,0.9,0.25,1)] fade-in-0 slide-in-from-left-6 motion-reduce:animate-none"
      >
        <div className="flex-1 overflow-y-auto p-4 pt-5">{children}</div>
        <BotaoFechar aoFechar={aoFechar} className="absolute top-4 right-4" />
      </aside>
    )
  }

  const recolhido = !!snaps && !aberto
  const expandir = () => mudarAberto(true)

  return (
    <ContextoPainel.Provider value={{ recolhido, expandir, medirResumo }}>
      <Drawer
        open
        modal={false}
        onOpenChange={(visivel) => !visivel && aoFechar()}
        {...(snaps && {
          snapPoints: snaps,
          activeSnapPoint: snap,
          setActiveSnapPoint: (ponto: number | string | null) => mudarAberto(ponto === snaps[1]),
        })}
      >
        <DrawerContent
          semFundo
          aria-describedby={undefined}
          data-estagio={snaps ? (recolhido ? 'resumo' : 'aberto') : undefined}
          className={snaps ? 'mt-0! h-dvh max-h-none!' : undefined}
        >
          <DrawerTitle className="sr-only">{titulo}</DrawerTitle>
          <div
            data-rolagem-painel
            onFocusCapture={(evento) => {
              if (!recolhido) return
              if (evento.target.getBoundingClientRect().bottom > window.innerHeight) expandir()
            }}
            className={cn(
              'overflow-y-auto overscroll-contain px-4 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]',
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
      className={`flex size-9 pressionavel items-center justify-center rounded-full bg-foreground/6 text-muted-foreground hover:bg-foreground/10 hover:text-foreground focus-visible:outline-2 ${className}`}
    >
      <Icone name="close" className="text-[20px]" />
    </button>
  )
}
