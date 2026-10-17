import { authHandlers } from './auth'
import { categoriasHandlers } from './categorias'
import { geocodificacaoHandlers } from './geocodificacao'
import { incidentesHandlers } from './incidentes'
import { problemasHandlers } from './problemas'

// Um arquivo por área da API, na mesma divisão dos modules do back.
export const handlers = [
  ...authHandlers,
  ...categoriasHandlers,
  ...problemasHandlers,
  ...incidentesHandlers,
  ...geocodificacaoHandlers,
]
