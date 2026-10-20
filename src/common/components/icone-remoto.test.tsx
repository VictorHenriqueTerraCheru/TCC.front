import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { limparCacheDeIcones } from '@/common/lib/iconify'
import { server } from '@/infrastructure/mocks/server'
import { renderizar } from '@/test/render'

import { IconeDinamico } from './icone-remoto'

beforeEach(() => limparCacheDeIcones())

describe('IconeDinamico', () => {
  it('ícone do pacote embutido usa a fonte, sem rede', () => {
    const { container } = renderizar(<IconeDinamico nome="bolt" />)

    expect(container.querySelector('.material-symbols-rounded')).toHaveTextContent('bolt')
    expect(container.querySelector('svg')).toBeNull()
  })

  it('ícone fora do pacote mostra o alternativo e troca pelo SVG quando chega', async () => {
    server.use(
      http.get('https://api.iconify.design/material-symbols.json', () =>
        HttpResponse.json({
          width: 24,
          icons: { 'ico-a-rounded': { body: '<path fill="currentColor" d="M1 1h4v4z"/>' } },
        }),
      ),
    )
    const { container } = renderizar(<IconeDinamico nome="ico_a" alternativo="category" />)

    expect(container.querySelector('.material-symbols-rounded')).toHaveTextContent('category')
    await waitFor(() =>
      expect(container.querySelector('svg path')).toHaveAttribute('d', 'M1 1h4v4z'),
    )
    expect(screen.queryByText('category')).not.toBeInTheDocument()
  })

  it('se o Iconify falhar, o alternativo fica', async () => {
    server.use(
      http.get(
        'https://api.iconify.design/material-symbols.json',
        () => new HttpResponse(null, { status: 500 }),
      ),
    )
    const { container } = renderizar(<IconeDinamico nome="ico_a" alternativo="category" />)

    await waitFor(() =>
      expect(container.querySelector('.material-symbols-rounded')).toBeInTheDocument(),
    )
    expect(container.querySelector('svg')).toBeNull()
  })
})
