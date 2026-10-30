import { LazyMotion, MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'

const loadResources = () => import('@/common/lib/motion-features').then((r) => r.default)

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadResources} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  )
}
