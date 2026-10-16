import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { Horario } from '../models/horario'

export interface Ponto {
  lat: number
  lng: number
}

interface RascunhoState {
  categoriaId: number | null
  /** Centro do mapa no passo "Onde fica?" (ponto exato; a API arredonda o de incidentes). */
  local: Ponto | null
  descricao: string
  horario: Horario
  escolherCategoria(id: number): void
  definirLocal(local: Ponto): void
  definirDescricao(descricao: string): void
  definirHorario(horario: Horario): void
  limpar(): void
}

const vazio = {
  categoriaId: null,
  local: null,
  descricao: '',
  horario: { modo: 'agora', outroEm: null } satisfies Horario,
}

/**
 * Rascunho do registro (regra 5): persistido em sessionStorage, sobrevive a recarregar a página
 * e à falha de envio. Só é limpo depois do envio com sucesso ou ao fechar o fluxo.
 */
export const useRascunhoStore = create<RascunhoState>()(
  persist(
    (set) => ({
      ...vazio,
      escolherCategoria: (categoriaId) => set({ categoriaId }),
      definirLocal: (local) => set({ local }),
      definirDescricao: (descricao) => set({ descricao }),
      definirHorario: (horario) => set({ horario }),
      limpar: () => set(vazio),
    }),
    { name: 'ocorrencias.rascunhoRegistro', storage: createJSONStorage(() => sessionStorage) },
  ),
)
