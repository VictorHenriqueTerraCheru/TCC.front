import type { Schema } from '../api'
import { categorias } from './fixtures/categorias'
import { criarDetalhes, ID_DO_AUTOR } from './fixtures/detalhes'
import { grupos as gruposIniciais } from './fixtures/grupos'
import { historicoInicial, verificacoesIniciais } from './fixtures/perfil'
import { calorIncidentes, grupoDasCelulas } from './fixtures/problemas'
import { usuariosIniciais } from './fixtures/usuarios'

type ValorVoto = Schema<'VoteAnswer'>
type Detalhe = Schema<'GetIssueDetailResponse'>
type CelulaCalor = Schema<'GetIncidentHeatmapResponse'>
type Verificacao = Schema<'ListVerificationsItem'>
type Perfil = Schema<'Role'>
type Grupo = Schema<'GroupResponse'>
type CategoriaAdmin = Schema<'CategoryAdminResponse'>

const LIMITE_INCIDENTES = 10
const isReportType = (type: string) => type === 'issueReport' || type === 'incidentReport'

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
let incidentesNovos: { categoryId: number; lat: number; lng: number }[] = []
let verificacoes = verificacoesIniciais()
let historico = historicoInicial()
let perfis = new Map<string, { role: Perfil; verifiedAt: string | null }>()
let grupos: Grupo[] = [...gruposIniciais]
let categoriasAdmin: CategoriaAdmin[] = categorias.map((c) => ({ ...c, active: true }))

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
      name: nome,
      email,
      password: senha,
      role: 'citizen' as const,
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
      role: atual?.role ?? usuario.role,
      verifiedAt: atual?.verifiedAt ?? (usuario.role === 'citizen' ? null : '2026-09-25T15:00:00Z'),
    }
  },
  usuariosAdmin(busca: string | null, perfil: string | null): Schema<'ListUsersItem'>[] {
    const termo = busca?.trim().toLowerCase() ?? ''
    return usuarios
      .map((u, indice) => {
        const atual = perfis.get(u.id)
        const efetivo = atual?.role ?? u.role
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          role: efetivo,
          createdAt: new Date(Date.UTC(2026, 2, 2 + indice, 12)).toISOString(),
          verifiedAt: atual?.verifiedAt ?? (efetivo === 'citizen' ? null : '2026-09-25T15:00:00Z'),
        }
      })
      .filter(
        (u) =>
          (!perfil || u.role.toLowerCase() === perfil.toLowerCase()) &&
          (termo === '' ||
            u.name.toLowerCase().includes(termo) ||
            u.email.toLowerCase().includes(termo)),
      )
      .reverse()
  },
  alterarPerfilUsuario(adminId: string, id: string, perfil: Perfil) {
    if (id === adminId) return 'own-role' as const
    const usuario = usuarios.find((u) => u.id === id)
    if (!usuario) return 'nao-encontrado' as const
    const atual = perfis.get(id)
    const verificadoEm =
      perfil === 'citizen'
        ? null
        : (atual?.verifiedAt ??
          (usuario.role === 'citizen' ? null : '2026-09-25T15:00:00Z') ??
          null)
    perfis.set(id, {
      role: perfil,
      verifiedAt:
        perfil === 'verifiedCitizen' ? (verificadoEm ?? new Date().toISOString()) : verificadoEm,
    })
    return 'ok' as const
  },
  renomear(id: string, nome: string) {
    usuarios = usuarios.map((u) => (u.id === id ? { ...u, name: nome } : u))
  },
  me(request: Request): Schema<'GetMeResponse'> {
    const usuario = banco.usuarioDoToken(request)
    const ultima = verificacoes.find((v) => v.user.id === usuario.id)
    return {
      id: usuario.id,
      name: usuario.name,
      email: usuario.email,
      role: usuario.role,
      createdAt: '2026-03-02T12:00:00Z',
      verifiedAt: usuario.verifiedAt,
      totalReports: historico.filter((h) => isReportType(h.type)).length,
      totalVotes: historico.filter((h) => h.type.startsWith('vote')).length,
      verification: ultima
        ? {
            status: ultima.status,
            affiliationType: ultima.affiliationType,
            rejectionReason: ultima.rejectionReason,
            createdAt: ultima.createdAt,
          }
        : null,
    }
  },
  historico(filtro: string) {
    if (filtro === 'reports') return historico.filter((h) => isReportType(h.type))
    if (filtro === 'votes') return historico.filter((h) => h.type.startsWith('vote'))
    return historico
  },

  verificacoes(status: string | null) {
    const lista = verificacoes.filter((v) => !status || v.status === status)
    return [...lista].sort((a, b) =>
      status === 'pending'
        ? a.createdAt.localeCompare(b.createdAt)
        : b.createdAt.localeCompare(a.createdAt),
    )
  },
  solicitarVerificacao(
    request: Request,
    tipoVinculo: Verificacao['affiliationType'],
    justificativa: string,
  ) {
    const usuario = banco.usuarioDoToken(request)
    if (usuario.role !== 'citizen') return 'already-verified' as const
    if (verificacoes.some((v) => v.user.id === usuario.id && v.status === 'pending')) {
      return 'verification-already-pending' as const
    }
    const nova: Verificacao = {
      id: `v-${verificacoes.length + 1}`,
      user: { id: usuario.id, name: usuario.name, initials: iniciais(usuario.name) },
      affiliationType: tipoVinculo,
      justification: justificativa,
      status: 'pending',
      createdAt: new Date().toISOString(),
      rejectionReason: null,
    }
    verificacoes = [nova, ...verificacoes]
    return nova
  },
  analisarVerificacao(id: string, decisao: 'approved' | 'rejected', motivo: string | null) {
    const verificacao = verificacoes.find((v) => v.id === id)
    if (!verificacao) return 'nao-encontrada' as const
    if (verificacao.status !== 'pending') return 'verification-already-reviewed' as const
    verificacoes = verificacoes.map((v) =>
      v.id === id ? { ...v, status: decisao, rejectionReason: motivo } : v,
    )
    if (decisao === 'approved') {
      perfis.set(verificacao.user.id, {
        role: 'verifiedCitizen',
        verifiedAt: new Date().toISOString(),
      })
    }
    return 'ok' as const
  },

  problemas(): Schema<'ListIssuesInAreaResponse'>[] {
    return [...detalhes.values()]
      .filter((d) => d.status !== 'resolved')
      .map(({ id, category: categoria, lat, lng, status, trustScore: confianca, band: faixa }) => ({
        id,
        categoryId: categoria.id,
        lat,
        lng,
        status,
        trustScore: confianca,
        band: faixa,
      }))
  },
  detalhe(id: string, autenticado: boolean): Detalhe | null {
    const detalhe = detalhes.get(id)
    if (!detalhe) return null
    return {
      ...detalhe,
      myVote: autenticado ? (votos.get(id) ?? null) : null,
      isAuthor: autenticado && autoria.has(id),
    }
  },
  duplicatas(categoriaId: number, ponto: { lat: number; lng: number }) {
    return [...detalhes.values()]
      .filter((d) => d.category.id === categoriaId && d.status !== 'resolved')
      .map((d) => ({ d, distancia: metrosEntre(ponto, d) }))
      .filter(({ distancia }) => distancia <= 50)
      .sort((a, b) => a.distancia - b.distancia)
      .slice(0, 20)
      .map(({ d, distancia }) => ({
        id: d.id,
        category: d.category,
        address: d.address,
        createdAt: d.createdAt,
        distanceMeters: Math.round(distancia),
        band: d.band,
        confirmations: d.votes.yes,
      }))
  },
  registrarProblema(categoriaId: number, lat: number, lng: number, descricao: string | null) {
    const { type: _tipo, active: _ativa, ...categoria } = banco.categoriaPorId(categoriaId)!
    const agora = new Date()
    const detalhe: Detalhe = {
      id: crypto.randomUUID(),
      category: categoria,
      description: descricao,
      lat,
      lng,
      address: 'Rua Voluntários da Pátria, 170 — Botafogo',
      createdAt: agora.toISOString(),
      status: 'new',
      trustScore: null,
      band: null,
      evaluation: {
        voters: 0,
        required: 5,
        closesAt: new Date(agora.getTime() + 72 * 3_600_000).toISOString(),
      },
      votes: { yes: 0, no: 0, noLast24h: 0 },
      myVote: null,
      isAuthor: false,
    }
    detalhes.set(detalhe.id, detalhe)
    autoria.add(detalhe.id)
    return banco.detalhe(detalhe.id, true)!
  },
  votar(id: string, valor: ValorVoto) {
    const detalhe = detalhes.get(id)!
    const anterior = votos.get(id) ?? null
    if (anterior === valor) return
    const contagem = { ...detalhe.votes }
    if (anterior === 'yes') contagem.yes--
    if (anterior === 'no') {
      contagem.no--
      contagem.noLast24h--
    }
    if (valor === 'yes') contagem.yes++
    else {
      contagem.no++
      contagem.noLast24h++
    }
    detalhes.set(id, { ...detalhe, votes: contagem })
    votos.set(id, valor)
  },

  calor(filtroGrupos: string[] = []): CelulaCalor[] {
    const entra = (grupo: string) => filtroGrupos.length === 0 || filtroGrupos.includes(grupo)
    const grupoDe = (categoriaId: number) =>
      categoriasAdmin.find((c) => c.id === categoriaId)?.group ?? grupoDasCelulas
    const celulas = entra(grupoDasCelulas) ? calorIncidentes.map((c) => ({ ...c })) : []
    for (const novo of incidentesNovos.filter((i) => entra(grupoDe(i.categoryId)))) {
      const existente = celulas.find((c) => c.lat === novo.lat && c.lng === novo.lng)
      if (existente) existente.count++
      else celulas.push({ lat: novo.lat, lng: novo.lng, count: 1 })
    }
    return celulas
  },
  registrarIncidente(categoriaId: number, lat: number, lng: number) {
    if (incidentesRegistrados >= LIMITE_INCIDENTES) return null
    incidentesRegistrados++
    const ponto = { lat: Math.round(lat * 1000) / 1000, lng: Math.round(lng * 1000) / 1000 }
    incidentesNovos = [...incidentesNovos, { categoryId: categoriaId, ...ponto }]
    return ponto
  },
  incidentesNovos() {
    return incidentesNovos
  },

  grupos(): Grupo[] {
    return [...grupos].sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
  },
  categoriasAtivas() {
    return categoriasAdmin.filter((c) => c.active).map(({ active: _ativa, ...c }) => c)
  },
  categoriaPorId(id: number): CategoriaAdmin | undefined {
    return categoriasAdmin.find((c) => c.id === id)
  },
  categoriasTodas(): CategoriaAdmin[] {
    return categoriasAdmin
  },
  criarGrupo(rotulo: string, tipo: Grupo['type'], cor: Grupo['color']) {
    if (grupos.some((g) => mesmoRotulo(g.label, rotulo))) return 'duplicate-group-label' as const
    const base = chaveDe(rotulo)
    let chave = base
    for (let n = 2; grupos.some((g) => g.key === chave); n++) chave = `${base}${n}`
    const grupo: Grupo = {
      key: chave,
      label: rotulo.trim(),
      type: tipo,
      color: cor,
      sortOrder: Math.max(0, ...grupos.map((g) => g.sortOrder)) + 1,
    }
    grupos = [...grupos, grupo]
    return grupo
  },
  editarGrupo(chave: string, rotulo: string, cor: Grupo['color'], ordem: number) {
    const atual = grupos.find((g) => g.key === chave)
    if (!atual) return 'nao-encontrado' as const
    if (grupos.some((g) => g.key !== chave && mesmoRotulo(g.label, rotulo))) {
      return 'duplicate-group-label' as const
    }
    const novo = { ...atual, label: rotulo.trim(), color: cor, sortOrder: ordem }
    grupos = grupos.map((g) => (g.key === chave ? novo : g))
    return novo
  },
  apagarGrupo(chave: string) {
    if (!grupos.some((g) => g.key === chave)) return 'nao-encontrado' as const
    if (categoriasAdmin.some((c) => c.group === chave)) return 'group-in-use' as const
    grupos = grupos.filter((g) => g.key !== chave)
    return 'ok' as const
  },
  criarCategoria(corpo: Schema<'CreateCategoryRequest'>) {
    const grupo = grupos.find((g) => g.key === corpo.group)
    if (!grupo) return 'grupo-inexistente' as const
    if (grupo.type !== corpo.type) return 'group-type-mismatch' as const
    if (categoriasAdmin.some((c) => mesmoRotulo(c.name, corpo.name)))
      return 'duplicate-name' as const
    const categoria: CategoriaAdmin = {
      id: Math.max(0, ...categoriasAdmin.map((c) => c.id)) + 1,
      name: corpo.name.trim(),
      group: corpo.group,
      type: corpo.type,
      icon: corpo.icon,
      active: true,
    }
    categoriasAdmin = [...categoriasAdmin, categoria]
    return categoria
  },
  editarCategoria(id: number, corpo: Schema<'EditCategoryRequest'>) {
    const atual = categoriasAdmin.find((c) => c.id === id)
    if (!atual) return 'nao-encontrado' as const
    const grupo = grupos.find((g) => g.key === corpo.group)
    if (!grupo) return 'grupo-inexistente' as const
    if (grupo.type !== atual.type) return 'group-type-mismatch' as const
    if (categoriasAdmin.some((c) => c.id !== id && mesmoRotulo(c.name, corpo.name))) {
      return 'duplicate-name' as const
    }
    const nova = { ...atual, name: corpo.name.trim(), group: corpo.group, icon: corpo.icon }
    categoriasAdmin = categoriasAdmin.map((c) => (c.id === id ? nova : c))
    const embutida = { id, name: nova.name, group: nova.group, icon: nova.icon }
    for (const [chave, d] of detalhes) {
      if (d.category.id === id) detalhes.set(chave, { ...d, category: embutida })
    }
    historico = historico.map((h) => (h.category.id === id ? { ...h, category: embutida } : h))
    return nova
  },
  alterarAtivaCategoria(id: number, ativa: boolean) {
    if (!categoriasAdmin.some((c) => c.id === id)) return false
    categoriasAdmin = categoriasAdmin.map((c) => (c.id === id ? { ...c, active: ativa } : c))
    return true
  },

  reiniciar() {
    grupos = [...gruposIniciais]
    categoriasAdmin = categorias.map((c) => ({ ...c, active: true }))
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
