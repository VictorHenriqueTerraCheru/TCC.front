import type { Transition } from 'motion/react'

export const MOLA_SUAVE: Transition = { type: 'spring', stiffness: 420, damping: 34, mass: 0.9 }

export const MOLA_RAPIDA: Transition = { type: 'spring', stiffness: 600, damping: 26 }

export const SURGIR: Transition = { duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }

export const ATRASO_LISTA = 0.035
