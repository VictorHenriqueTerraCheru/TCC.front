import type { Transition } from 'motion/react'

// Movimento sutil, no estilo do iOS: molas curtas, sem quique visível. Tudo que anima usa estas
// constantes; o MotionConfig dos Providers desliga as animações com "Reduzir movimento".

/** Indicadores que deslizam (pílula do segmentado, aba ativa) e painéis que mudam de tamanho. */
export const MOLA_SUAVE: Transition = { type: 'spring', stiffness: 420, damping: 34, mass: 0.9 }

/** Respostas a toque (ícone da aba que "pula", polegar ao votar). */
export const MOLA_RAPIDA: Transition = { type: 'spring', stiffness: 600, damping: 26 }

/** Entradas e saídas curtas (ícone que aparece, conteúdo que troca). */
export const SURGIR: Transition = { duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }

/** Atraso entre itens de uma lista na primeira carga. */
export const ATRASO_LISTA = 0.035
