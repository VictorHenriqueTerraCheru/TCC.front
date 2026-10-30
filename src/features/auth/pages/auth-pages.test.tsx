import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { setWidth, renderRoutes } from '@/test/render'

import { routes } from '@/app/router'

function openAt(path: string) {
  setWidth(390)
  return renderRoutes(routes, path)
}

describe('login and sign up', () => {
  it('login validates the fields before submitting', async () => {
    const user = userEvent.setup()
    openAt('/login')

    await user.click(await screen.findByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Informe seu e-mail.')).toBeInTheDocument()
    expect(screen.getByText('Informe sua senha.')).toBeInTheDocument()
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('aria-invalid', 'true')
  })

  it('wrong password shows "E-mail ou senha inválidos."', async () => {
    const user = userEvent.setup()
    openAt('/login')

    await user.type(await screen.findByLabelText('E-mail'), 'cidadao1@tcc.local')
    await user.type(screen.getByLabelText('Senha'), 'wrong123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha inválidos.')
  })

  it('the eye shows and hides the password', async () => {
    const user = userEvent.setup()
    openAt('/login')

    const password = await screen.findByLabelText('Senha')
    expect(password).toHaveAttribute('type', 'password')
    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }))
    expect(password).toHaveAttribute('type', 'text')
  })

  it('sign up with an existing e-mail marks the field (409 email-already-registered)', async () => {
    const user = userEvent.setup()
    openAt('/cadastro')

    await user.type(await screen.findByLabelText('Nome'), 'Ana')
    await user.type(screen.getByLabelText('E-mail'), 'cidadao1@tcc.local')
    await user.type(screen.getByLabelText('Senha'), '12345678')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(await screen.findByText('Já existe uma conta com este e-mail.')).toBeInTheDocument()
  })

  it('sign up requires accepting the terms', async () => {
    const user = userEvent.setup()
    openAt('/cadastro')

    await user.type(await screen.findByLabelText('Nome'), 'Ana')
    await user.type(screen.getByLabelText('E-mail'), 'nova@x.com')
    await user.type(screen.getByLabelText('Senha'), '12345678')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(await screen.findByText('Aceite os termos para criar a conta.')).toBeInTheDocument()
  })
})
