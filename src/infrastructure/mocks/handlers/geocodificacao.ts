import { http, HttpResponse } from 'msw'

import { rota } from '../rota'

export const geocodificacaoHandlers = [
  http.get(rota('/geocodificacao/reversa'), () =>
    HttpResponse.json({
      disponivel: true,
      endereco: 'Praia de Botafogo, 300 — Botafogo',
      logradouro: 'Praia de Botafogo',
      numero: '300',
      bairro: 'Botafogo',
      cidade: 'Rio de Janeiro',
      uf: 'RJ',
      rotuloArea: 'Praia de Botafogo, Botafogo',
    }),
  ),
]
