import { create } from 'zustand'

/** Por que a folha "Entre para…" abriu: votar (tela 27) ou registrar (tela 14). */
export type MotivoConta = 'votar' | 'registrar'

interface GuardaState {
  motivo: MotivoConta | null
  pedirConta(motivo: MotivoConta): void
  fechar(): void
}

// Etapa 3: guardar também a ação pendente e retomá-la depois do login (regra 1).
export const useGuardaStore = create<GuardaState>()((set) => ({
  motivo: null,
  pedirConta: (motivo) => set({ motivo }),
  fechar: () => set({ motivo: null }),
}))
