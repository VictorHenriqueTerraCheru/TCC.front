import type { Schema } from '../api'
import { criarDetalhes, ID_DO_AUTOR } from './fixtures/detalhes'

type MeusVotos = Schema<'ObterDetalheProblemaMeusVotos'>

/** Estado em memória da API falsa: votos do usuário logado no mock. Reiniciado a cada teste. */
let detalhes = criarDetalhes()
let votos = new Map<string, MeusVotos>()

export const banco = {
  detalhe(id: string, autenticado: boolean) {
    const detalhe = detalhes.get(id)
    if (!detalhe) return null
    return {
      ...detalhe,
      meusVotos: autenticado ? (votos.get(id) ?? { existencia: null, persistencia: null }) : null,
      souAutor: autenticado && id === ID_DO_AUTOR,
    }
  },
  votar(id: string, tipo: 'existencia' | 'persistencia', valor: string) {
    const detalhe = detalhes.get(id)!
    const meus = votos.get(id) ?? { existencia: null, persistencia: null }
    const anterior = meus[tipo]
    if (anterior !== valor) {
      const contagem =
        tipo === 'existencia' ? { ...detalhe.existencia } : { ...detalhe.persistencia }
      const balde = (v: string) => (v === 'confirma' ? 'confirmacoes' : v) as keyof typeof contagem
      if (anterior) (contagem[balde(anterior)] as number)--
      ;(contagem[balde(valor)] as number)++
      detalhes.set(id, { ...detalhe, [tipo]: contagem })
      votos.set(id, { ...meus, [tipo]: valor } as MeusVotos)
    }
  },
  reiniciar() {
    detalhes = criarDetalhes()
    votos = new Map()
  },
}
