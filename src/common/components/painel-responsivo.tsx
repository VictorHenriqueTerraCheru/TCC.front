import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'

import { Icone } from '@/common/components/icone'
import { useDesktop } from '@/common/hooks/use-media-query'
import { ContextoPainel } from '@/common/hooks/use-painel-responsivo'
import { cn } from '@/common/lib/utils'
import { Drawer, DrawerContent, DrawerTitle } from '@/common/ui/drawer'

interface PainelResponsivoProps {
  /** Nome acessível do painel (o título visível fica no conteúdo). */
  titulo: string
  aoFechar(): void
  /**
   * Celular: abre só com os primeiros `alturaResumo` px (card rápido); arrastar expande. Se o
   * conteúdo registrar o resumo (`medirResumo`), a altura medida substitui este valor.
   */
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
  const [alturaMedida, setAlturaMedida] = useState<number | null>(null)
  const altura = alturaResumo ? (alturaMedida ?? alturaResumo) : null
  // O vaul calcula os estágios supondo a folha da altura da tela: ela tem h-dvh e o estágio
  // aberto para em 85 %, deixando o mapa à vista em cima.
  const snaps = useMemo(() => (altura ? [`${altura}px`, 0.85] : undefined), [altura])
  // O estágio fica por posição: quando a medida muda o px do resumo, a folha continua nele.
  const [aberto, setAberto] = useState(false)
  const snap = snaps ? snaps[aberto ? 1 : 0]! : null

  const observador = useRef<ResizeObserver | null>(null)
  const medirResumo = useCallback((elemento: HTMLElement | null) => {
    observador.current?.disconnect()
    observador.current = null
    if (!elemento) return
    const medir = () => {
      if (elemento.offsetHeight === 0) return
      // O resumo termina onde a folha para, mais o respiro de baixo da rolagem, que já é
      // max(1,5 rem, área segura): o texto não encosta na barra de gestos do iPhone/Android.
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
        className="absolute inset-y-0 left-0 z-[1001] flex w-[420px] flex-col border-y-0 border-l-0 shadow-xl vidro"
      >
        <div className="flex-1 overflow-y-auto p-4 pt-5">{children}</div>
        <BotaoFechar aoFechar={aoFechar} className="absolute top-4 right-4" />
      </aside>
    )
  }

  const recolhido = !!snaps && !aberto
  const expandir = () => setAberto(true)

  return (
    <ContextoPainel.Provider value={{ recolhido, expandir, medirResumo }}>
      <Drawer
        open
        modal={false}
        onOpenChange={(visivel) => !visivel && aoFechar()}
        {...(snaps && {
          snapPoints: snaps,
          activeSnapPoint: snap,
          setActiveSnapPoint: (ponto: number | string | null) => setAberto(ponto === snaps[1]),
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
            // Teclado: foco num elemento abaixo da borda do resumo expande a folha (senão ele
            // ficaria escondido fora da tela).
            onFocusCapture={(evento) => {
              if (!recolhido) return
              if (evento.target.getBoundingClientRect().bottom > window.innerHeight) expandir()
            }}
            className={cn(
              // overscroll-contain: chegar ao fim da rolagem da folha não passa o gesto ao mapa.
              'overflow-y-auto overscroll-contain px-4 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]',
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
