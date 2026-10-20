import { http, HttpResponse } from 'msw'

import type { Schema } from '../../api'

import { banco, metrosEntre } from '../banco'
import { rota } from '../rota'
import { erroDeRegra, lista, noRetangulo, paginar, retanguloDaUrl } from './comum'

const autenticado = (request: Request) => request.headers.has('Authorization')

const votoHandler = http.put<{ id: string }, { valor: Schema<'ValorVotoContrato'> }>(
  rota('/problemas/:id/voto'),
  async ({ request, params }) => {
    if (!autenticado(request)) return new HttpResponse(null, { status: 401 })
    const detalhe = banco.detalhe(params.id, true)
    if (!detalhe) return new HttpResponse(null, { status: 404 })
    if (detalhe.status === 'resolvida') {
      return erroDeRegra(422, 'problema-resolvido', 'O problema já foi resolvido.')
    }
    if (detalhe.souAutor) {
      return erroDeRegra(422, 'autor-nao-vota', 'Quem registrou o problema não vota nele.')
    }
    const { valor } = await request.json()
    banco.votar(params.id, valor)
    return HttpResponse.json(banco.detalhe(params.id, true))
  },
)

export const problemasHandlers = [
  http.get(rota('/problemas'), ({ request }) => {
    const url = new URL(request.url)
    const retangulo = retanguloDaUrl(url)
    if (!retangulo) return HttpResponse.json({ title: 'Retângulo inválido.' }, { status: 400 })

    const grupos = lista(url, 'grupos')
    const status = lista(url, 'status')
    const grupoDe = (categoriaId: number) => banco.categoriaPorId(categoriaId)?.grupo

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
  http.get(rota('/problemas/recentes'), ({ request }) => {
    const url = new URL(request.url)
    const centro = {
      lat: Number(url.searchParams.get('lat')),
      lng: Number(url.searchParams.get('lng')),
    }
    const raioM = Number(url.searchParams.get('raioKm') ?? 10) * 1000
    const grupos = lista(url, 'grupos')
    const recentes = banco
      .problemas()
      .filter((p) => metrosEntre(centro, p) <= raioM)
      .map((p) => banco.detalhe(p.id, false)!)
      .filter((d) => !grupos.length || grupos.includes(d.categoria.grupo))
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
      .map(({ id, categoria, endereco, criadoEm, status, faixa }) => ({
        id,
        categoria,
        endereco,
        criadoEm,
        status,
        faixa,
      }))
    return HttpResponse.json(paginar(recentes, url))
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
  votoHandler,
]
