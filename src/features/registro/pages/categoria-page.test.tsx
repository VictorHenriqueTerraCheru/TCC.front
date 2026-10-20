import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { rotas } from '@/app/router'
import { categorias } from '@/infrastructure/mocks/fixtures/categorias'
import { grupos } from '@/infrastructure/mocks/fixtures/grupos'
import { rota } from '@/infrastructure/mocks/rota'
import { server } from '@/infrastructure/mocks/server'
import { definirLargura, renderizarRotas } from '@/test/render'
import { entrarComoCidadao, sair } from '@/test/sessao'

import { useRascunhoStore } from '../stores/rascunho-store'

function abrir(caminho: string) {
  definirLargura(390)
  return renderizarRotas(rotas, caminho)
}

describe('passo 1: tipo e categoria', () => {
  beforeEach(entrarComoCidadao)
  afterEach(() => {
    sair()
    useRascunhoStore.getState().limpar()
    sessionStorage.clear()
  })

  it('a tela de tipo leva à lista de categorias do tipo escolhido', async () => {
    const usuario = userEvent.setup()
    const { router } = abrir('/registrar')

    await usuario.click(await screen.findByRole('link', { name: /Aconteceu e passou/ }))

    expect(router.state.location.pathname + router.state.location.search).toBe(
      '/registrar/categoria?tipo=incidente',
    )
    expect(await screen.findByRole('button', { name: 'Roubo' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Buraco na via' })).not.toBeInTheDocument()
  })

  it('tipo ausente ou inválido volta para a escolha do tipo', async () => {
    const { router } = abrir('/registrar/categoria?tipo=qualquer')

    await waitFor(() => expect(router.state.location.pathname).toBe('/registrar'))
    expect(await screen.findByRole('heading', { name: 'Isso continua lá?' })).toBeInTheDocument()
  })

  it('mostra as categorias do tipo agrupadas, uma seção por grupo, na ordem da API', async () => {
    abrir('/registrar/categoria?tipo=problema')

    for (const grupo of ['Via pública', 'Elétrica', 'Limpeza']) {
      expect(await screen.findByRole('region', { name: grupo })).toBeInTheDocument()
    }
    const botoes = within(screen.getByRole('region', { name: 'Via pública' })).getAllByRole(
      'button',
    )
    expect(botoes).toHaveLength(2)
    expect(botoes[0]).toHaveAccessibleName('Buraco na via')
    expect(botoes[1]).toHaveAccessibleName('Calçada danificada')
    expect(screen.queryByRole('region', { name: 'Segurança' })).not.toBeInTheDocument()
  })

  it('chip de grupo filtra as seções; tocar de novo volta para Todas', async () => {
    const usuario = userEvent.setup()
    abrir('/registrar/categoria?tipo=problema')

    await usuario.click(await screen.findByRole('button', { name: 'Elétrica' }))
    expect(screen.queryByRole('region', { name: 'Limpeza' })).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Elétrica' })).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Elétrica' }))
    expect(screen.getByRole('region', { name: 'Limpeza' })).toBeInTheDocument()
  })

  it('a busca ignora acento e maiúsculas e avisa quando não acha nada', async () => {
    const usuario = userEvent.setup()
    abrir('/registrar/categoria?tipo=problema')

    await usuario.type(
      await screen.findByRole('searchbox', { name: 'Buscar categoria' }),
      'CALCADA',
    )
    expect(screen.getByRole('button', { name: 'Calçada danificada' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Buraco na via' })).not.toBeInTheDocument()

    await usuario.clear(screen.getByRole('searchbox', { name: 'Buscar categoria' }))
    await usuario.type(screen.getByRole('searchbox', { name: 'Buscar categoria' }), 'xyz')
    expect(screen.getByText(/Nenhuma categoria com esse nome/)).toBeInTheDocument()
  })

  it('Continuar só habilita com uma categoria; segue para o local e vira "Recente" na próxima vez', async () => {
    const usuario = userEvent.setup()
    const { router } = abrir('/registrar/categoria?tipo=problema')

    const continuar = await screen.findByRole('button', { name: 'Continuar' })
    expect(continuar).toBeDisabled()

    await usuario.click(await screen.findByRole('button', { name: 'Poste apagado' }))
    expect(screen.getByText('Selecionada: Poste apagado')).toBeInTheDocument()
    await usuario.click(continuar)
    await waitFor(() => expect(router.state.location.pathname).toBe('/registrar/local'))

    await router.navigate('/registrar/categoria?tipo=problema')
    const recentes = await screen.findByRole('region', { name: 'Recentes' })
    expect(
      within(recentes).getByRole('button', { name: 'Recente: Poste apagado' }),
    ).toBeInTheDocument()
  })

  it('rascunho de outro tipo não conta como escolha', async () => {
    useRascunhoStore.getState().escolherCategoria(7) // Roubo (incidente)
    abrir('/registrar/categoria?tipo=problema')

    expect(await screen.findByRole('button', { name: 'Continuar' })).toBeDisabled()
  })

  it('grupo e categoria criados pelo admin aparecem sem mudar o app', async () => {
    server.use(
      http.get(rota('/grupos'), () =>
        HttpResponse.json([
          ...grupos,
          { chave: 'clima', rotulo: 'Clima', tipo: 'incidente', cor: 'azul', ordem: 6 },
        ]),
      ),
      http.get(rota('/categorias'), () =>
        HttpResponse.json([
          ...categorias,
          { id: 9, nome: 'Rua inundada', grupo: 'clima', tipo: 'incidente', icone: 'ico_a' },
        ]),
      ),
      http.get('https://api.iconify.design/material-symbols.json', () =>
        HttpResponse.json({
          width: 24,
          icons: { 'ico-a-rounded': { body: '<path d="M1 1h4v4z"/>' } },
        }),
      ),
    )
    abrir('/registrar/categoria?tipo=incidente')

    const clima = await screen.findByRole('region', { name: 'Clima' })
    expect(within(clima).getByRole('button', { name: 'Rua inundada' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clima' })).toBeInTheDocument()
    await waitFor(() => expect(clima.querySelector('svg path')).toHaveAttribute('d', 'M1 1h4v4z'))
  })

  it('falha ao carregar as categorias oferece tentar de novo', async () => {
    server.use(http.get(rota('/categorias'), () => new HttpResponse(null, { status: 500 })))
    abrir('/registrar/categoria?tipo=problema')

    expect(await screen.findByText('Não foi possível carregar as categorias.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })

  it('categoria cujo grupo sumiu aparece em "Outras" e continua escolhível', async () => {
    server.use(
      http.get(rota('/categorias'), () =>
        HttpResponse.json([
          ...categorias,
          { id: 9, nome: 'Sem grupo', grupo: 'removido', tipo: 'problema', icone: 'ico_a' },
        ]),
      ),
    )
    const usuario = userEvent.setup()
    abrir('/registrar/categoria?tipo=problema')

    const outras = await screen.findByRole('region', { name: 'Outras' })
    await usuario.click(within(outras).getByRole('button', { name: 'Sem grupo' }))
    expect(screen.getByText('Selecionada: Sem grupo')).toBeInTheDocument()
  })

  it('falha em /grupos oferece tentar de novo em vez de uma lista vazia', async () => {
    server.use(http.get(rota('/grupos'), () => new HttpResponse(null, { status: 500 })))
    abrir('/registrar/categoria?tipo=problema')

    expect(await screen.findByText('Não foi possível carregar as categorias.')).toBeInTheDocument()
    expect(screen.queryByText(/Nenhuma categoria com esse nome/)).not.toBeInTheDocument()
  })

  it('passo de local com categoria de outro tipo volta para a lista do tipo certo', async () => {
    useRascunhoStore.getState().escolherCategoria(7) // Roubo (incidente)
    const { router } = abrir('/registrar/local')

    await waitFor(() =>
      expect(router.state.location.pathname + router.state.location.search).toBe(
        '/registrar/categoria?tipo=problema',
      ),
    )
  })

  it('passo de local com categoria que foi desativada volta para a lista', async () => {
    useRascunhoStore.getState().escolherCategoria(99)
    const { router } = abrir('/registrar/incidente/local')

    await waitFor(() =>
      expect(router.state.location.pathname + router.state.location.search).toBe(
        '/registrar/categoria?tipo=incidente',
      ),
    )
  })
})
