import { useGuardaStore, type MotivoConta } from '../stores/guarda-store'
import { useAutenticado } from '../stores/sessao-store'

/**
 * Regra 1 — visitante vê, conta age. Com sessão, executa a ação; sem sessão, abre a folha
 * "Entre para votar/registrar".
 */
export function useExigirConta() {
  const autenticado = useAutenticado()
  const pedirConta = useGuardaStore((s) => s.pedirConta)

  return (motivo: MotivoConta, acao: () => void) => {
    if (autenticado) acao()
    else pedirConta(motivo)
  }
}
