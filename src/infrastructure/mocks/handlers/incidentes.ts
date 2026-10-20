import { http, HttpResponse } from 'msw'

import type { Schema } from '../../api'
import { banco, metrosEntre } from '../banco'
import { rota } from '../rota'
import { erroDeRegra, lista, noRetangulo, retanguloDaUrl } from './comum'

/**
 * GET /incidentes/area: contagens num raio de 400 m. As células do mock valem como roubo (e um quarto
 * delas como acidente); o que foi registrado na sessão conta na categoria que o usuário escolheu.
 */
function resumoDaArea(ponto: { lat: number; lng: number }) {
  const celulas = banco
    .calor()
    .filter((c) => metrosEntre(ponto, c) <= 400)
    .reduce((soma, c) => soma + c.quantidade, 0)
  const novos = banco.incidentesNovos().filter((i) => metrosEntre(ponto, i) <= 400)
  // Como na API, categoria desativada some das contagens da área.
  const ativos = novos.filter((i) => banco.categoriaPorId(i.categoriaId)?.ativa)
  const doNovo = (categoriaId: number) => ativos.filter((i) => i.categoriaId === categoriaId).length

  // Todo registro da sessão também entrou em `celulas`: sai do bolo de roubos e volta na sua categoria,
  // e a estimativa de acidentes parte só das células de exemplo.
  const deExemplo = celulas - novos.length
  const roubos = deExemplo + doNovo(7)
  const acidentes = Math.floor(deExemplo / 4) + doNovo(8)
  const outras = [...new Set(ativos.map((i) => i.categoriaId))]
    .filter((id) => id !== 7 && id !== 8)
    .map((id) => ({
      categoriaId: id,
      nome: banco.categoriaPorId(id)?.nome ?? 'Incidente',
      dias7: doNovo(id),
      dias30: doNovo(id),
    }))
  const total = roubos + acidentes + outras.reduce((soma, c) => soma + c.dias7, 0)
  return {
    raioMetros: 400,
    atualizadoEm: new Date().toISOString(),
    nivel: total >= 10 ? 'alta' : total >= 4 ? 'media' : 'baixa',
    contagens: [
      { categoriaId: 7, nome: 'Roubo', dias7: roubos, dias30: roubos * 3 + 5 },
      { categoriaId: 8, nome: 'Acidente de trânsito', dias7: acidentes, dias30: acidentes * 3 + 2 },
      ...outras,
    ],
  }
}

export const incidentesHandlers = [
  http.get(rota('/incidentes/calor'), ({ request }) => {
    const url = new URL(request.url)
    const retangulo = retanguloDaUrl(url)
    if (!retangulo) return HttpResponse.json({ title: 'Retângulo inválido.' }, { status: 400 })

    const grupos = lista(url, 'grupos')
    return HttpResponse.json(banco.calor(grupos).filter((c) => noRetangulo(c, retangulo)))
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
      const ponto = banco.registrarIncidente(categoriaId, lat, lng)
      if (!ponto)
        return erroDeRegra(429, 'limite-diario-incidentes', 'Limite diário de incidentes.')
      return HttpResponse.json(resumoDaArea(ponto), { status: 201 })
    },
  ),
]
