import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'

import { Icon } from '@/common/components/icon'
import { useDesktop } from '@/common/hooks/use-media-query'
import { PanelContext } from '@/common/hooks/use-responsive-panel'
import { cn } from '@/common/lib/utils'
import { Drawer, DrawerContent, DrawerTitle } from '@/common/ui/drawer'

interface ResponsivePanelProps {
  title: string
  onClose(): void
  summaryHeight?: number
  children: ReactNode
}

export function ResponsivePanel({ title, onClose, summaryHeight, children }: ResponsivePanelProps) {
  const desktop = useDesktop()
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null)
  const height = summaryHeight ? (measuredHeight ?? summaryHeight) : null
  const snaps = useMemo(() => (height ? [`${height}px`, 0.85] : undefined), [height])
  const [open, setOpen] = useState(false)
  const snap = snaps ? snaps[open ? 1 : 0]! : null

  const observer = useRef<ResizeObserver | null>(null)
  const openRef = useRef(open)
  const handleOpenChange = useCallback((value: boolean) => {
    openRef.current = value
    setOpen(value)
  }, [])
  const measureSummary = useCallback((element: HTMLElement | null) => {
    observer.current?.disconnect()
    observer.current = null
    if (!element) return
    const measure = () => {
      if (openRef.current || element.offsetHeight === 0) return
      const scroll = element.closest<HTMLElement>('[data-panel-scroll]')
      const margin = scroll ? parseFloat(getComputedStyle(scroll).paddingBottom) || 0 : 0
      setMeasuredHeight(Math.ceil(element.offsetTop + element.offsetHeight + margin))
    }
    measure()
    if (typeof ResizeObserver !== 'undefined') {
      observer.current = new ResizeObserver(measure)
      observer.current.observe(element)
    }
  }, [])

  if (desktop) {
    return (
      <aside
        aria-label={title}
        className="absolute inset-y-0 left-0 z-[1001] flex w-[420px] animate-in flex-col border-y-0 border-l-0 shadow-3 glass duration-300 ease-[cubic-bezier(0.2,0.9,0.25,1)] fade-in-0 slide-in-from-left-6 motion-reduce:animate-none"
      >
        <div className="flex-1 overflow-y-auto p-4 pt-5">{children}</div>
        <CloseButton onClose={onClose} className="absolute top-4 right-4" />
      </aside>
    )
  }

  const collapsed = !!snaps && !open
  const expand = () => handleOpenChange(true)

  return (
    <PanelContext.Provider value={{ collapsed, expand, measureSummary }}>
      <Drawer
        open
        modal={false}
        onOpenChange={(visible) => !visible && onClose()}
        {...(snaps && {
          snapPoints: snaps,
          activeSnapPoint: snap,
          setActiveSnapPoint: (point: number | string | null) =>
            handleOpenChange(point === snaps[1]),
        })}
      >
        <DrawerContent
          transparent
          aria-describedby={undefined}
          data-stage={snaps ? (collapsed ? 'summary' : 'open') : undefined}
          className={snaps ? 'mt-0! h-dvh max-h-none!' : undefined}
        >
          <DrawerTitle className="sr-only">{title}</DrawerTitle>
          <div
            data-panel-scroll
            onFocusCapture={(event) => {
              if (!collapsed) return
              if (event.target.getBoundingClientRect().bottom > window.innerHeight) expand()
            }}
            className={cn(
              'overflow-y-auto overscroll-contain px-4 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]',
              snaps && 'max-h-[calc(85dvh-1.25rem)]',
            )}
          >
            {children}
          </div>
          <CloseButton onClose={onClose} className="absolute top-5 right-4" />
        </DrawerContent>
      </Drawer>
    </PanelContext.Provider>
  )
}

function CloseButton({ onClose, className }: { onClose(): void; className: string }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Fechar"
      className={`flex size-9 pressable items-center justify-center rounded-full bg-foreground/6 text-muted-foreground hover:bg-foreground/10 hover:text-foreground focus-visible:outline-2 ${className}`}
    >
      <Icon name="close" className="text-[20px]" />
    </button>
  )
}
