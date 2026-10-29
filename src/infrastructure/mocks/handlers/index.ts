import { authHandlers } from './auth'
import { categoriasHandlers } from './categorias'
import { geocodificacaoHandlers } from './geocodificacao'
import { incidentesHandlers } from './incidentes'
import { problemasHandlers } from './problemas'
import { adminHandlers, usuariosHandlers } from './usuarios'

export const handlers = [
  ...authHandlers,
  ...categoriasHandlers,
  ...problemasHandlers,
  ...incidentesHandlers,
  ...geocodificacaoHandlers,
  ...usuariosHandlers,
  ...adminHandlers,
]
