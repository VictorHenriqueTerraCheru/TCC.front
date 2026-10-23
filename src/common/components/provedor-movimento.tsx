import { LazyMotion, MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'

/**
 * Componentes animam com m.* (strict barra o motion.* completo, que carregaria tudo de novo);
 * "user" respeita o "Reduzir movimento" do sistema. domMax porque os indicadores deslizantes
 * usam layoutId; ele chega num chunk à parte, e até lá os componentes aparecem sem animar.
 */
const carregarRecursos = () => import('@/common/lib/recursos-movimento').then((r) => r.default)

export function ProvedorMovimento({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={carregarRecursos} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  )
}
