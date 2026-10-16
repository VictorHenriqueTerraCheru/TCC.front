import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { definirLargura, renderizarRotas } from '@/test/render'

import { rotas } from '@/app/router'

function abrir(caminho: string) {
  definirLargura(390)
  return renderizarRotas(rotas, caminho)
}

describe('login e cadastro', () => {
  it('login valida os campos antes de enviar', async () => {
    const usuario = userEvent.setup()
    abrir('/login')

    await usuario.click(await screen.findByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Informe seu e-mail.')).toBeInTheDocument()
    expect(screen.getByText('Informe sua senha.')).toBeInTheDocument()
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('aria-invalid', 'true')
  })

  it('senha errada mostra "E-mail ou senha inválidos."', async () => {
    const usuario = userEvent.setup()
    abrir('/login')

    await usuario.type(await screen.findByLabelText('E-mail'), 'cidadao1@tcc.local')
    await usuario.type(screen.getByLabelText('Senha'), 'errada123')
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha inválidos.')
  })

  it('o olho mostra e esconde a senha', async () => {
    const usuario = userEvent.setup()
    abrir('/login')

    const senha = await screen.findByLabelText('Senha')
    expect(senha).toHaveAttribute('type', 'password')
    await usuario.click(screen.getByRole('button', { name: 'Mostrar senha' }))
    expect(senha).toHaveAttribute('type', 'text')
  })

  it('cadastro com e-mail existente marca o campo (409 email-ja-cadastrado)', async () => {
    const usuario = userEvent.setup()
    abrir('/cadastro')

    await usuario.type(await screen.findByLabelText('Nome'), 'Ana')
    await usuario.type(screen.getByLabelText('E-mail'), 'cidadao1@tcc.local')
    await usuario.type(screen.getByLabelText('Senha'), '12345678')
    await usuario.click(screen.getByRole('checkbox'))
    await usuario.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(await screen.findByText('Já existe uma conta com este e-mail.')).toBeInTheDocument()
  })

  it('cadastro exige aceitar os termos', async () => {
    const usuario = userEvent.setup()
    abrir('/cadastro')

    await usuario.type(await screen.findByLabelText('Nome'), 'Ana')
    await usuario.type(screen.getByLabelText('E-mail'), 'nova@x.com')
    await usuario.type(screen.getByLabelText('Senha'), '12345678')
    await usuario.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(await screen.findByText('Aceite os termos para criar a conta.')).toBeInTheDocument()
  })
})
