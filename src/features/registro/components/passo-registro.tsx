import type { ReactNode } from 'react'

import { Icone } from '@/common/components/icone'
import { useDesktop } from '@/common/hooks/use-media-query'

import { MapaRegistro } from './mapa-registro'

interface PassoRegistroProps {
  titulo: string
  passo: { atual: number; total: number; rotulo: string }
  acaoTopo: 'fechar' | 'voltar'
  aoTopo(): void
  mapa?: ReactNode
  rodape: ReactNode
  children: ReactNode
}

function Cabecalho({
  titulo,
  passo,
  acaoTopo,
  aoTopo,
}: Omit<PassoRegistroProps, 'rodape' | 'children' | 'mapa'>) {
  return (
    <div className="shrink-0">
      <header className="flex h-16 items-center gap-2 px-1">
        <button
          type="button"
          onClick={aoTopo}
          aria-label={acaoTopo === 'fechar' ? 'Fechar registro' : 'Voltar'}
          className="flex size-12 pressionavel items-center justify-center rounded-full hover:bg-foreground/5 focus-visible:outline-2"
        >
          <Icone nome={acaoTopo === 'fechar' ? 'close' : 'arrow_back'} />
        </button>
        <h1 className="text-[22px] leading-7">{titulo}</h1>
      </header>
      <div className="px-4 pb-3">
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={passo.total}
          aria-valuenow={passo.atual}
          aria-label={`Passo ${passo.atual} de ${passo.total}`}
          className="h-1 overflow-hidden rounded-full bg-primario-suave"
        >
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${(passo.atual / passo.total) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          Passo {passo.atual} de {passo.total} · {passo.rotulo}
        </p>
      </div>
    </div>
  )
}

export function PassoRegistro({ mapa, rodape, children, ...cabecalho }: PassoRegistroProps) {
  const desktop = useDesktop()

  if (desktop) {
    return (
      <div className="grid h-full grid-cols-[420px_1fr]">
        <section className="flex min-h-0 flex-col bg-card shadow-3">
          <Cabecalho {...cabecalho} />
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{children}</div>
          <div className="p-4">{rodape}</div>
        </section>
        <div className="relative isolate">{mapa ?? <MapaRegistro modo="estatico" />}</div>
      </div>
    )
  }

  if (mapa) {
    return (
      <div className="flex h-full flex-col">
        <Cabecalho {...cabecalho} />
        <div className="relative isolate min-h-0 flex-1">{mapa}</div>
        <section className="relative z-10 -mt-6 shrink-0 rounded-t-[28px] bg-card px-4 pt-5 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-2px_12px_rgb(0_0_0/0.12)]">
          {children}
          <div className="mt-4">{rodape}</div>
        </section>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <Cabecalho {...cabecalho} />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{children}</div>
      <div className="shrink-0 px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">{rodape}</div>
    </div>
  )
}
