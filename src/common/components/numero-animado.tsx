import { animate, m, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { useEffect } from 'react'

import { MOLA_RAPIDA } from '@/common/lib/movimento'

interface NumeroAnimadoProps {
  valor: number
  formatar?(n: number): string
  className?: string
}

export function NumeroAnimado({ valor, formatar = String, className }: NumeroAnimadoProps) {
  const atual = useMotionValue(valor)
  const texto = useTransform(atual, (n) => formatar(Math.round(n)))
  const reduzir = useReducedMotion()

  useEffect(() => {
    if (reduzir) {
      atual.jump(valor)
      return
    }
    const controle = animate(atual, valor, { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] })
    return () => controle.stop()
  }, [atual, valor, reduzir])

  return (
    <m.span className={className ? `tabular-nums ${className}` : 'tabular-nums'}>{texto}</m.span>
  )
}

export function NumeroComPulso({ valor, className }: { valor: number; className?: string }) {
  return (
    <m.span
      key={valor}
      initial={{ scale: 1.25, opacity: 0.5 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={MOLA_RAPIDA}
      className={className ? `inline-block tabular-nums ${className}` : 'inline-block tabular-nums'}
    >
      {valor}
    </m.span>
  )
}
