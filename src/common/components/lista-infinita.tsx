import { useEffect, useRef, type ReactNode } from 'react'

import { Button } from '@/common/ui/button'

interface PagedQuery {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage(): Promise<unknown>
}

export function InfiniteList({ query, children }: { query: PagedQuery; children: ReactNode }) {
  const endRef = useRef<HTMLDivElement>(null)
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query

  useEffect(() => {
    const end = endRef.current
    if (!end || !hasNextPage || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && !isFetchingNextPage) void fetchNextPage()
    })
    observer.observe(end)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <>
      {children}
      <div ref={endRef} className="flex justify-center py-4">
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
