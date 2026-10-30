import type { Transition } from 'motion/react'

export const SOFT_SPRING: Transition = { type: 'spring', stiffness: 420, damping: 34, mass: 0.9 }

export const FAST_SPRING: Transition = { type: 'spring', stiffness: 600, damping: 26 }

export const APPEAR: Transition = { duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }

export const LIST_DELAY = 0.035
