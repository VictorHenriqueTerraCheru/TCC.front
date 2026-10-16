import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { ProvedorAutenticacao } from '@/infrastructure/api'

import type { RespostaAuth, Sessao } from '../models/sessao'
import { useGuardaStore } from './guarda-store'

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
    // Regra 13: limpa a sessão e marca a expiração. Quem fez a chamada (ex.: o voto) passa de
    // novo pela guarda, que agora vê o visitante, guarda a ação e abre a folha.
    useSessaoStore.getState().sair()
    useGuardaStore.setState({ expirou: true })
  },
}

export function useAutenticado(): boolean {
  return useSessaoStore((s) => s.sessao !== null)
}
