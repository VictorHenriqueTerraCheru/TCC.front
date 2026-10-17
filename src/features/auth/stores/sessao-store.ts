import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { ProvedorAutenticacao } from '@/infrastructure/api'

import type { RespostaAuth, Sessao } from '../models/sessao'

interface SessaoState {
  sessao: Sessao | null
  entrar(resposta: RespostaAuth): void
  sair(): void
}

// Token em localStorage: aceitável no escopo do TCC, registrado como limitação (regra 11).
export const useSessaoStore = create<SessaoState>()(
  persist(
    (set) => ({
      sessao: null,
      entrar: ({ token, expiraEm, usuario }) => set({ sessao: { token, expiraEm, usuario } }),
      sair: () => set({ sessao: null }),
    }),
    { name: 'ocorrencias.sessao', storage: createJSONStorage(() => localStorage) },
  ),
)

function expirou(sessao: Sessao): boolean {
  return Date.parse(sessao.expiraEm) <= Date.now()
}

/** Ligação da sessão com o cliente HTTP (registrada em main.tsx). */
export const provedorAutenticacao: ProvedorAutenticacao = {
  obterToken() {
    const { sessao, sair } = useSessaoStore.getState()
    if (!sessao) return null
    if (expirou(sessao)) {
      sair()
      return null
    }
    return sessao.token
  },
  aoExpirarSessao() {
    // Etapa 3: guardar a ação pendente e abrir o login (mesma guarda da regra 1).
    useSessaoStore.getState().sair()
  },
}

export function useAutenticado(): boolean {
  return useSessaoStore((s) => s.sessao !== null)
}
