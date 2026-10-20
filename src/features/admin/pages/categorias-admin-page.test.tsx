import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { limparCacheDeIcones } from '@/common/lib/iconify'
import { rota } from '@/infrastructure/mocks/rota'
import { server } from '@/infrastructure/mocks/server'
import { definirLargura, renderizarRotas } from '@/test/render'
import { entrarComoAdmin, entrarComoCidadao, sair } from '@/test/sessao'

import { CategoriasAdminPage } from './categorias-admin-page'

const ICONIFY = 'https://api.iconify.design'

/** Iconify falso: a busca devolve `ico_a` (e um de outro estilo, que a tela descarta). */
function iconifyFalso() {
  server.use(
    http.get(`${ICONIFY}/search`, () =>
      HttpResponse.json({
        icons: ['material-symbols:ico-a-rounded', 'material-symbols:ico-a-sharp'],
      }),
    ),
    http.get(`${ICONIFY}/material-symbols.json`, () =>
      HttpResponse.json({
        width: 24,
        icons: { 'ico-a-rounded': { body: '<path d="M1 1h4v4z"/>' } },
      }),
    ),
  )
}

function abrir() {
  definirLargura(390)
  return renderizarRotas(
    [{ path: '/admin/categorias', element: <CategoriasAdminPage /> }],
    '/admin/categorias',
  )
}

