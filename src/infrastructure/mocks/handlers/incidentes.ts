import { http, HttpResponse } from 'msw'

import { calorIncidentes, grupoDasCelulas } from '../fixtures/problemas'
import { rota } from '../rota'
import { lista, noRetangulo, retanguloDaUrl } from './comum'

export const incidentesHandlers = [
  http.get(rota('/incidentes/calor'), ({ request }) => {
    const url = new URL(request.url)
    const retangulo = retanguloDaUrl(url)
    if (!retangulo) return HttpResponse.json({ title: 'Retângulo inválido.' }, { status: 400 })

    const grupos = lista(url, 'grupos')
    if (grupos.length && !grupos.includes(grupoDasCelulas)) return HttpResponse.json([])
    return HttpResponse.json(calorIncidentes.filter((c) => noRetangulo(c, retangulo)))
  }),
]
