import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { Schema } from '@/infrastructure/api'

/** Por que a folha "Entre para…" abriu: votar (tela 27) ou registrar (tela 14). */
export type MotivoConta = 'votar' | 'registrar'

/** Ação que o visitante tentou fazer; quem sabe executá-la é a tela de destino. */
export type AcaoPendente =
  | { tipo: 'votarExistencia'; problemaId: string; valor: Schema<'ValorExistencia'> }
  | { tipo: 'votarPersistencia'; problemaId: string; valor: Schema<'ValorPersistencia'> }
  /** Registro interrompido por um 401: conferir duplicatas ou enviar (o rascunho está salvo). */
  | { tipo: 'continuarRegistro'; passo: 'conferir' | 'enviar' }

export interface Pendencia {
  /** Rota para onde voltar depois do login/cadastro (pathname + search). */
  retorno: string
  acao: AcaoPendente | null
}

interface GuardaState {
  /** Folha aberta (null = fechada). */
  motivo: MotivoConta | null
  /** A folha abriu porque o token expirou (regra 13). */
  expirou: boolean
  pendencia: Pendencia | null
  pedirConta(motivo: MotivoConta, pendencia: Pendencia, expirou?: boolean): void
  /** Fecha a folha mantendo a pendência (indo para login/cadastro). */
  fecharFolha(): void
  /** "Agora não": fecha e esquece a ação. */
  descartar(): void
  /** Depois do login: devolve a rota de retorno e mantém a ação para o destino. */
  concluirLogin(): string | null
  /** Destino pega a ação se for dele (e ela some). */
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
      // Só a pendência sobrevive ao recarregar; a folha aberta não.
      partialize: ({ pendencia }) => ({ pendencia }),
    },
  ),
)
