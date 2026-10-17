import type { Schema } from '../api'
import { categorias } from './fixtures/categorias'
import { criarDetalhes, ID_DO_AUTOR } from './fixtures/detalhes'
import { calorIncidentes } from './fixtures/problemas'
import { usuariosIniciais } from './fixtures/usuarios'

type MeusVotos = Schema<'ObterDetalheProblemaMeusVotos'>
type Detalhe = Schema<'ObterDetalheProblemaResponse'>
type CelulaCalor = Schema<'ObterCalorIncidentesResponse'>

/** Limite de incidentes por conta em 24 h (docs/API.md, 429 limite-diario-incidentes). */
const LIMITE_INCIDENTES = 10

/** Distância aproximada em metros (bom o bastante para o mock). */
export function metrosEntre(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const dLat = (b.lat - a.lat) * 111_320
  const dLng = (b.lng - a.lng) * 111_320 * Math.cos((a.lat * Math.PI) / 180)
  return Math.hypot(dLat, dLng)
}

/** Estado em memória da API falsa (usuário logado no mock). Reiniciado a cada teste. */
let detalhes = criarDetalhes()
let votos = new Map<string, MeusVotos>()
let usuarios = [...usuariosIniciais]
let autoria = new Set([ID_DO_AUTOR])
let celulas = [...calorIncidentes]
let incidentesRegistrados = 0

export const banco = {
  usuarioPorEmail(email: string) {
    return usuarios.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
  },
  cadastrar(nome: string, email: string, senha: string) {
    const usuario = {
      id: `u-${usuarios.length + 1}`,
      nome,
      email,
      senha,
      perfil: 'cidadao' as const,
    }
    usuarios = [...usuarios, usuario]
    return usuario
  },

  /** Marcadores (GET /problemas): nunca devolve resolvida. */
  problemas(): Schema<'ListarProblemasNaAreaResponse'>[] {
    return [...detalhes.values()]
      .filter((d) => d.status !== 'resolvida')
      .map(({ id, categoria, lat, lng, status, confianca, faixa }) => ({
        id,
        categoriaId: categoria.id,
        lat,
        lng,
        status,
        confianca,
        faixa,
      }))
  },
  detalhe(id: string, autenticado: boolean): Detalhe | null {
    const detalhe = detalhes.get(id)
    if (!detalhe) return null
    return {
      ...detalhe,
      meusVotos: autenticado ? (votos.get(id) ?? { existencia: null, persistencia: null }) : null,
      souAutor: autenticado && autoria.has(id),
    }
  },
  /** GET /problemas/duplicatas: mesma categoria, não resolvidos, até 50 m, por distância. */
  duplicatas(categoriaId: number, ponto: { lat: number; lng: number }) {
    return [...detalhes.values()]
      .filter((d) => d.categoria.id === categoriaId && d.status !== 'resolvida')
      .map((d) => ({ d, distancia: metrosEntre(ponto, d) }))
      .filter(({ distancia }) => distancia <= 50)
      .sort((a, b) => a.distancia - b.distancia)
      .slice(0, 20)
      .map(({ d, distancia }) => ({
        id: d.id,
        categoria: d.categoria,
        endereco: d.endereco,
        criadoEm: d.criadoEm,
        distanciaMetros: Math.round(distancia),
        faixa: d.faixa,
        confirmacoes: d.existencia.confirmacoes,
      }))
  },
  registrarProblema(categoriaId: number, lat: number, lng: number, descricao: string | null) {
    const { tipo: _tipo, ...categoria } = categorias.find((c) => c.id === categoriaId)!
    const agora = new Date()
    const detalhe: Detalhe = {
      id: crypto.randomUUID(),
      categoria,
      descricao,
      lat,
      lng,
      endereco: 'Rua Voluntários da Pátria, 170 — Botafogo',
      criadoEm: agora.toISOString(),
      status: 'nova',
      confianca: null,
      faixa: null,
      avaliacao: {
        votantes: 0,
        necessarios: 5,
        encerraEm: new Date(agora.getTime() + 72 * 3_600_000).toISOString(),
      },
      existencia: { confirmacoes: 0, naoVi: 0 },
      persistencia: { continua: 0, resolvido: 0, resolvidoUltimas24h: 0 },
      meusVotos: null,
      souAutor: false,
    }
    detalhes.set(detalhe.id, detalhe)
    autoria.add(detalhe.id)
    return banco.detalhe(detalhe.id, true)!
  },
  votar(id: string, tipo: 'existencia' | 'persistencia', valor: string) {
    const detalhe = detalhes.get(id)!
    const meus = votos.get(id) ?? { existencia: null, persistencia: null }
    const anterior = meus[tipo]
    if (anterior !== valor) {
      const contagem =
        tipo === 'existencia' ? { ...detalhe.existencia } : { ...detalhe.persistencia }
      const balde = (v: string) => (v === 'confirma' ? 'confirmacoes' : v) as keyof typeof contagem
      if (anterior) (contagem[balde(anterior)] as number)--
      ;(contagem[balde(valor)] as number)++
      detalhes.set(id, { ...detalhe, [tipo]: contagem })
      votos.set(id, { ...meus, [tipo]: valor } as MeusVotos)
    }
  },

  calor(): CelulaCalor[] {
    return celulas
  },
  /** POST /incidentes: arredonda o ponto em 3 casas e soma na célula. null = limite diário. */
  registrarIncidente(lat: number, lng: number) {
    if (incidentesRegistrados >= LIMITE_INCIDENTES) return null
    incidentesRegistrados++
    const ponto = { lat: Math.round(lat * 1000) / 1000, lng: Math.round(lng * 1000) / 1000 }
    const existente = celulas.find((c) => c.lat === ponto.lat && c.lng === ponto.lng)
    celulas = existente
      ? celulas.map((c) => (c === existente ? { ...c, quantidade: c.quantidade + 1 } : c))
      : [...celulas, { ...ponto, quantidade: 1 }]
    return ponto
  },

  reiniciar() {
    detalhes = criarDetalhes()
    votos = new Map()
    usuarios = [...usuariosIniciais]
    autoria = new Set([ID_DO_AUTOR])
    celulas = [...calorIncidentes]
    incidentesRegistrados = 0
  },
}
