import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { rota } from '@/infrastructure/mocks/rota'
import { server } from '@/infrastructure/mocks/server'
import { definirLargura, renderizarRotas } from '@/test/render'
import { entrarComoAdmin, entrarComoCidadao, sair } from '@/test/sessao'

import { UsuariosAdminPage } from './usuarios-admin-page'

function abrir() {
  definirLargura(390)
  return renderizarRotas(
    [{ path: '/admin/usuarios', element: <UsuariosAdminPage /> }],
    '/admin/usuarios',
  )
}

const cartao = (nome: string) => screen.findByRole('article', { name: `Usuário ${nome}` })

describe('administração de usuários', () => {
  beforeEach(entrarComoAdmin)
  afterEach(sair)

  it('cidadão comum não entra', async () => {
    sair()
    entrarComoCidadao()
    abrir()

    expect(await screen.findByText('Esta área é só para administradores.')).toBeInTheDocument()
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
  })

  it('lista os usuários com e-mail e perfil', async () => {
    abrir()

    const ana = await cartao('Ana Lima')
    expect(within(ana).getByText('cidadao1@tcc.local')).toBeInTheDocument()
    expect(within(ana).getByText('Cidadão')).toBeInTheDocument()
    const mariana = await cartao('Mariana Souza')
    expect(within(mariana).getByText('Perfil verificado')).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(4)
  })

  it('busca por nome ou e-mail', async () => {
    const usuario = userEvent.setup()
    abrir()
    await cartao('Ana Lima')

    await usuario.type(screen.getByRole('searchbox', { name: 'Buscar usuário' }), 'mariana')

    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1))
    expect(await cartao('Mariana Souza')).toBeInTheDocument()
  })

  it('filtra por perfil', async () => {
    const usuario = userEvent.setup()
    abrir()
    await cartao('Ana Lima')

    await usuario.click(screen.getByRole('radio', { name: 'Admin' }))

    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1))
    expect(await cartao('Admin TCC')).toBeInTheDocument()
  })

  it('altera o perfil de um usuário e a lista reflete a mudança', async () => {
    const usuario = userEvent.setup()
    abrir()
    const ana = await cartao('Ana Lima')

    await usuario.click(within(ana).getByRole('button', { name: 'Alterar perfil' }))
    await usuario.click(await screen.findByRole('radio', { name: /Perfil verificado/ }))
    await usuario.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(async () =>
      expect(within(await cartao('Ana Lima')).getByText('Perfil verificado')).toBeInTheDocument(),
    )
    expect(screen.queryByRole('button', { name: 'Salvar' })).not.toBeInTheDocument()
  })

  it('não oferece trocar o próprio perfil', async () => {
    abrir()

    const eu = await cartao('Admin TCC')

    expect(within(eu).queryByRole('button', { name: 'Alterar perfil' })).not.toBeInTheDocument()
    expect(within(eu).getByText('Você')).toBeInTheDocument()
  })

  it('mostra o erro da API ao salvar e mantém a folha aberta', async () => {
    server.use(
      http.patch(rota('/admin/usuarios/:id/perfil'), () =>
        HttpResponse.json(
          { type: 'proprio-perfil', title: 'x', status: 422 },
          { status: 422, headers: { 'Content-Type': 'application/problem+json' } },
        ),
      ),
    )
    const usuario = userEvent.setup()
    abrir()
    const ana = await cartao('Ana Lima')

    await usuario.click(within(ana).getByRole('button', { name: 'Alterar perfil' }))
    await usuario.click(await screen.findByRole('radio', { name: /Administrador/ }))
    await usuario.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Você não pode alterar o seu próprio perfil.',
    )
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
  })

  it('falha ao carregar mostra "Tentar novamente"', async () => {
    server.use(http.get(rota('/admin/usuarios'), () => new HttpResponse(null, { status: 500 })))
    abrir()

    expect(await screen.findByText('Não foi possível carregar os usuários.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })
})
