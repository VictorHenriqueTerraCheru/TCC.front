import { categoriasHandlers } from './categorias'
import { incidentesHandlers } from './incidentes'
import { problemasHandlers } from './problemas'

// Um arquivo por área da API, na mesma divisão dos modules do back.
export const handlers = [...categoriasHandlers, ...problemasHandlers, ...incidentesHandlers]
