import { http, HttpResponse } from 'msw'

import { categorias } from '../fixtures/categorias'
import { problemasNaArea } from '../fixtures/problemas'
import { rota } from '../rota'
import { lista, noRetangulo, retanguloDaUrl } from './comum'

export const problemasHandlers = [
  http.get(rota('/problemas'), ({ request }) => {
    const url = new URL(request.url)
    const retangulo = retanguloDaUrl(url)
    if (!retangulo) return HttpResponse.json({ title: 'Retângulo inválido.' }, { status: 400 })

    const grupos = lista(url, 'grupos')
    const status = lista(url, 'status')
    const grupoDe = (categoriaId: number) => categorias.find((c) => c.id === categoriaId)?.grupo

    return HttpResponse.json(
      problemasNaArea.filter(
        (p) =>
          noRetangulo(p, retangulo) &&
          (!grupos.length || grupos.includes(grupoDe(p.categoriaId) ?? '')) &&
          (!status.length || status.includes(p.status)),
      ),
    )
  }),
]
