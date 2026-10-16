import { http, HttpResponse } from 'msw'

import { categorias } from '../fixtures/categorias'
import { rota } from '../rota'

export const categoriasHandlers = [
  http.get(rota('/categorias'), () => HttpResponse.json(categorias)),
]
