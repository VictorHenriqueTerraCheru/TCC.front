import { LazyMotion, MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'

const carregarRecursos = () => import('@/common/lib/recursos-movimento').then((r) => r.default)

export function ProvedorMovimento({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={carregarRecursos} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  )
}
