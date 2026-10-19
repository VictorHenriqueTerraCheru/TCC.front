import type { Schema } from '../api'
import { categorias } from './fixtures/categorias'
import { criarDetalhes, ID_DO_AUTOR } from './fixtures/detalhes'
import { historicoInicial, verificacoesIniciais } from './fixtures/perfil'
import { calorIncidentes } from './fixtures/problemas'
import { usuariosIniciais } from './fixtures/usuarios'

type ValorVoto = Schema<'ValorVotoContrato'>
type Detalhe = Schema<'ObterDetalheProblemaResponse'>
type CelulaCalor = Schema<'ObterCalorIncidentesResponse'>
type Verificacao = Schema<'ListarVerificacoesItem'>
type Perfil = Schema<'Perfil'>

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
let votos = new Map<string, ValorVoto>()
let usuarios = [...usuariosIniciais]
let autoria = new Set([ID_DO_AUTOR])
let celulas = [...calorIncidentes]
let incidentesRegistrados = 0
let verificacoes = verificacoesIniciais()
let historico = historicoInicial()
let perfis = new Map<string, { perfil: Perfil; verificadoEm: string | null }>()

const iniciais = (nome: string) =>
  nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]!.toUpperCase())
    .join('')

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

  /** "Bearer mock-jwt-<id>" → usuário; outro token (testes) = cidadao1. */
  usuarioDoToken(request: Request) {
    const id = request.headers.get('Authorization')?.match(/mock-jwt-(.+)$/)?.[1] ?? 'u-cidadao1'
    const usuario =
      usuarios.find((u) => u.id === id) ?? usuarios.find((u) => u.id === 'u-cidadao1')!
    const atual = perfis.get(usuario.id)
    return {
      ...usuario,
      perfil: atual?.perfil ?? usuario.perfil,
      verificadoEm:
        atual?.verificadoEm ?? (usuario.perfil === 'cidadao' ? null : '2026-09-25T15:00:00Z'),
    }
  },
  renomear(id: string, nome: string) {
    usuarios = usuarios.map((u) => (u.id === id ? { ...u, nome } : u))
  },
  /** GET /me: perfil atual (do "banco"), não o do token (regra 14). */
  me(request: Request): Schema<'ObterMeResponse'> {
    const usuario = banco.usuarioDoToken(request)
    const ultima = verificacoes.find((v) => v.usuario.id === usuario.id)
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      criadoEm: '2026-03-02T12:00:00Z',
      verificadoEm: usuario.verificadoEm,
      totalRegistros: historico.filter((h) => h.tipo.startsWith('registro')).length,
      totalVotos: historico.filter((h) => h.tipo.startsWith('voto')).length,
      verificacao: ultima
        ? {
            status: ultima.status,
            tipoVinculo: ultima.tipoVinculo,
            motivoRecusa: ultima.motivoRecusa,
            criadaEm: ultima.criadaEm,
          }
        : null,
    }
  },
  historico(filtro: string) {
    if (filtro === 'registros') return historico.filter((h) => h.tipo.startsWith('registro'))
    if (filtro === 'votos') return historico.filter((h) => h.tipo.startsWith('voto'))
    return historico
  },

  verificacoes(status: string | null) {
    const lista = verificacoes.filter((v) => !status || v.status === status)
    // Pendentes: mais antiga primeiro (fila); as demais: mais nova primeiro (docs/API.md).
    return [...lista].sort((a, b) =>
      status === 'pendente'
        ? a.criadaEm.localeCompare(b.criadaEm)
        : b.criadaEm.localeCompare(a.criadaEm),
    )
  },
  solicitarVerificacao(
    request: Request,
    tipoVinculo: Verificacao['tipoVinculo'],
    justificativa: string,
  ) {
    const usuario = banco.usuarioDoToken(request)
    if (usuario.perfil !== 'cidadao') return 'ja-verificado' as const
    if (verificacoes.some((v) => v.usuario.id === usuario.id && v.status === 'pendente')) {
      return 'verificacao-pendente-existente' as const
    }
    const nova: Verificacao = {
      id: `v-${verificacoes.length + 1}`,
      usuario: { id: usuario.id, nome: usuario.nome, iniciais: iniciais(usuario.nome) },
      tipoVinculo,
      justificativa,
      status: 'pendente',
      criadaEm: new Date().toISOString(),
      motivoRecusa: null,
    }
    verificacoes = [nova, ...verificacoes]
    return nova
  },
  analisarVerificacao(id: string, decisao: 'aprovada' | 'recusada', motivo: string | null) {
    const verificacao = verificacoes.find((v) => v.id === id)
    if (!verificacao) return 'nao-encontrada' as const
    if (verificacao.status !== 'pendente') return 'verificacao-ja-analisada' as const
    verificacoes = verificacoes.map((v) =>
      v.id === id ? { ...v, status: decisao, motivoRecusa: motivo } : v,
    )
    if (decisao === 'aprovada') {
      perfis.set(verificacao.usuario.id, {
        perfil: 'cidadaoVerificado',
        verificadoEm: new Date().toISOString(),
      })
    }
    return 'ok' as const
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
      meuVoto: autenticado ? (votos.get(id) ?? null) : null,
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
        confirmacoes: d.votos.sim,
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
      votos: { sim: 0, nao: 0, naoUltimas24h: 0 },
      meuVoto: null,
      souAutor: false,
    }
    detalhes.set(detalhe.id, detalhe)
    autoria.add(detalhe.id)
    return banco.detalhe(detalhe.id, true)!
  },
  votar(id: string, valor: ValorVoto) {
    const detalhe = detalhes.get(id)!
    const anterior = votos.get(id) ?? null
    if (anterior === valor) return
    const contagem = { ...detalhe.votos }
    if (anterior === 'sim') contagem.sim--
    if (anterior === 'nao') {
      contagem.nao--
      contagem.naoUltimas24h--
    }
    if (valor === 'sim') contagem.sim++
    else {
      contagem.nao++
      contagem.naoUltimas24h++
    }
    detalhes.set(id, { ...detalhe, votos: contagem })
    votos.set(id, valor)
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
    verificacoes = verificacoesIniciais()
    historico = historicoInicial()
    perfis = new Map()
  },
}
