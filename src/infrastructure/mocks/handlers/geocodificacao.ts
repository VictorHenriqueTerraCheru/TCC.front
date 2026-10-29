import { http, HttpResponse } from 'msw'

import { rota } from '../rota'

export const geocodificacaoHandlers = [
  http.get(rota('/geocoding/reverse'), () =>
    HttpResponse.json({
      available: true,
      address: 'Praia de Botafogo, 300 — Botafogo',
      street: 'Praia de Botafogo',
      number: '300',
      neighborhood: 'Botafogo',
      city: 'Rio de Janeiro',
      state: 'RJ',
      areaLabel: 'Praia de Botafogo, Botafogo',
    }),
  ),
]
