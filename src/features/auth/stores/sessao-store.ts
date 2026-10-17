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
    {
      name: 'ocorrencias.sessao',
      storage: createJSONStorage(() => localStorage),
      // Reaberto depois de expiraEm: começa como visitante (a guarda pede login antes da ação).
      onRehydrateStorage: () => (estado) => {
        if (estado?.sessao && expirou(estado.sessao)) {
          estado.sair()
          useGuardaStore.setState({ expirou: true })
        }
      },
    },
  ),
)

function expirou(sessao: Sessao): boolean {
  return Date.parse(sessao.expiraEm) <= Date.now()
}

/**
 * Sessão válida agora, ou `null`. Uma sessão que expirou com o app aberto é limpa aqui, e não só
 * na próxima chamada à API: a guarda precisa ver o visitante antes de executar a ação.
 */
export function sessaoAtual(): Sessao | null {
  const { sessao, sair } = useSessaoStore.getState()
  if (!sessao) return null
  if (expirou(sessao)) {
    sair()
    useGuardaStore.setState({ expirou: true })
    return null
  }
  return sessao
}

/** Ligação da sessão com o cliente HTTP (registrada em main.tsx). */
export const provedorAutenticacao: ProvedorAutenticacao = {
  obterToken() {
    return sessaoAtual()?.token ?? null
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
