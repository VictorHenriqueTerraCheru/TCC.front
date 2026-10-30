import { http, HttpResponse } from 'msw'

import type { Schema } from '../../api'
import { database, metersBetween } from '../database'
import { route } from '../route'
import { ruleError, list, inBounds, boundsFromUrl } from './common'

function areaSummary(point: { lat: number; lng: number }) {
  const cells = database
    .heatmap()
    .filter((c) => metersBetween(point, c) <= 400)
    .reduce((sum, c) => sum + c.count, 0)
  const newEntries = database.newIncidents().filter((i) => metersBetween(point, i) <= 400)
  const activeItems = newEntries.filter((i) => database.categoryById(i.categoryId)?.active)
  const newCount = (categoryId: number) =>
    activeItems.filter((i) => i.categoryId === categoryId).length

  const sampleCount = cells - newEntries.length
  const robberies = sampleCount + newCount(7)
  const accidents = Math.floor(sampleCount / 4) + newCount(8)
  const counts = database
    .activeCategories()
    .filter((c) => c.type === 'incident')
    .map((c) => {
      const sevenDays = c.id === 7 ? robberies : c.id === 8 ? accidents : newCount(c.id)
      const thirtyDays = c.id === 7 ? robberies * 3 + 5 : c.id === 8 ? accidents * 3 + 2 : sevenDays
      return { categoryId: c.id, name: c.name, days7: sevenDays, days30: thirtyDays }
    })
  const total = counts.reduce((sum, c) => sum + c.days7, 0)
  return {
    radiusMeters: 400,
    updatedAt: new Date().toISOString(),
    level: total >= 10 ? 'high' : total >= 4 ? 'medium' : 'low',
    counts,
  }
}

export const incidentHandlers = [
  http.get(route('/incidents/heatmap'), ({ request }) => {
    const url = new URL(request.url)
    const bounds = boundsFromUrl(url)
    if (!bounds) return HttpResponse.json({ title: 'Retângulo inválido.' }, { status: 400 })

    const groups = list(url, 'groups')
    return HttpResponse.json(database.heatmap(groups).filter((c) => inBounds(c, bounds)))
  }),
  http.get(route('/incidents/area'), ({ request }) => {
    const url = new URL(request.url)
    return HttpResponse.json(
      areaSummary({
        lat: Number(url.searchParams.get('lat')),
        lng: Number(url.searchParams.get('lng')),
      }),
    )
  }),
  http.post<never, Schema<'CreateIncidentRequest'>>(route('/incidents'), async ({ request }) => {
    if (!request.headers.has('Authorization')) return new HttpResponse(null, { status: 401 })
    const { categoryId, lat, lng, occurredAt } = await request.json()
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
    if (category.type !== 'incident') {
      return ruleError(422, 'category-not-incident', 'A categoria não é de incidente.')
    }
    const instant = Date.parse(occurredAt)
    if (instant > Date.now() || instant < Date.now() - 24 * 3_600_000) {
      return ruleError(422, 'time-outside-window', 'Horário fora da janela de 24 h.')
    }
    const point = database.reportIncident(categoryId, lat, lng)
    if (!point) return ruleError(429, 'daily-incident-limit', 'Limite diário de incidentes.')
    return HttpResponse.json(areaSummary(point), { status: 201 })
  }),
]
