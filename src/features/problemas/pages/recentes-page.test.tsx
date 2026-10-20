import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { definirLargura, renderizarRotas } from '@/test/render'

import { RecentesPage } from './recentes-page'

describe('RecentesPage', () => {
  it('chip de grupo liga e desliga o filtro', async () => {
    definirLargura(390)
    const usuario = userEvent.setup()
    renderizarRotas([{ path: '/recentes', element: <RecentesPage /> }], '/recentes')

    const chip = await screen.findByRole('button', { name: /Via pública/ })
    expect(chip).toHaveAttribute('aria-pressed', 'false')

    await usuario.click(chip)
    expect(screen.getByRole('button', { name: /Via pública/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await usuario.click(screen.getByRole('button', { name: /Via pública/ }))
    expect(screen.getByRole('button', { name: /Via pública/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })
})
