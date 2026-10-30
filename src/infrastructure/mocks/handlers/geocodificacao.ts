import { http, HttpResponse } from 'msw'

import { route } from '../rota'

export const geocodingHandlers = [
  http.get(route('/geocoding/reverse'), () =>
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
