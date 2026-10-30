import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { ResponsivePanel } from '@/common/components/painel-responsivo'
import { PanelContext } from '@/common/hooks/use-painel-responsivo'
import { LoginToContinue } from '@/features/auth'
import { createDetails } from '@/infrastructure/mocks/fixtures/detalhes'
import { issuesInArea } from '@/infrastructure/mocks/fixtures/problemas'
import { route } from '@/infrastructure/mocks/rota'
import { server } from '@/infrastructure/mocks/server'
import { setWidth, renderRoutes } from '@/test/render'
import { loginAsCitizen, logout } from '@/test/sessao'

import type { IssueDetail } from '../../models/problema'
import { SUMMARY_HEIGHT, AlertSummary } from './resumo-alerta'

const ACTIVE = createDetails().get(issuesInArea[0]!.id)!
const NEW = createDetails().get(issuesInArea[10]!.id)!

function renderWithProviders(issue: IssueDetail, { collapsed = true } = {}) {
  setWidth(390)
  return renderRoutes([
    {
      path: '/',
      element: (
        <PanelContext.Provider value={{ collapsed, expand: () => {}, measureSummary: () => {} }}>
          <AlertSummary issue={issue} />
          <LoginToContinue />
        </PanelContext.Provider>
      ),
    },
  ])
}

function spyOnVotes() {
  const votes: unknown[] = []
  server.use(
    http.put(route('/issues/:id/vote'), async ({ request }) => {
      votes.push(await request.json())
      return new HttpResponse(null, { status: 204 })
    }),
  )
  return votes
}

describe('AlertSummary', () => {
  afterEach(logout)

  it('shows category, address and confirmations', () => {
    renderWithProviders(ACTIVE)

    expect(screen.getByRole('heading', { name: ACTIVE.category.name })).toBeInTheDocument()
    expect(screen.getByText(new RegExp(ACTIVE.address))).toBeInTheDocument()
    expect(screen.getByText(`${ACTIVE.votes.yes} confirmaram`)).toBeInTheDocument()
  })

  it.each([
    ['new', NEW],
    ['active', ACTIVE],
  ])('%s: "Ainda está lá?" with a single vote', async (_status, issue) => {
    loginAsCitizen()
    const votes = spyOnVotes()
    renderWithProviders(issue)

    expect(screen.getByText('Ainda está lá?')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Voto rápido: Não está lá' }))

    expect(votes).toEqual([expect.objectContaining({ value: 'no' })])
  })

  it('open (expanded sheet or desktop), without thumbs: the full card already asks', () => {
    loginAsCitizen()
    renderWithProviders(ACTIVE, { collapsed: false })

    expect(screen.queryByText('Ainda está lá?')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Voto rápido/ })).not.toBeInTheDocument()
  })

  it('author does not see the thumbs', () => {
    renderWithProviders({ ...ACTIVE, isAuthor: true })

    expect(screen.queryByRole('button', { name: /^Voto rápido/ })).not.toBeInTheDocument()
  })

  it('resolved has no buttons', () => {
    renderWithProviders({ ...ACTIVE, status: 'resolved' })

    expect(screen.queryByRole('button', { name: /^Voto rápido/ })).not.toBeInTheDocument()
  })

  it('guest tapping the thumb opens "Entre para votar"', async () => {
    renderWithProviders(ACTIVE)

    await userEvent.click(screen.getByRole('button', { name: 'Voto rápido: Sim, está lá' }))

    expect(await screen.findByRole('heading', { name: 'Entre para votar' })).toBeInTheDocument()
  })

  it('on mobile, tapping the card expands the sheet; the thumbs vote without expanding', async () => {
    loginAsCitizen()
    spyOnVotes()
    setWidth(390)
    renderRoutes([
      {
        path: '/',
        element: (
          <ResponsivePanel title="Detalhe" onClose={() => {}} summaryHeight={SUMMARY_HEIGHT}>
            <AlertSummary issue={ACTIVE} />
          </ResponsivePanel>
        ),
      },
    ])
    const stage = () =>
      screen.getByRole('heading', { name: ACTIVE.category.name }).closest('[data-estagio]')

    expect(stage()).toHaveAttribute('data-estagio', 'summary')
    await userEvent.click(screen.getByRole('button', { name: 'Voto rápido: Sim, está lá' }))
    expect(stage()).toHaveAttribute('data-estagio', 'summary')

    await userEvent.click(screen.getByRole('heading', { name: ACTIVE.category.name }))
    expect(stage()).toHaveAttribute('data-estagio', 'open')
    expect(screen.queryByRole('button', { name: /^Voto rápido/ })).not.toBeInTheDocument()
  })
})
