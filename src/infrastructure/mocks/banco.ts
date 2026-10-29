import type { Schema } from '../api'
import { categorias } from './fixtures/categorias'
import { criarDetalhes, ID_DO_AUTOR } from './fixtures/detalhes'
import { grupos as gruposIniciais } from './fixtures/grupos'
import { historicoInicial, verificacoesIniciais } from './fixtures/perfil'
import { calorIncidentes, grupoDasCelulas } from './fixtures/problemas'
import { usuariosIniciais } from './fixtures/usuarios'

type ValorVoto = Schema<'ValorVotoContrato'>
type Detalhe = Schema<'ObterDetalheProblemaResponse'>
type CelulaCalor = Schema<'ObterCalorIncidentesResponse'>
type Verificacao = Schema<'ListarVerificacoesItem'>
type Perfil = Schema<'Perfil'>
type Grupo = Schema<'GrupoResponse'>
type CategoriaAdmin = Schema<'CategoriaAdminResponse'>

const LIMITE_INCIDENTES = 10

export function metrosEntre(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const dLat = (b.lat - a.lat) * 111_320
  const dLng = (b.lng - a.lng) * 111_320 * Math.cos((a.lat * Math.PI) / 180)
  return Math.hypot(dLat, dLng)
}

let detalhes = criarDetalhes()
let votos = new Map<string, ValorVoto>()
let usuarios = [...usuariosIniciais]
let autoria = new Set([ID_DO_AUTOR])
let incidentesRegistrados = 0
let incidentesNovos: { categoriaId: number; lat: number; lng: number }[] = []
let verificacoes = verificacoesIniciais()
let historico = historicoInicial()
let perfis = new Map<string, { perfil: Perfil; verificadoEm: string | null }>()
let grupos: Grupo[] = [...gruposIniciais]
let categoriasAdmin: CategoriaAdmin[] = categorias.map((c) => ({ ...c, ativa: true }))

function chaveDe(rotulo: string) {
  const palavras = rotulo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
  const chave = palavras
    .map((p, i) => (i === 0 ? p.toLowerCase() : p[0]!.toUpperCase() + p.slice(1).toLowerCase()))
    .join('')
    .slice(0, 30)
  return /^[a-z]/i.test(chave) ? chave : `grupo${chave}`.slice(0, 30)
}

