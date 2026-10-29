import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { Schema } from '@/infrastructure/api'

export type MotivoConta = 'votar' | 'registrar'

export type AcaoPendente =
  | { tipo: 'votar'; problemaId: string; valor: Schema<'ValorVotoContrato'> }
  | { tipo: 'continuarRegistro'; passo: 'conferir' | 'enviar' }

export interface Pendencia {
  retorno: string
  acao: AcaoPendente | null
}

interface GuardaState {
  motivo: MotivoConta | null
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
      motivo: null,
      expirou: false,
      pendencia: null,
      pedirConta: (motivo, pendencia, expirou = false) => set({ motivo, pendencia, expirou }),
      fecharFolha: () => set({ motivo: null }),
      descartar: () => set({ motivo: null, pendencia: null, expirou: false }),
      concluirLogin: () => {
        const { pendencia } = get()
        set({ motivo: null, expirou: false, pendencia: pendencia?.acao ? pendencia : null })
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
