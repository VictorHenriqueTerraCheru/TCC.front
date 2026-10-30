import type { Schema } from '../api'
import { categories } from './fixtures/categories'
import { createDetails, AUTHOR_ID } from './fixtures/details'
import { groups as initialGroups } from './fixtures/groups'
import { initialHistory, initialVerifications } from './fixtures/profile'
import { incidentHeatmap, cellGroup } from './fixtures/issues'
import { initialUsers } from './fixtures/users'

type VoteValue = Schema<'VoteAnswer'>
type Detail = Schema<'GetIssueDetailResponse'>
type HeatmapCell = Schema<'GetIncidentHeatmapResponse'>
type Verification = Schema<'ListVerificationsItem'>
type Role = Schema<'Role'>
type Group = Schema<'GroupResponse'>
type AdminCategory = Schema<'CategoryAdminResponse'>

const INCIDENT_LIMIT = 10
const isReportType = (type: string) => type === 'issueReport' || type === 'incidentReport'

export function metersBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const dLat = (b.lat - a.lat) * 111_320
  const dLng = (b.lng - a.lng) * 111_320 * Math.cos((a.lat * Math.PI) / 180)
  return Math.hypot(dLat, dLng)
}

let details = createDetails()
let votes = new Map<string, VoteValue>()
let users = [...initialUsers]
let authorship = new Set([AUTHOR_ID])
let reportedIncidents = 0
let newIncidents: { categoryId: number; lat: number; lng: number }[] = []
let verifications = initialVerifications()
let history = initialHistory()
let roles = new Map<string, { role: Role; verifiedAt: string | null }>()
let groups: Group[] = [...initialGroups]
let adminCategories: AdminCategory[] = categories.map((c) => ({ ...c, active: true }))

function keyOf(label: string) {
  const words = label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
  const key = words
    .map((p, i) => (i === 0 ? p.toLowerCase() : p[0]!.toUpperCase() + p.slice(1).toLowerCase()))
    .join('')
    .slice(0, 30)
  return /^[a-z]/i.test(key) ? key : `grupo${key}`.slice(0, 30)
}

const sameLabel = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')

