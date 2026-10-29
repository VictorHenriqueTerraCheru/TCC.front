import { http, HttpResponse } from 'msw'

import type { Schema } from '../../api'

import { banco, metrosEntre } from '../banco'
import { rota } from '../rota'
import { erroDeRegra, lista, noRetangulo, paginar, retanguloDaUrl } from './comum'

const autenticado = (request: Request) => request.headers.has('Authorization')

const votoHandler = http.put<{ id: string }, { value: Schema<'VoteAnswer'> }>(
  rota('/issues/:id/vote'),
  async ({ request, params }) => {
    if (!autenticado(request)) return new HttpResponse(null, { status: 401 })
    const detalhe = banco.detalhe(params.id, true)
    if (!detalhe) return new HttpResponse(null, { status: 404 })
    if (detalhe.status === 'resolved') {
      return erroDeRegra(422, 'issue-resolved', 'O problema já foi resolvido.')
    }
    if (detalhe.isAuthor) {
      return erroDeRegra(422, 'author-cannot-vote', 'Quem registrou o problema não vota nele.')
    }
    const { value: valor } = await request.json()
    banco.votar(params.id, valor)
    return HttpResponse.json(banco.detalhe(params.id, true))
  },
)

export const problemasHandlers = [
  http.get(rota('/issues'), ({ request }) => {
    const url = new URL(request.url)
    const retangulo = retanguloDaUrl(url)
    if (!retangulo) return HttpResponse.json({ title: 'Retângulo inválido.' }, { status: 400 })

    const grupos = lista(url, 'groups')
    const status = lista(url, 'status')
    const grupoDe = (categoriaId: number) => banco.categoriaPorId(categoriaId)?.group

    return HttpResponse.json(
      banco
        .problemas()
        .filter(
          (p) =>
            noRetangulo(p, retangulo) &&
            (!grupos.length || grupos.includes(grupoDe(p.categoryId) ?? '')) &&
            (!status.length || status.includes(p.status)),
        ),
    )
  }),
  http.get(rota('/issues/recent'), ({ request }) => {
    const url = new URL(request.url)
    const centro = {
      lat: Number(url.searchParams.get('lat')),
      lng: Number(url.searchParams.get('lng')),
    }
    const raioM = Number(url.searchParams.get('radiusKm') ?? 10) * 1000
    const grupos = lista(url, 'groups')
    const recentes = banco
      .problemas()
      .filter((p) => metrosEntre(centro, p) <= raioM)
      .map((p) => banco.detalhe(p.id, false)!)
      .filter((d) => !grupos.length || grupos.includes(d.category.group))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(
        ({
          id,
          category: categoria,
          address: endereco,
          createdAt: criadoEm,
          status,
          band: faixa,
        }) => ({
          id,
          category: categoria,
          address: endereco,
          createdAt: criadoEm,
          status,
          band: faixa,
        }),
      )
    return HttpResponse.json(paginar(recentes, url))
  }),
  http.get(rota('/issues/duplicates'), ({ request }) => {
    if (!autenticado(request)) return new HttpResponse(null, { status: 401 })
    const url = new URL(request.url)
    const ponto = {
      lat: Number(url.searchParams.get('lat')),
      lng: Number(url.searchParams.get('lng')),
    }
    return HttpResponse.json(banco.duplicatas(Number(url.searchParams.get('categoryId')), ponto))
  }),
  http.post<never, Schema<'CreateIssueRequest'>>(rota('/issues'), async ({ request }) => {
    if (!autenticado(request)) return new HttpResponse(null, { status: 401 })
    const { categoryId: categoriaId, lat, lng, description: descricao } = await request.json()
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
    if (categoria.type !== 'issue') {
      return erroDeRegra(422, 'category-not-issue', 'A categoria não é de problema.')
    }
    const detalhe = banco.registrarProblema(categoriaId, lat, lng, descricao ?? null)
    return HttpResponse.json(detalhe, { status: 201 })
  }),
  http.get<{ id: string }>(rota('/issues/:id'), ({ request, params }) => {
    const detalhe = banco.detalhe(params.id, autenticado(request))
    return detalhe ? HttpResponse.json(detalhe) : new HttpResponse(null, { status: 404 })
  }),
  votoHandler,
]