describe('administração de categorias e grupos', () => {
  beforeEach(() => {
    entrarComoAdmin()
    limparCacheDeIcones()
  })
  afterEach(sair)

  it('cidadão comum não entra', async () => {
    sair()
    entrarComoCidadao()
    abrir()

    expect(await screen.findByText('Esta área é só para administradores.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Nova categoria' })).not.toBeInTheDocument()
  })

  it('visitante vai para o login', async () => {
    sair()
    const { router } = abrir()

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
  })

  it('lista as categorias com grupo e tipo', async () => {
    abrir()

    const linha = (await screen.findByText('Buraco na via')).closest('li')!
    expect(within(linha).getByText(/Via pública · Continua lá/)).toBeInTheDocument()
    expect(screen.getByText('Roubo').closest('li')).toHaveTextContent(
      'Segurança · Aconteceu e passou',
    )
  })

  it('cria um grupo e depois uma categoria nele, com ícone buscado no Iconify', async () => {
    iconifyFalso()
    const usuario = userEvent.setup()
    abrir()

    await usuario.click(await screen.findByRole('radio', { name: 'Grupos' }))
    await usuario.click(screen.getByRole('button', { name: 'Novo grupo' }))
    await usuario.type(await screen.findByLabelText('Nome do grupo'), 'Clima')
    await usuario.click(screen.getByRole('radio', { name: 'Aconteceu e passou' }))
    await usuario.click(screen.getByRole('radio', { name: 'Azul' }))
    await usuario.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(await screen.findByText('Clima')).toBeInTheDocument()

    await usuario.click(screen.getByRole('radio', { name: 'Categorias' }))
    await usuario.click(await screen.findByRole('button', { name: 'Nova categoria' }))
    await usuario.type(await screen.findByLabelText('Nome'), 'Rua inundada')
    await usuario.click(screen.getByRole('radio', { name: 'Aconteceu e passou' }))
    await usuario.click(
      within(screen.getByRole('group', { name: 'Grupo' })).getByRole('button', { name: 'Clima' }),
    )
    await usuario.type(screen.getByRole('searchbox', { name: 'Buscar ícone' }), 'inundacao')
    const resultados = await screen.findByRole('group', { name: 'Resultados da busca' })
    expect(within(resultados).getAllByRole('button')).toHaveLength(1) // só o Rounded sólido
    await usuario.click(within(resultados).getByRole('button', { name: 'ico_a' }))
    await usuario.click(screen.getByRole('button', { name: 'Salvar' }))

    const linha = (await screen.findByText('Rua inundada')).closest('li')!
    expect(linha).toHaveTextContent('Clima · Aconteceu e passou')
    await waitFor(() => expect(linha.querySelector('svg path')).toHaveAttribute('d', 'M1 1h4v4z'))
  })

  it('formulário de categoria mostra os erros de preenchimento', async () => {
    const usuario = userEvent.setup()
    abrir()

    await usuario.click(await screen.findByRole('button', { name: 'Nova categoria' }))
    await usuario.click(await screen.findByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Informe o nome.')).toBeInTheDocument()
    expect(screen.getByText('Escolha o grupo.')).toBeInTheDocument()
    expect(screen.getByText('Escolha um ícone.')).toBeInTheDocument()
  })

  it('nome repetido mostra a mensagem da API', async () => {
    const usuario = userEvent.setup()
    abrir()

    await usuario.click(await screen.findByRole('button', { name: 'Editar Calçada danificada' }))
    const nome = await screen.findByLabelText('Nome')
    await usuario.clear(nome)
    await usuario.type(nome, 'buraco na via')
    await usuario.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Já existe uma categoria com este nome.')).toBeInTheDocument()
  })

  it('editar não deixa trocar o tipo e salva o novo nome', async () => {
    const usuario = userEvent.setup()
    abrir()

    await usuario.click(await screen.findByRole('button', { name: 'Editar Fio caído' }))
    expect(await screen.findByText(/O tipo não muda depois de criada/)).toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: 'Aconteceu e passou' })).not.toBeInTheDocument()
    const nome = screen.getByLabelText('Nome')
    await usuario.clear(nome)
    await usuario.type(nome, 'Fio solto')
    await usuario.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Fio solto')).toBeInTheDocument()
    expect(screen.queryByText('Fio caído')).not.toBeInTheDocument()
  })

  it('desativar marca como inativa e ativar volta', async () => {
    const usuario = userEvent.setup()
    abrir()

    await usuario.click(await screen.findByRole('button', { name: 'Desativar Lixo acumulado' }))
    expect((await screen.findByText('Lixo acumulado')).closest('li')).toHaveTextContent('Inativa')

    await usuario.click(screen.getByRole('button', { name: 'Ativar Lixo acumulado' }))
    await waitFor(() =>
      expect(screen.getByText('Lixo acumulado').closest('li')).not.toHaveTextContent('Inativa'),
    )
  })

  it('só apaga grupo vazio: com categorias o botão fica desabilitado', async () => {
    const usuario = userEvent.setup()
    abrir()

    await usuario.click(await screen.findByRole('radio', { name: 'Grupos' }))
    expect(await screen.findByRole('button', { name: 'Apagar Limpeza' })).toBeDisabled()

    await usuario.click(screen.getByRole('button', { name: 'Novo grupo' }))
    await usuario.type(await screen.findByLabelText('Nome do grupo'), 'Provisório')
    await usuario.click(screen.getByRole('button', { name: 'Salvar' }))

    await usuario.click(await screen.findByRole('button', { name: 'Apagar Provisório' }))
    await usuario.click(await screen.findByRole('button', { name: 'Apagar' }))
    await waitFor(() => expect(screen.queryByText('Provisório')).not.toBeInTheDocument())
  })

  it('grupo em uso (outra pessoa criou categoria) mostra o motivo ao apagar', async () => {
    server.use(
      http.delete(rota('/admin/grupos/:chave'), () =>
        HttpResponse.json(
          { type: 'grupo-em-uso', title: 'x', status: 409 },
          { status: 409, headers: { 'Content-Type': 'application/problem+json' } },
        ),
      ),
    )
    const usuario = userEvent.setup()
    abrir()
    await usuario.click(await screen.findByRole('radio', { name: 'Grupos' }))
    await usuario.click(screen.getByRole('button', { name: 'Novo grupo' }))
    await usuario.type(await screen.findByLabelText('Nome do grupo'), 'Vazio')
    await usuario.click(screen.getByRole('button', { name: 'Salvar' }))

    await usuario.click(await screen.findByRole('button', { name: 'Apagar Vazio' }))
    await usuario.click(await screen.findByRole('button', { name: 'Apagar' }))

    expect(await screen.findByText(/ainda tem categorias/)).toBeInTheDocument()
  })

  it('falha ao carregar mostra tentar de novo', async () => {
    server.use(http.get(rota('/admin/categorias'), () => new HttpResponse(null, { status: 500 })))
    abrir()

    expect(await screen.findByText('Não foi possível carregar as categorias.')).toBeInTheDocument()
  })
})
