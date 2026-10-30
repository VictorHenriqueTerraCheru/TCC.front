import { animate, m, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { useEffect } from 'react'

import { FAST_SPRING } from '@/common/lib/movimento'

interface AnimatedNumberProps {
  value: number
  format?(n: number): string
  className?: string
}

export function AnimatedNumber({ value, format = String, className }: AnimatedNumberProps) {
  const current = useMotionValue(value)
  const text = useTransform(current, (n) => format(Math.round(n)))
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce) {
      current.jump(value)
      return
    }
    const control = animate(current, value, { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] })
    return () => control.stop()
  }, [current, value, reduce])

  return (
    <m.span className={className ? `tabular-nums ${className}` : 'tabular-nums'}>{text}</m.span>
  )
}

export function PulsingNumber({ value, className }: { value: number; className?: string }) {
  return (
    <m.span
      key={value}
      initial={{ scale: 1.25, opacity: 0.5 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={FAST_SPRING}
      className={className ? `inline-block tabular-nums ${className}` : 'inline-block tabular-nums'}
    >
      {value}
    </m.span>
  )
}
