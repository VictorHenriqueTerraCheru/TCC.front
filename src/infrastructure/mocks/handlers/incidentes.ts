import { http, HttpResponse } from 'msw'

import type { Schema } from '../../api'
import { banco, metrosEntre } from '../banco'
import { grupoDasCelulas } from '../fixtures/problemas'
import { rota } from '../rota'
import { erroDeRegra, lista, noRetangulo, retanguloDaUrl } from './comum'

/** GET /incidentes/area: contagens num raio de 400 m (roubos vêm das células do mock). */
function resumoDaArea(ponto: { lat: number; lng: number }) {
  const roubos = banco
    .calor()
    .filter((c) => metrosEntre(ponto, c) <= 400)
    .reduce((soma, c) => soma + c.quantidade, 0)
  const acidentes = Math.floor(roubos / 4)
  const total = roubos + acidentes
  return {
    raioMetros: 400,
    atualizadoEm: new Date().toISOString(),
    nivel: total >= 10 ? 'alta' : total >= 4 ? 'media' : 'baixa',
    contagens: [
      { categoriaId: 7, nome: 'Roubo', dias7: roubos, dias30: roubos * 3 + 5 },
      { categoriaId: 8, nome: 'Acidente de trânsito', dias7: acidentes, dias30: acidentes * 3 + 2 },
    ],
  }
}

export const incidentesHandlers = [
  http.get(rota('/incidentes/calor'), ({ request }) => {
    const url = new URL(request.url)
    const retangulo = retanguloDaUrl(url)
    if (!retangulo) return HttpResponse.json({ title: 'Retângulo inválido.' }, { status: 400 })

    const grupos = lista(url, 'grupos')
    if (grupos.length && !grupos.includes(grupoDasCelulas)) return HttpResponse.json([])
    return HttpResponse.json(banco.calor().filter((c) => noRetangulo(c, retangulo)))
  }),
  http.get(rota('/incidentes/area'), ({ request }) => {
    const url = new URL(request.url)
    return HttpResponse.json(
      resumoDaArea({
        lat: Number(url.searchParams.get('lat')),
        lng: Number(url.searchParams.get('lng')),
      }),
    )
  }),
  http.post<never, Schema<'RegistrarIncidenteRequest'>>(
    rota('/incidentes'),
    async ({ request }) => {
      if (!request.headers.has('Authorization')) return new HttpResponse(null, { status: 401 })
      const { categoriaId, lat, lng, ocorridoEm } = await request.json()
      const categoria = banco.categoriaPorId(categoriaId)
      if (!categoria?.ativa) {
        return HttpResponse.json(
          {
            title: 'Erro de validação.',
            status: 400,
            errors: { categoriaId: ['Categoria inexistente.'] },
          },
          { status: 400 },
        )
      }
      if (categoria.tipo !== 'incidente') {
        return erroDeRegra(422, 'categoria-nao-e-incidente', 'A categoria não é de incidente.')
      }
      const instante = Date.parse(ocorridoEm)
      if (instante > Date.now() || instante < Date.now() - 24 * 3_600_000) {
        return erroDeRegra(422, 'horario-fora-da-janela', 'Horário fora da janela de 24 h.')
      }
      // Simplificação do mock: toda célula conta como roubo no resumo da área.
      const ponto = banco.registrarIncidente(lat, lng)
      if (!ponto)
        return erroDeRegra(429, 'limite-diario-incidentes', 'Limite diário de incidentes.')
      return HttpResponse.json(resumoDaArea(ponto), { status: 201 })
    },
  ),
]
