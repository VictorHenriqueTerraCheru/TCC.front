import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { Schema } from '@/infrastructure/api'

export type MotivoConta = 'votar' | 'registrar'

export type AcaoPendente =
  | { type: 'votar'; problemaId: string; value: Schema<'VoteAnswer'> }
  | { type: 'continuarRegistro'; passo: 'conferir' | 'enviar' }

export interface Pendencia {
  retorno: string
  acao: AcaoPendente | null
}

interface GuardaState {
  reason: MotivoConta | null
  expirou: boolean
  pendencia: Pendencia | null
  pedirConta(motivo: MotivoConta, pendencia: Pendencia, expirou?: boolean): void
  fecharFolha(): void
  descartar(): void
  concluirLogin(): string | null
  consumirAcao(filtro: (acao: AcaoPendente) => boolean): AcaoPendente | null
}

export const useGuardaStore = create<GuardaState>()(
  persist(
    (set, get) => ({
      reason: null,
      expirou: false,
      pendencia: null,
      pedirConta: (motivo, pendencia, expirou = false) =>
        set({ reason: motivo, pendencia, expirou }),
      fecharFolha: () => set({ reason: null }),
      descartar: () => set({ reason: null, pendencia: null, expirou: false }),
      concluirLogin: () => {
        const { pendencia } = get()
        set({ reason: null, expirou: false, pendencia: pendencia?.acao ? pendencia : null })
        return pendencia?.retorno ?? null
      },
      consumirAcao: (filtro) => {
        const acao = get().pendencia?.acao ?? null
        if (!acao || !filtro(acao)) return null
        set({ pendencia: null })
        return acao
      },
    }),
    {
      name: 'ocorrencias.pendencia',
      storage: createJSONStorage(() => sessionStorage),
      partialize: ({ pendencia }) => ({ pendencia }),
    },
  ),
)
