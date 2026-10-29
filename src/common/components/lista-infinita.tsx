import { useEffect, useRef, type ReactNode } from 'react'

import { Button } from '@/common/ui/button'

interface ConsultaPaginada {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage(): Promise<unknown>
}

export function ListaInfinita({
  consulta,
  children,
}: {
  consulta: ConsultaPaginada
  children: ReactNode
}) {
  const fimRef = useRef<HTMLDivElement>(null)
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = consulta

  useEffect(() => {
    const fim = fimRef.current
    if (!fim || !hasNextPage || typeof IntersectionObserver === 'undefined') return
    const observador = new IntersectionObserver(([entrada]) => {
      if (entrada?.isIntersecting && !isFetchingNextPage) void fetchNextPage()
    })
    observador.observe(fim)
    return () => observador.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <>
      {children}
      <div ref={fimRef} className="flex justify-center py-4">
        {hasNextPage && (
          <Button
            variant="ghost"
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
          >
            {isFetchingNextPage ? 'Carregando…' : 'Carregar mais'}
          </Button>
        )}
      </div>
    </>
  )
}
