import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { LoadError } from './load-error'

describe('LoadError', () => {
  it('shows the message as an alert and retries on click', async () => {
    const onRetry = vi.fn()
    render(<LoadError message="Não foi possível carregar a fila." onRetry={onRetry} />)

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar a fila.')
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('without onRetry there is no button', () => {
    render(<LoadError message="Este problema não está mais no mapa." />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
