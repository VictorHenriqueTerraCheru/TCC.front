import { http, HttpResponse } from 'msw'

import type { Schema } from '../../api'

import { banco } from '../banco'
import { categorias } from '../fixtures/categorias'
import { rota } from '../rota'
import { erroDeRegra, lista, noRetangulo, retanguloDaUrl } from './comum'

const autenticado = (request: Request) => request.headers.has('Authorization')

function votoHandler(tipo: 'existencia' | 'persistencia') {
  return http.put<{ id: string }, { valor: string }>(
    rota(`/problemas/:id/votos/${tipo}`),
    async ({ request, params }) => {
      if (!autenticado(request)) return new HttpResponse(null, { status: 401 })
      const detalhe = banco.detalhe(params.id, true)
      if (!detalhe) return new HttpResponse(null, { status: 404 })
      if (tipo === 'existencia' && detalhe.souAutor) {
        return erroDeRegra(422, 'autor-nao-vota-existencia', 'O autor não vota existência.')
      }
      if (tipo === 'persistencia' && detalhe.status === 'nova') {
        return erroDeRegra(422, 'persistencia-indisponivel-em-nova', 'Indisponível em avaliação.')
      }
      const { valor } = await request.json()
      banco.votar(params.id, tipo, valor)
      return HttpResponse.json(banco.detalhe(params.id, true))
    },
  )
}

export const problemasHandlers = [
  http.get(rota('/problemas'), ({ request }) => {
    const url = new URL(request.url)
    const retangulo = retanguloDaUrl(url)
    if (!retangulo) return HttpResponse.json({ title: 'Retângulo inválido.' }, { status: 400 })

    const grupos = lista(url, 'grupos')
    const status = lista(url, 'status')
    const grupoDe = (categoriaId: number) => categorias.find((c) => c.id === categoriaId)?.grupo

    return HttpResponse.json(
      banco
        .problemas()
        .filter(
          (p) =>
            noRetangulo(p, retangulo) &&
            (!grupos.length || grupos.includes(grupoDe(p.categoriaId) ?? '')) &&
            (!status.length || status.includes(p.status)),
        ),
    )
  }),
  http.get(rota('/problemas/duplicatas'), ({ request }) => {
    if (!autenticado(request)) return new HttpResponse(null, { status: 401 })
    const url = new URL(request.url)
    const ponto = {
      lat: Number(url.searchParams.get('lat')),
      lng: Number(url.searchParams.get('lng')),
    }
    return HttpResponse.json(banco.duplicatas(Number(url.searchParams.get('categoriaId')), ponto))
  }),
  http.post<never, Schema<'RegistrarProblemaRequest'>>(rota('/problemas'), async ({ request }) => {
    if (!autenticado(request)) return new HttpResponse(null, { status: 401 })
    const { categoriaId, lat, lng, descricao } = await request.json()
    const categoria = categorias.find((c) => c.id === categoriaId)
    if (!categoria) {
      return HttpResponse.json(
        {
          title: 'Erro de validação.',
          status: 400,
          errors: { categoriaId: ['Categoria inexistente.'] },
        },
        { status: 400 },
      )
    }
    if (categoria.tipo !== 'problema') {
      return erroDeRegra(422, 'categoria-nao-e-problema', 'A categoria não é de problema.')
    }
    const detalhe = banco.registrarProblema(categoriaId, lat, lng, descricao ?? null)
    return HttpResponse.json(detalhe, { status: 201 })
  }),
  http.get<{ id: string }>(rota('/problemas/:id'), ({ request, params }) => {
    const detalhe = banco.detalhe(params.id, autenticado(request))
    return detalhe ? HttpResponse.json(detalhe) : new HttpResponse(null, { status: 404 })
  }),
  votoHandler('existencia'),
  votoHandler('persistencia'),
]
