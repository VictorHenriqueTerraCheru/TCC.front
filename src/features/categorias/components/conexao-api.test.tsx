import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { server } from '@/infrastructure/mocks/server'
import { rota } from '@/infrastructure/mocks/rota'
import { renderizar } from '@/test/render'

import { ConexaoApi } from './conexao-api'

describe('ConexaoApi', () => {
  it('lista as categorias vindas de GET /categorias', async () => {
    renderizar(<ConexaoApi />)

    expect(await screen.findByText('Buraco na via')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(8)
    expect(screen.getByText('Segurança · incidente')).toBeInTheDocument()
  })

  it('mostra o erro e permite tentar de novo quando a API falha', async () => {
    server.use(http.get(rota('/categorias'), () => new HttpResponse(null, { status: 500 })))

    renderizar(<ConexaoApi />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível falar com a API')
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })
})
