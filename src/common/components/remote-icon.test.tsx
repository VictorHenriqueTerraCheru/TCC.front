import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { loadIcon, clearIconCache } from '@/common/lib/iconify'
import { server } from '@/infrastructure/mocks/server'
import { renderWithProviders } from '@/test/render'

import { DynamicIcon } from './remote-icon'

beforeEach(() => clearIconCache())

describe('DynamicIcon', () => {
  it('bundled icon uses the font, without network', () => {
    const { container } = renderWithProviders(<DynamicIcon name="bolt" />)

    expect(container.querySelector('.material-symbols-rounded')).toHaveTextContent('bolt')
    expect(container.querySelector('svg')).toBeNull()
  })

  it('icon outside the bundle shows the fallback and swaps to the SVG when it arrives', async () => {
    server.use(
      http.get('https://api.iconify.design/material-symbols.json', () =>
        HttpResponse.json({
          width: 24,
          icons: { 'ico-a-rounded': { body: '<path fill="currentColor" d="M1 1h4v4z"/>' } },
        }),
      ),
    )
    const { container } = renderWithProviders(<DynamicIcon name="ico_a" alternative="category" />)

    expect(container.querySelector('.material-symbols-rounded')).toHaveTextContent('category')
    await waitFor(() =>
      expect(container.querySelector('svg path')).toHaveAttribute('d', 'M1 1h4v4z'),
    )
    expect(screen.queryByText('category')).not.toBeInTheDocument()
  })

  it('if Iconify fails, the fallback stays', async () => {
    server.use(
      http.get(
        'https://api.iconify.design/material-symbols.json',
        () => new HttpResponse(null, { status: 500 }),
      ),
    )
    const { container } = renderWithProviders(<DynamicIcon name="ico_a" alternative="category" />)

    expect(await loadIcon('ico_a')).toBeNull()
    expect(container.querySelector('.material-symbols-rounded')).toHaveTextContent('category')
    expect(container.querySelector('svg')).toBeNull()
  })
})
