import { http, HttpResponse } from 'msw'

import type { Schema } from '../../api'
import { banco, metrosEntre } from '../banco'
import { rota } from '../rota'
import { erroDeRegra, lista, noRetangulo, retanguloDaUrl } from './comum'

function resumoDaArea(ponto: { lat: number; lng: number }) {
  const celulas = banco
    .calor()
    .filter((c) => metrosEntre(ponto, c) <= 400)
    .reduce((soma, c) => soma + c.count, 0)
  const novos = banco.incidentesNovos().filter((i) => metrosEntre(ponto, i) <= 400)
  const ativos = novos.filter((i) => banco.categoriaPorId(i.categoryId)?.active)
  const doNovo = (categoriaId: number) => ativos.filter((i) => i.categoryId === categoriaId).length

  const deExemplo = celulas - novos.length
  const roubos = deExemplo + doNovo(7)
  const acidentes = Math.floor(deExemplo / 4) + doNovo(8)
  const contagens = banco
    .categoriasAtivas()
    .filter((c) => c.type === 'incident')
    .map((c) => {
      const dias7 = c.id === 7 ? roubos : c.id === 8 ? acidentes : doNovo(c.id)
      const dias30 = c.id === 7 ? roubos * 3 + 5 : c.id === 8 ? acidentes * 3 + 2 : dias7
      return { categoryId: c.id, name: c.name, days7: dias7, days30: dias30 }
    })
  const total = contagens.reduce((soma, c) => soma + c.days7, 0)
  return {
    radiusMeters: 400,
    updatedAt: new Date().toISOString(),
    level: total >= 10 ? 'high' : total >= 4 ? 'medium' : 'low',
    counts: contagens,
  }
}

export const incidentesHandlers = [
  http.get(rota('/incidents/heatmap'), ({ request }) => {
    const url = new URL(request.url)
    const retangulo = retanguloDaUrl(url)
    if (!retangulo) return HttpResponse.json({ title: 'Retângulo inválido.' }, { status: 400 })

    const grupos = lista(url, 'groups')
    return HttpResponse.json(banco.calor(grupos).filter((c) => noRetangulo(c, retangulo)))
  }),
  http.get(rota('/incidents/area'), ({ request }) => {
    const url = new URL(request.url)
    return HttpResponse.json(
      resumoDaArea({
        lat: Number(url.searchParams.get('lat')),
        lng: Number(url.searchParams.get('lng')),
      }),
    )
  }),
  http.post<never, Schema<'CreateIncidentRequest'>>(rota('/incidents'), async ({ request }) => {
    if (!request.headers.has('Authorization')) return new HttpResponse(null, { status: 401 })
    const { categoryId: categoriaId, lat, lng, occurredAt: ocorridoEm } = await request.json()
    const categoria = banco.categoriaPorId(categoriaId)
    if (!categoria?.active) {
      return HttpResponse.json(
        {
          title: 'Erro de validação.',
          status: 400,
          errors: { categoryId: ['Categoria inexistente.'] },
        },
        { status: 400 },
      )
    }
    if (categoria.type !== 'incident') {
      return erroDeRegra(422, 'category-not-incident', 'A categoria não é de incidente.')
    }
    const instante = Date.parse(ocorridoEm)
    if (instante > Date.now() || instante < Date.now() - 24 * 3_600_000) {
      return erroDeRegra(422, 'time-outside-window', 'Horário fora da janela de 24 h.')
    }
    const ponto = banco.registrarIncidente(categoriaId, lat, lng)
    if (!ponto) return erroDeRegra(429, 'daily-incident-limit', 'Limite diário de incidentes.')
    return HttpResponse.json(resumoDaArea(ponto), { status: 201 })
  }),
]