export const database = {
  userByEmail(email: string) {
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
  },
  register(name: string, email: string, password: string) {
    const user = {
      id: `u-${users.length + 1}`,
      name,
      email,
      password,
      role: 'citizen' as const,
    }
    users = [...users, user]
    return user
  },

  userFromToken(request: Request) {
    const id = request.headers.get('Authorization')?.match(/mock-jwt-(.+)$/)?.[1] ?? 'u-citizen1'
    const user = users.find((u) => u.id === id) ?? users.find((u) => u.id === 'u-citizen1')!
    const current = roles.get(user.id)
    return {
      ...user,
      role: current?.role ?? user.role,
      verifiedAt: current?.verifiedAt ?? (user.role === 'citizen' ? null : '2026-09-25T15:00:00Z'),
    }
  },
  adminUsers(search: string | null, role: string | null): Schema<'ListUsersItem'>[] {
    const term = search?.trim().toLowerCase() ?? ''
    return users
      .map((u, index) => {
        const current = roles.get(u.id)
        const effective = current?.role ?? u.role
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          role: effective,
          createdAt: new Date(Date.UTC(2026, 2, 2 + index, 12)).toISOString(),
          verifiedAt:
            current?.verifiedAt ?? (effective === 'citizen' ? null : '2026-09-25T15:00:00Z'),
        }
      })
      .filter(
        (u) =>
          (!role || u.role.toLowerCase() === role.toLowerCase()) &&
          (term === '' ||
            u.name.toLowerCase().includes(term) ||
            u.email.toLowerCase().includes(term)),
      )
      .reverse()
  },
  setUserRole(adminId: string, id: string, role: Role) {
    if (id === adminId) return 'own-role' as const
    const user = users.find((u) => u.id === id)
    if (!user) return 'not-found' as const
    const current = roles.get(id)
    const verifiedAt =
      role === 'citizen'
        ? null
        : (current?.verifiedAt ?? (user.role === 'citizen' ? null : '2026-09-25T15:00:00Z') ?? null)
    roles.set(id, {
      role,
      verifiedAt:
        role === 'verifiedCitizen' ? (verifiedAt ?? new Date().toISOString()) : verifiedAt,
    })
    return 'ok' as const
  },
  rename(id: string, name: string) {
    users = users.map((u) => (u.id === id ? { ...u, name } : u))
  },
  me(request: Request): Schema<'GetMeResponse'> {
    const user = database.userFromToken(request)
    const last = verifications.find((v) => v.user.id === user.id)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: '2026-03-02T12:00:00Z',
      verifiedAt: user.verifiedAt,
      totalReports: history.filter((h) => isReportType(h.type)).length,
      totalVotes: history.filter((h) => h.type.startsWith('vote')).length,
      verification: last
        ? {
            status: last.status,
            affiliationType: last.affiliationType,
            rejectionReason: last.rejectionReason,
            createdAt: last.createdAt,
          }
        : null,
    }
  },
  history(filter: string) {
    if (filter === 'reports') return history.filter((h) => isReportType(h.type))
    if (filter === 'votes') return history.filter((h) => h.type.startsWith('vote'))
    return history
  },

  verifications(status: string | null) {
    const list = verifications.filter((v) => !status || v.status === status)
    return [...list].sort((a, b) =>
      status === 'pending'
        ? a.createdAt.localeCompare(b.createdAt)
        : b.createdAt.localeCompare(a.createdAt),
    )
  },
  requestVerification(
    request: Request,
    affiliationType: Verification['affiliationType'],
    justification: string,
  ) {
    const user = database.userFromToken(request)
    if (user.role !== 'citizen') return 'already-verified' as const
    if (verifications.some((v) => v.user.id === user.id && v.status === 'pending')) {
      return 'verification-already-pending' as const
    }
    const fresh: Verification = {
      id: `v-${verifications.length + 1}`,
      user: { id: user.id, name: user.name, initials: initials(user.name) },
      affiliationType,
      justification,
      status: 'pending',
      createdAt: new Date().toISOString(),
      rejectionReason: null,
    }
    verifications = [fresh, ...verifications]
    return fresh
  },
  reviewVerification(id: string, decision: 'approved' | 'rejected', reason: string | null) {
    const verification = verifications.find((v) => v.id === id)
    if (!verification) return 'not-found' as const
    if (verification.status !== 'pending') return 'verification-already-reviewed' as const
    verifications = verifications.map((v) =>
      v.id === id ? { ...v, status: decision, rejectionReason: reason } : v,
    )
    if (decision === 'approved') {
      roles.set(verification.user.id, {
        role: 'verifiedCitizen',
        verifiedAt: new Date().toISOString(),
      })
    }
    return 'ok' as const
  },

  issues(): Schema<'ListIssuesInAreaResponse'>[] {
    return [...details.values()]
      .filter((d) => d.status !== 'resolved')
      .map(({ id, category, lat, lng, status, trustScore: trust, band }) => ({
        id,
        categoryId: category.id,
        lat,
        lng,
        status,
        trustScore: trust,
        band,
      }))
  },
  detail(id: string, authenticated: boolean): Detail | null {
    const detail = details.get(id)
    if (!detail) return null
    return {
      ...detail,
      myVote: authenticated ? (votes.get(id) ?? null) : null,
      isAuthor: authenticated && authorship.has(id),
    }
  },
  duplicates(categoryId: number, point: { lat: number; lng: number }) {
    return [...details.values()]
      .filter((d) => d.category.id === categoryId && d.status !== 'resolved')
      .map((d) => ({ d, distance: metersBetween(point, d) }))
      .filter(({ distance }) => distance <= 50)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20)
      .map(({ d, distance }) => ({
        id: d.id,
        category: d.category,
        address: d.address,
        createdAt: d.createdAt,
        distanceMeters: Math.round(distance),
        band: d.band,
        confirmations: d.votes.yes,
      }))
  },
  reportIssue(categoryId: number, lat: number, lng: number, description: string | null) {
    const { type: _type, active: _active, ...category } = database.categoryById(categoryId)!
    const now = new Date()
    const detail: Detail = {
      id: crypto.randomUUID(),
      category,
      description,
      lat,
      lng,
      address: 'Rua Voluntários da Pátria, 170 — Botafogo',
      createdAt: now.toISOString(),
      status: 'new',
      trustScore: null,
      band: null,
      evaluation: {
        voters: 0,
        required: 5,
        closesAt: new Date(now.getTime() + 72 * 3_600_000).toISOString(),
      },
      votes: { yes: 0, no: 0, noLast24h: 0 },
      myVote: null,
      isAuthor: false,
    }
    details.set(detail.id, detail)
    authorship.add(detail.id)
    return database.detail(detail.id, true)!
  },
  vote(id: string, value: VoteValue) {
    const detail = details.get(id)!
    const previous = votes.get(id) ?? null
    if (previous === value) return
    const count = { ...detail.votes }
    if (previous === 'yes') count.yes--
    if (previous === 'no') {
      count.no--
      count.noLast24h--
    }
    if (value === 'yes') count.yes++
    else {
      count.no++
      count.noLast24h++
    }
    details.set(id, { ...detail, votes: count })
    votes.set(id, value)
  },

  heatmap(groupFilter: string[] = []): HeatmapCell[] {
    const matchesGroup = (group: string) => groupFilter.length === 0 || groupFilter.includes(group)
    const groupOf = (categoryId: number) =>
      adminCategories.find((c) => c.id === categoryId)?.group ?? cellGroup
    const cells = matchesGroup(cellGroup) ? incidentHeatmap.map((c) => ({ ...c })) : []
    for (const newPoint of newIncidents.filter((i) => matchesGroup(groupOf(i.categoryId)))) {
      const existing = cells.find((c) => c.lat === newPoint.lat && c.lng === newPoint.lng)
      if (existing) existing.count++
      else cells.push({ lat: newPoint.lat, lng: newPoint.lng, count: 1 })
    }
    return cells
  },
  reportIncident(categoryId: number, lat: number, lng: number) {
    if (reportedIncidents >= INCIDENT_LIMIT) return null
    reportedIncidents++
    const point = { lat: Math.round(lat * 1000) / 1000, lng: Math.round(lng * 1000) / 1000 }
    newIncidents = [...newIncidents, { categoryId, ...point }]
    return point
  },
  newIncidents() {
    return newIncidents
  },

  groups(): Group[] {
    return [...groups].sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
  },
  activeCategories() {
    return adminCategories.filter((c) => c.active).map(({ active: _active, ...c }) => c)
  },
  categoryById(id: number): AdminCategory | undefined {
    return adminCategories.find((c) => c.id === id)
  },
  allCategories(): AdminCategory[] {
    return adminCategories
  },
  createGroup(label: string, type: Group['type'], color: Group['color']) {
    if (groups.some((g) => sameLabel(g.label, label))) return 'duplicate-group-label' as const
    const base = keyOf(label)
    let key = base
    for (let n = 2; groups.some((g) => g.key === key); n++) key = `${base}${n}`
    const group: Group = {
      key,
      label: label.trim(),
      type,
      color,
      sortOrder: Math.max(0, ...groups.map((g) => g.sortOrder)) + 1,
    }
    groups = [...groups, group]
    return group
  },
  editGroup(key: string, label: string, color: Group['color'], order: number) {
    const current = groups.find((g) => g.key === key)
    if (!current) return 'not-found' as const
    if (groups.some((g) => g.key !== key && sameLabel(g.label, label))) {
      return 'duplicate-group-label' as const
    }
    const newPoint = { ...current, label: label.trim(), color, sortOrder: order }
    groups = groups.map((g) => (g.key === key ? newPoint : g))
    return newPoint
  },
  deleteGroup(key: string) {
    if (!groups.some((g) => g.key === key)) return 'not-found' as const
    if (adminCategories.some((c) => c.group === key)) return 'group-in-use' as const
    groups = groups.filter((g) => g.key !== key)
    return 'ok' as const
  },
  createCategory(body: Schema<'CreateCategoryRequest'>) {
    const group = groups.find((g) => g.key === body.group)
    if (!group) return 'missing-group' as const
    if (group.type !== body.type) return 'group-type-mismatch' as const
    if (adminCategories.some((c) => sameLabel(c.name, body.name))) return 'duplicate-name' as const
    const category: AdminCategory = {
      id: Math.max(0, ...adminCategories.map((c) => c.id)) + 1,
      name: body.name.trim(),
      group: body.group,
      type: body.type,
      icon: body.icon,
      active: true,
    }
    adminCategories = [...adminCategories, category]
    return category
  },
  editCategory(id: number, body: Schema<'EditCategoryRequest'>) {
    const current = adminCategories.find((c) => c.id === id)
    if (!current) return 'not-found' as const
    const group = groups.find((g) => g.key === body.group)
    if (!group) return 'missing-group' as const
    if (group.type !== current.type) return 'group-type-mismatch' as const
    if (adminCategories.some((c) => c.id !== id && sameLabel(c.name, body.name))) {
      return 'duplicate-name' as const
    }
    const fresh = { ...current, name: body.name.trim(), group: body.group, icon: body.icon }
    adminCategories = adminCategories.map((c) => (c.id === id ? fresh : c))
    const builtIn = { id, name: fresh.name, group: fresh.group, icon: fresh.icon }
    for (const [key, d] of details) {
      if (d.category.id === id) details.set(key, { ...d, category: builtIn })
    }
    history = history.map((h) => (h.category.id === id ? { ...h, category: builtIn } : h))
    return fresh
  },
  setCategoryActive(id: number, active: boolean) {
    if (!adminCategories.some((c) => c.id === id)) return false
    adminCategories = adminCategories.map((c) => (c.id === id ? { ...c, active } : c))
    return true
  },

  reset() {
    groups = [...initialGroups]
    adminCategories = categories.map((c) => ({ ...c, active: true }))
    details = createDetails()
    votes = new Map()
    users = [...initialUsers]
    authorship = new Set([AUTHOR_ID])
    reportedIncidents = 0
    newIncidents = []
    verifications = initialVerifications()
    history = initialHistory()
    roles = new Map()
  },
}
