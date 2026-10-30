import type { ReactNode } from 'react'

import { cn } from '@/common/lib/utils'

interface PageProps {
  title: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function Page({ title, actions, children, className }: PageProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full animate-in px-4 pb-6 duration-300 ease-out fade-in-0 slide-in-from-bottom-2 motion-reduce:animate-none lg:max-w-3xl lg:px-8',
        className,
      )}
    >
      <header className="flex h-16 items-center justify-between">
        <h1 className="text-[28px] leading-9 font-bold tracking-tight">{title}</h1>
        {actions}
      </header>
      {children}
    </div>
  )
}