const mesmoRotulo = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

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
  usuariosAdmin(busca: string | null, perfil: string | null): Schema<'ListarUsuariosItem'>[] {
    const termo = busca?.trim().toLowerCase() ?? ''
    return usuarios
      .map((u, indice) => {
        const atual = perfis.get(u.id)
        const efetivo = atual?.perfil ?? u.perfil
        return {
          id: u.id,
          nome: u.nome,
          email: u.email,
          perfil: efetivo,
          criadoEm: new Date(Date.UTC(2026, 2, 2 + indice, 12)).toISOString(),
          verificadoEm:
            atual?.verificadoEm ?? (efetivo === 'cidadao' ? null : '2026-09-25T15:00:00Z'),
        }
      })
      .filter(
        (u) =>
          (!perfil || u.perfil.toLowerCase() === perfil.toLowerCase()) &&
          (termo === '' ||
            u.nome.toLowerCase().includes(termo) ||
            u.email.toLowerCase().includes(termo)),
      )
      .reverse()
  },
  alterarPerfilUsuario(adminId: string, id: string, perfil: Perfil) {
    if (id === adminId) return 'proprio-perfil' as const
    const usuario = usuarios.find((u) => u.id === id)
    if (!usuario) return 'nao-encontrado' as const
    const atual = perfis.get(id)
    const verificadoEm =
      perfil === 'cidadao'
        ? null
        : (atual?.verificadoEm ??
          (usuario.perfil === 'cidadao' ? null : '2026-09-25T15:00:00Z') ??
          null)
    perfis.set(id, {
      perfil,
      verificadoEm:
        perfil === 'cidadaoVerificado' ? (verificadoEm ?? new Date().toISOString()) : verificadoEm,
    })
    return 'ok' as const
  },
  renomear(id: string, nome: string) {
    usuarios = usuarios.map((u) => (u.id === id ? { ...u, nome } : u))
  },
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
    const { tipo: _tipo, ativa: _ativa, ...categoria } = banco.categoriaPorId(categoriaId)!
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

  calor(filtroGrupos: string[] = []): CelulaCalor[] {
    const entra = (grupo: string) => filtroGrupos.length === 0 || filtroGrupos.includes(grupo)
    const grupoDe = (categoriaId: number) =>
      categoriasAdmin.find((c) => c.id === categoriaId)?.grupo ?? grupoDasCelulas
    const celulas = entra(grupoDasCelulas) ? calorIncidentes.map((c) => ({ ...c })) : []
    for (const novo of incidentesNovos.filter((i) => entra(grupoDe(i.categoriaId)))) {
      const existente = celulas.find((c) => c.lat === novo.lat && c.lng === novo.lng)
      if (existente) existente.quantidade++
      else celulas.push({ lat: novo.lat, lng: novo.lng, quantidade: 1 })
    }
    return celulas
  },
  registrarIncidente(categoriaId: number, lat: number, lng: number) {
    if (incidentesRegistrados >= LIMITE_INCIDENTES) return null
    incidentesRegistrados++
    const ponto = { lat: Math.round(lat * 1000) / 1000, lng: Math.round(lng * 1000) / 1000 }
    incidentesNovos = [...incidentesNovos, { categoriaId, ...ponto }]
    return ponto
  },
  incidentesNovos() {
    return incidentesNovos
  },

  grupos(): Grupo[] {
    return [...grupos].sort((a, b) => a.ordem - b.ordem || a.rotulo.localeCompare(b.rotulo))
  },
  categoriasAtivas() {
    return categoriasAdmin.filter((c) => c.ativa).map(({ ativa: _ativa, ...c }) => c)
  },
  categoriaPorId(id: number): CategoriaAdmin | undefined {
    return categoriasAdmin.find((c) => c.id === id)
  },
  categoriasTodas(): CategoriaAdmin[] {
    return categoriasAdmin
  },
  criarGrupo(rotulo: string, tipo: Grupo['tipo'], cor: Grupo['cor']) {
    if (grupos.some((g) => mesmoRotulo(g.rotulo, rotulo))) return 'grupo-rotulo-duplicado' as const
    const base = chaveDe(rotulo)
    let chave = base
    for (let n = 2; grupos.some((g) => g.chave === chave); n++) chave = `${base}${n}`
    const grupo: Grupo = {
      chave,
      rotulo: rotulo.trim(),
      tipo,
      cor,
      ordem: Math.max(0, ...grupos.map((g) => g.ordem)) + 1,
    }
    grupos = [...grupos, grupo]
    return grupo
  },
  editarGrupo(chave: string, rotulo: string, cor: Grupo['cor'], ordem: number) {
    const atual = grupos.find((g) => g.chave === chave)
    if (!atual) return 'nao-encontrado' as const
    if (grupos.some((g) => g.chave !== chave && mesmoRotulo(g.rotulo, rotulo))) {
      return 'grupo-rotulo-duplicado' as const
    }
    const novo = { ...atual, rotulo: rotulo.trim(), cor, ordem }
    grupos = grupos.map((g) => (g.chave === chave ? novo : g))
    return novo
  },
  apagarGrupo(chave: string) {
    if (!grupos.some((g) => g.chave === chave)) return 'nao-encontrado' as const
    if (categoriasAdmin.some((c) => c.grupo === chave)) return 'grupo-em-uso' as const
    grupos = grupos.filter((g) => g.chave !== chave)
    return 'ok' as const
  },
  criarCategoria(corpo: Schema<'CriarCategoriaRequest'>) {
    const grupo = grupos.find((g) => g.chave === corpo.grupo)
    if (!grupo) return 'grupo-inexistente' as const
    if (grupo.tipo !== corpo.tipo) return 'grupo-tipo-incompativel' as const
    if (categoriasAdmin.some((c) => mesmoRotulo(c.nome, corpo.nome)))
      return 'nome-duplicado' as const
    const categoria: CategoriaAdmin = {
      id: Math.max(0, ...categoriasAdmin.map((c) => c.id)) + 1,
      nome: corpo.nome.trim(),
      grupo: corpo.grupo,
      tipo: corpo.tipo,
      icone: corpo.icone,
      ativa: true,
    }
    categoriasAdmin = [...categoriasAdmin, categoria]
    return categoria
  },
  editarCategoria(id: number, corpo: Schema<'EditarCategoriaRequest'>) {
    const atual = categoriasAdmin.find((c) => c.id === id)
    if (!atual) return 'nao-encontrado' as const
    const grupo = grupos.find((g) => g.chave === corpo.grupo)
    if (!grupo) return 'grupo-inexistente' as const
    if (grupo.tipo !== atual.tipo) return 'grupo-tipo-incompativel' as const
    if (categoriasAdmin.some((c) => c.id !== id && mesmoRotulo(c.nome, corpo.nome))) {
      return 'nome-duplicado' as const
    }
    const nova = { ...atual, nome: corpo.nome.trim(), grupo: corpo.grupo, icone: corpo.icone }
    categoriasAdmin = categoriasAdmin.map((c) => (c.id === id ? nova : c))
    const embutida = { id, nome: nova.nome, grupo: nova.grupo, icone: nova.icone }
    for (const [chave, d] of detalhes) {
      if (d.categoria.id === id) detalhes.set(chave, { ...d, categoria: embutida })
    }
    historico = historico.map((h) => (h.categoria.id === id ? { ...h, categoria: embutida } : h))
    return nova
  },
  alterarAtivaCategoria(id: number, ativa: boolean) {
    if (!categoriasAdmin.some((c) => c.id === id)) return false
    categoriasAdmin = categoriasAdmin.map((c) => (c.id === id ? { ...c, ativa } : c))
    return true
  },

  reiniciar() {
    grupos = [...gruposIniciais]
    categoriasAdmin = categorias.map((c) => ({ ...c, ativa: true }))
    detalhes = criarDetalhes()
    votos = new Map()
    usuarios = [...usuariosIniciais]
    autoria = new Set([ID_DO_AUTOR])
    incidentesRegistrados = 0
    incidentesNovos = []
    verificacoes = verificacoesIniciais()
    historico = historicoInicial()
    perfis = new Map()
  },
}
