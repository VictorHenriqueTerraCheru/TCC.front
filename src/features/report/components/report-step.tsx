import type { ReactNode } from 'react'

import { Icon } from '@/common/components/icon'
import { useDesktop } from '@/common/hooks/use-media-query'

import { ReportMap } from './report-map'

interface ReportStepProps {
  title: string
  step: { current: number; total: number; label: string }
  topAction: 'close' | 'back'
  onTopAction(): void
  map?: ReactNode
  footer: ReactNode
  children: ReactNode
}

function Header({
  title,
  step,
  topAction,
  onTopAction,
}: Omit<ReportStepProps, 'footer' | 'children' | 'map'>) {
  return (
    <div className="shrink-0">
      <header className="flex h-16 items-center gap-2 px-1">
        <button
          type="button"
          onClick={onTopAction}
          aria-label={topAction === 'close' ? 'Fechar registro' : 'Voltar'}
          className="flex size-12 pressionavel items-center justify-center rounded-full hover:bg-foreground/5 focus-visible:outline-2"
        >
          <Icon name={topAction === 'close' ? 'close' : 'arrow_back'} />
        </button>
        <h1 className="text-[22px] leading-7">{title}</h1>
      </header>
      <div className="px-4 pb-3">
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={step.total}
          aria-valuenow={step.current}
          aria-label={`Passo ${step.current} de ${step.total}`}
          className="h-1 overflow-hidden rounded-full bg-primario-suave"
        >
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${(step.current / step.total) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          Passo {step.current} de {step.total} · {step.label}
        </p>
      </div>
    </div>
  )
}

export function ReportStep({ map, footer, children, ...header }: ReportStepProps) {
  const desktop = useDesktop()

  if (desktop) {
    return (
      <div className="grid h-full grid-cols-[420px_1fr]">
        <section className="flex min-h-0 flex-col bg-card shadow-3">
          <Header {...header} />
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{children}</div>
          <div className="p-4">{footer}</div>
        </section>
        <div className="relative isolate">{map ?? <ReportMap mode="static" />}</div>
      </div>
    )
  }

  if (map) {
    return (
      <div className="flex h-full flex-col">
        <Header {...header} />
        <div className="relative isolate min-h-0 flex-1">{map}</div>
        <section className="relative z-10 -mt-6 shrink-0 rounded-t-[28px] bg-card px-4 pt-5 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-2px_12px_rgb(0_0_0/0.12)]">
          {children}
          <div className="mt-4">{footer}</div>
        </section>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <Header {...header} />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{children}</div>
      <div className="shrink-0 px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>
    </div>
  )
}
