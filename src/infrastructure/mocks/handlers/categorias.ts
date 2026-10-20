import { http, HttpResponse } from 'msw'

import { categorias } from '../fixtures/categorias'
import { grupos } from '../fixtures/grupos'
import { rota } from '../rota'

export const categoriasHandlers = [
  http.get(rota('/categorias'), () => HttpResponse.json(categorias)),
  http.get(rota('/grupos'), () => HttpResponse.json(grupos)),
]
