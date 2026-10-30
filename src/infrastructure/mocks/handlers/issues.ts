import { http, HttpResponse } from 'msw'

import type { Schema } from '../../api'

import { database, metersBetween } from '../database'
import { route } from '../route'
import { ruleError, list, inBounds, paginate, boundsFromUrl } from './common'

const authenticated = (request: Request) => request.headers.has('Authorization')

const voteHandler = http.put<{ id: string }, { value: Schema<'VoteAnswer'> }>(
  route('/issues/:id/vote'),
  async ({ request, params }) => {
    if (!authenticated(request)) return new HttpResponse(null, { status: 401 })
    const detail = database.detail(params.id, true)
    if (!detail) return new HttpResponse(null, { status: 404 })
    if (detail.status === 'resolved') {
      return ruleError(422, 'issue-resolved', 'O problema já foi resolvido.')
    }
    if (detail.isAuthor) {
      return ruleError(422, 'author-cannot-vote', 'Quem registrou o problema não vota nele.')
    }
    const { value } = await request.json()
    database.vote(params.id, value)
    return HttpResponse.json(database.detail(params.id, true))
  },
)

export const issueHandlers = [
  http.get(route('/issues'), ({ request }) => {
    const url = new URL(request.url)
    const bounds = boundsFromUrl(url)
    if (!bounds) return HttpResponse.json({ title: 'Retângulo inválido.' }, { status: 400 })

    const groups = list(url, 'groups')
    const status = list(url, 'status')
    const groupOf = (categoryId: number) => database.categoryById(categoryId)?.group

    return HttpResponse.json(
      database
        .issues()
        .filter(
          (p) =>
            inBounds(p, bounds) &&
            (!groups.length || groups.includes(groupOf(p.categoryId) ?? '')) &&
            (!status.length || status.includes(p.status)),
        ),
    )
  }),
  http.get(route('/issues/recent'), ({ request }) => {
    const url = new URL(request.url)
    const center = {
      lat: Number(url.searchParams.get('lat')),
      lng: Number(url.searchParams.get('lng')),
    }
    const radiusM = Number(url.searchParams.get('radiusKm') ?? 10) * 1000
    const groups = list(url, 'groups')
    const recent = database
      .issues()
      .filter((p) => metersBetween(center, p) <= radiusM)
      .map((p) => database.detail(p.id, false)!)
      .filter((d) => !groups.length || groups.includes(d.category.group))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(({ id, category, address, createdAt, status, band }) => ({
        id,
        category,
        address,
        createdAt,
        status,
        band,
      }))
    return HttpResponse.json(paginate(recent, url))
  }),
  http.get(route('/issues/duplicates'), ({ request }) => {
    if (!authenticated(request)) return new HttpResponse(null, { status: 401 })
    const url = new URL(request.url)
    const point = {
      lat: Number(url.searchParams.get('lat')),
      lng: Number(url.searchParams.get('lng')),
    }
    return HttpResponse.json(database.duplicates(Number(url.searchParams.get('categoryId')), point))
  }),
  http.post<never, Schema<'CreateIssueRequest'>>(route('/issues'), async ({ request }) => {
    if (!authenticated(request)) return new HttpResponse(null, { status: 401 })
    const { categoryId, lat, lng, description } = await request.json()
    const category = database.categoryById(categoryId)
    if (!category?.active) {
      return HttpResponse.json(
        {
          title: 'Erro de validação.',
          status: 400,
          errors: { categoryId: ['Categoria inexistente.'] },
        },
        { status: 400 },
      )
    }
    if (category.type !== 'issue') {
      return ruleError(422, 'category-not-issue', 'A categoria não é de problema.')
    }
    const detail = database.reportIssue(categoryId, lat, lng, description ?? null)
    return HttpResponse.json(detail, { status: 201 })
  }),
  http.get<{ id: string }>(route('/issues/:id'), ({ request, params }) => {
    const detail = database.detail(params.id, authenticated(request))
    return detail ? HttpResponse.json(detail) : new HttpResponse(null, { status: 404 })
  }),
  voteHandler,
]
