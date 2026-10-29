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

  it('falha em GET /grupos mostra erro com "Tentar novamente" em vez de chaves cruas', async () => {
    server.use(http.get(rota('/groups'), () => new HttpResponse(null, { status: 500 })))
    abrir()

    expect(await screen.findByText('Não foi possível carregar os grupos.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Nova categoria' })).not.toBeInTheDocument()
  })

  it('na aba Grupos, falha em GET /admin/categorias mostra erro em vez de travar o apagar', async () => {
    server.use(http.get(rota('/admin/categories'), () => new HttpResponse(null, { status: 500 })))
    const usuario = userEvent.setup()
    abrir()

    await usuario.click(await screen.findByRole('radio', { name: 'Grupos' }))

    expect(await screen.findByText('Não foi possível carregar as categorias.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })

  it('visitante vai para o login', async () => {
    sair()
    const { router } = abrir()

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
  })

  it('lista as categorias com grupo e tipo', async () => {
    abrir()

    const linha = (await screen.findByText('Buraco na via')).closest('li')!
    expect(within(linha).getByText('Estado')).toBeInTheDocument()
    expect(within(linha).getByText('Via pública')).toBeInTheDocument()
    const roubo = screen.getByText('Roubo').closest('li')!
    expect(within(roubo).getByText('Evento')).toBeInTheDocument()
    expect(within(roubo).getByText('Segurança')).toBeInTheDocument()
  })

  it('cria um grupo e depois uma categoria nele, com ícone buscado no Iconify', async () => {
    iconifyFalso()
    const usuario = userEvent.setup()
    abrir()

    await usuario.click(await screen.findByRole('radio', { name: 'Grupos' }))
    await usuario.click(screen.getByRole('button', { name: 'Novo grupo' }))
    await usuario.type(await screen.findByLabelText('Nome do grupo'), 'Clima')
    await usuario.click(screen.getByRole('radio', { name: 'Evento' }))
    await usuario.click(screen.getByRole('radio', { name: 'Azul' }))
    await usuario.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(await screen.findByText('Clima')).toBeInTheDocument()

    await usuario.click(screen.getByRole('radio', { name: 'Categorias' }))
    await usuario.click(await screen.findByRole('button', { name: 'Nova categoria' }))
    await usuario.type(await screen.findByLabelText('Nome'), 'Rua inundada')
    await usuario.click(screen.getByRole('radio', { name: 'Evento' }))
    await usuario.click(
      within(screen.getByRole('group', { name: 'Grupo' })).getByRole('button', { name: 'Clima' }),
    )
    await usuario.type(screen.getByRole('searchbox', { name: 'Buscar ícone' }), 'inundacao')
    const resultados = await screen.findByRole('group', { name: 'Resultados da busca' })
    expect(within(resultados).getAllByRole('button')).toHaveLength(1)
    await usuario.click(within(resultados).getByRole('button', { name: 'ico_a' }))
    await usuario.click(screen.getByRole('button', { name: 'Salvar' }))

    const linha = (await screen.findByText('Rua inundada')).closest('li')!
    expect(within(linha).getByText('Evento')).toBeInTheDocument()
    expect(within(linha).getByText('Clima')).toBeInTheDocument()
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
    expect(screen.queryByRole('radio', { name: 'Evento' })).not.toBeInTheDocument()
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
      http.delete(rota('/admin/groups/:key'), () =>
        HttpResponse.json(
          { type: 'group-in-use', title: 'x', status: 409 },
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
    server.use(http.get(rota('/admin/categories'), () => new HttpResponse(null, { status: 500 })))
    abrir()

    expect(await screen.findByText('Não foi possível carregar as categorias.')).toBeInTheDocument()
  })

  it('Estado e Evento têm etiquetas de cores diferentes', async () => {
    abrir()

    const estado = within((await screen.findByText('Buraco na via')).closest('li')!).getByText(
      'Estado',
    )
    const evento = within(screen.getByText('Roubo').closest('li')!).getByText('Evento')
    expect(estado.className).toContain('text-primario')
    expect(evento.className).toContain('text-cat-roxo')
  })

  describe('busca e filtros das categorias', () => {
    const nomesVisiveis = () =>
      screen
        .getAllByRole('button', { name: /^Editar / })
        .map((b) => b.getAttribute('aria-label')!.replace('Editar ', ''))

    it('busca por nome ou por grupo, sem acento', async () => {
      const usuario = userEvent.setup()
      abrir()
      await screen.findByText('Buraco na via')

      await usuario.type(screen.getByRole('searchbox', { name: 'Buscar categoria' }), 'calcada')
      expect(nomesVisiveis()).toEqual(['Calçada danificada'])

      await usuario.clear(screen.getByRole('searchbox', { name: 'Buscar categoria' }))
      await usuario.type(screen.getByRole('searchbox', { name: 'Buscar categoria' }), 'eletrica')
      expect(nomesVisiveis()).toEqual(['Fio caído', 'Poste apagado'])
      expect(screen.getByText('2 de 8 categorias')).toBeInTheDocument()
    })

    it('filtra por tipo e os chips de grupo seguem o tipo', async () => {
      const usuario = userEvent.setup()
      abrir()
      await screen.findByText('Buraco na via')

      await usuario.click(screen.getByRole('radio', { name: 'Evento' }))
      expect(nomesVisiveis()).toEqual(['Roubo', 'Acidente de trânsito'])
      const chips = within(screen.getByRole('group', { name: 'Filtrar por grupo' }))
      expect(chips.getByRole('button', { name: 'Segurança' })).toBeInTheDocument()
      expect(chips.queryByRole('button', { name: 'Limpeza' })).not.toBeInTheDocument()

      await usuario.click(chips.getByRole('button', { name: 'Trânsito' }))
      expect(nomesVisiveis()).toEqual(['Acidente de trânsito'])

      await usuario.click(screen.getByRole('radio', { name: 'Estado' }))
      expect(nomesVisiveis()).toHaveLength(6)
    })

    it('filtra por situação e Limpar filtros volta tudo', async () => {
      const usuario = userEvent.setup()
      abrir()
      await usuario.click(await screen.findByRole('button', { name: 'Desativar Roubo' }))
      await screen.findByRole('button', { name: 'Ativar Roubo' })

      await usuario.click(screen.getByRole('radio', { name: 'Inativas' }))
      expect(nomesVisiveis()).toEqual(['Roubo'])
      await usuario.click(screen.getByRole('radio', { name: 'Ativas' }))
      expect(nomesVisiveis()).not.toContain('Roubo')

      await usuario.click(screen.getByRole('button', { name: 'Limpar filtros' }))
      expect(nomesVisiveis()).toContain('Roubo')
      expect(screen.queryByRole('button', { name: 'Limpar filtros' })).not.toBeInTheDocument()
    })

    it('sem resultado avisa', async () => {
      const usuario = userEvent.setup()
      abrir()
      await screen.findByText('Buraco na via')

      await usuario.type(screen.getByRole('searchbox', { name: 'Buscar categoria' }), 'zzz')

      expect(screen.getByText('Nenhuma categoria com esses filtros.')).toBeInTheDocument()
    })
  })

  describe('busca e filtros dos grupos', () => {
    it('busca por nome e filtra por tipo', async () => {
      const usuario = userEvent.setup()
      abrir()
      await usuario.click(await screen.findByRole('radio', { name: 'Grupos' }))
      await screen.findByText('Via pública')

      await usuario.type(screen.getByRole('searchbox', { name: 'Buscar grupo' }), 'transito')
      expect(screen.getByRole('button', { name: 'Editar Trânsito' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Editar Limpeza' })).not.toBeInTheDocument()

      await usuario.clear(screen.getByRole('searchbox', { name: 'Buscar grupo' }))
      await usuario.click(screen.getByRole('radio', { name: 'Estado' }))
      expect(screen.getByRole('button', { name: 'Editar Limpeza' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Editar Segurança' })).not.toBeInTheDocument()
      expect(screen.getByText('3 de 5 grupos')).toBeInTheDocument()
    })
  })
})
