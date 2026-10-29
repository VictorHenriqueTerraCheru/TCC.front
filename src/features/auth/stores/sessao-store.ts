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

export const provedorAutenticacao: ProvedorAutenticacao = {
  obterToken() {
    return sessaoAtual()?.token ?? null
  },
  aoExpirarSessao() {
    useSessaoStore.getState().sair()
    useGuardaStore.setState({ expirou: true })
  },
}

export function useAutenticado(): boolean {
  return useSessaoStore((s) => s.sessao !== null)
}
