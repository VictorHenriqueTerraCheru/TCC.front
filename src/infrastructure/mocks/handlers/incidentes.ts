import { http, HttpResponse } from 'msw'

import { calorIncidentes, grupoDasCelulas } from '../fixtures/problemas'
import { rota } from '../rota'
import { lista, noRetangulo, retanguloDaUrl } from './comum'

const metrosEntre = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const dLat = (b.lat - a.lat) * 111_320
  const dLng = (b.lng - a.lng) * 111_320 * Math.cos((a.lat * Math.PI) / 180)
  return Math.hypot(dLat, dLng)
}

export const incidentesHandlers = [
  http.get(rota('/incidentes/calor'), ({ request }) => {
    const url = new URL(request.url)
    const retangulo = retanguloDaUrl(url)
    if (!retangulo) return HttpResponse.json({ title: 'Retângulo inválido.' }, { status: 400 })

    const grupos = lista(url, 'grupos')
    if (grupos.length && !grupos.includes(grupoDasCelulas)) return HttpResponse.json([])
    return HttpResponse.json(calorIncidentes.filter((c) => noRetangulo(c, retangulo)))
  }),
  http.get(rota('/incidentes/area'), ({ request }) => {
    const url = new URL(request.url)
    const ponto = {
      lat: Number(url.searchParams.get('lat')),
      lng: Number(url.searchParams.get('lng')),
    }
    const roubos = calorIncidentes
      .filter((c) => metrosEntre(ponto, c) <= 400)
      .reduce((soma, c) => soma + c.quantidade, 0)
    const acidentes = Math.floor(roubos / 4)
    const total = roubos + acidentes
    return HttpResponse.json({
      raioMetros: 400,
      atualizadoEm: new Date().toISOString(),
      nivel: total >= 10 ? 'alta' : total >= 4 ? 'media' : 'baixa',
      contagens: [
        { categoriaId: 7, nome: 'Roubo', dias7: roubos, dias30: roubos * 3 + 5 },
        {
          categoriaId: 8,
          nome: 'Acidente de trânsito',
          dias7: acidentes,
          dias30: acidentes * 3 + 2,
        },
      ],
    })
  }),
]
