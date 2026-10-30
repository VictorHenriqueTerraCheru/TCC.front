import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'

import { LoginToContinue } from '@/features/auth'
import { issuesInArea } from '@/infrastructure/mocks/fixtures/problemas'
import { createDetails, AUTHOR_ID } from '@/infrastructure/mocks/fixtures/detalhes'
import { ruleError } from '@/infrastructure/mocks/handlers/comum'
import { route } from '@/infrastructure/mocks/rota'
import { server } from '@/infrastructure/mocks/server'
import { setWidth, renderRoutes } from '@/test/render'
import { loginAsCitizen, logout } from '@/test/sessao'

import { IssueDetail } from './detalhe-problema'

const ACTIVE = issuesInArea[0]!.id
const POSSIBLY = issuesInArea[4]!.id
const NEW = issuesInArea[10]!.id

function renderWithProviders(id: string) {
  setWidth(390)
  return renderRoutes([
    {
      path: '/',
      element: (
        <>
          <IssueDetail id={id} />
          <LoginToContinue />
        </>
      ),
    },
  ])
}

function spyOnVotes() {
  const votes: string[] = []
  server.events.on('request:start', ({ request }) => {
    if (request.method !== 'PUT' || !new URL(request.url).pathname.endsWith('/vote')) return
    const position = votes.push('?') - 1
    void request
      .clone()
      .json()
      .then(({ value }: { value: string }) => (votes[position] = value))
  })
  return votes
}

const card = () => screen.getByRole('heading', { name: /Ainda está lá\?/ }).closest('section')!

describe('IssueDetail', () => {
  afterEach(() => {
    logout()
    server.events.removeAllListeners()
  })

  it('Active: trust and the single question "Ainda está lá?" (screen 3)', async () => {
    renderWithProviders(ACTIVE)

    expect(await screen.findByRole('heading', { name: 'Buraco na via' })).toBeInTheDocument()
    expect(await screen.findByText('Via pública')).toBeInTheDocument()
    expect(screen.getByText('Confiança alta')).toBeInTheDocument()
    expect(screen.getByText('82 / 100')).toBeInTheDocument()
    expect(screen.getByText(/Calculada com 16 votos/)).toBeInTheDocument()
    expect(screen.getByText('Ativa')).toBeInTheDocument()
    expect(within(card()).getByText('15')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sim, está lá' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Não está lá' })).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Confirmações de existência' }),
    ).not.toBeInTheDocument()
  })

  it('New: under evaluation with a segmented bar and the same question (screen 22)', async () => {
    renderWithProviders(NEW)

    expect(await screen.findByRole('heading', { name: 'Fio caído' })).toBeInTheDocument()
    expect(screen.getByText('2 de 5 votos')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Ainda está lá\?/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Não está lá' })).toBeInTheDocument()
    expect(screen.queryByText('Confiança alta')).not.toBeInTheDocument()
  })

  it('Possibly resolved: "Ainda está lá?" highlighted (screen 23)', async () => {
    renderWithProviders(POSSIBLY)

    expect(await screen.findByRole('heading', { name: 'Ainda está lá?' })).toBeInTheDocument()
    expect(
      screen.getByText(/7 pessoas disseram que não está mais lá nas últimas 24 h/),
    ).toBeInTheDocument()
    expect(screen.getByText('Possivelmente resolvida')).toBeInTheDocument()
    expect(screen.getByText('Confiança média')).toBeInTheDocument()
    expect(screen.getByText('58 / 100')).toBeInTheDocument()
  })

  it('Resolved (saved link): read only, without vote buttons', async () => {
    const detail = createDetails().get(ACTIVE)!
    server.use(
      http.get(route('/issues/:id'), () =>
        HttpResponse.json({ ...detail, status: 'resolved', trustScore: null, band: null }),
      ),
    )
    renderWithProviders(ACTIVE)

    expect(await screen.findByText(/confirmou que este problema foi resolvido/)).toBeInTheDocument()
    expect(screen.getByText('Resolvida')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sim, está lá' })).not.toBeInTheDocument()
  })

  it('while a vote is in progress, the other buttons are disabled', async () => {
    loginAsCitizen()
    server.use(
      http.put(route('/issues/:id/vote'), async () => {
        await delay('infinite')
      }),
    )
    renderWithProviders(ACTIVE)

    await userEvent.click(await screen.findByRole('button', { name: 'Sim, está lá' }))
    expect(screen.getByRole('button', { name: 'Não está lá' })).toBeDisabled()
  })

  it('open (expanded sheet or desktop), only the full card asks "Ainda está lá?"', async () => {
    loginAsCitizen()
    renderWithProviders(ACTIVE)

    expect(await screen.findByRole('button', { name: 'Sim, está lá' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Voto rápido/ })).not.toBeInTheDocument()
  })

  it('isAuthor: no vote buttons, with the hint on the card', async () => {
    loginAsCitizen()
    renderWithProviders(AUTHOR_ID)

    expect(await screen.findByText('Você registrou este problema')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sim, está lá' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Voto rápido/ })).not.toBeInTheDocument()
  })

  it('logged in, the vote goes in a single PUT, updates immediately and stays marked', async () => {
    loginAsCitizen()
    const votes = spyOnVotes()
    const user = userEvent.setup()
    renderWithProviders(ACTIVE)

    await user.click(await screen.findByRole('button', { name: 'Sim, está lá' }))

    expect(screen.getByRole('button', { name: 'Sim, está lá' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(within(card()).getByText('16')).toBeInTheDocument()
    await waitFor(() => expect(votes).toEqual(['yes']))
    expect(screen.getByText(/Calculada com 17 votos/)).toBeInTheDocument()
  })

  it('changing the answer replaces the vote', async () => {
    loginAsCitizen()
    const votes = spyOnVotes()
    const user = userEvent.setup()
    renderWithProviders(ACTIVE)

    await user.click(await screen.findByRole('button', { name: 'Sim, está lá' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Não está lá' })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: 'Não está lá' }))

    await waitFor(() => expect(votes).toEqual(['yes', 'no']))
    expect(screen.getByRole('button', { name: 'Não está lá' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(within(card()).getByText('2')).toBeInTheDocument()
  })

  it('rule error undoes the optimistic vote and shows the message', async () => {
    loginAsCitizen()
    server.use(
      http.put(route('/issues/:id/vote'), () =>
        ruleError(422, 'issue-resolved', 'Problema resolvido.'),
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(ACTIVE)

    await user.click(await screen.findByRole('button', { name: 'Não está lá' }))

    expect(await screen.findAllByRole('alert')).not.toHaveLength(0)
    expect(screen.getAllByRole('alert')[0]).toHaveTextContent('Este problema já foi resolvido.')
    expect(screen.getByRole('button', { name: 'Não está lá' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(within(card()).getByText('1')).toBeInTheDocument()
  })

  it('guest who tries to vote sees "Entre para votar" (screen 27)', async () => {
    const user = userEvent.setup()
    renderWithProviders(ACTIVE)

    await user.click(await screen.findByRole('button', { name: 'Sim, está lá' }))

    expect(await screen.findByRole('heading', { name: 'Entre para votar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Já tenho conta' })).toBeInTheDocument()
  })
})
