const HOST = 'https://api.iconify.design'
const PREFIX = 'material-symbols'
const CACHE_KEY = 'urbanReports.remoteIcons'
const VALID_D = /^[MmLlHhVvCcSsQqTtAaZz0-9eE+\-.,\s]+$/
const MAX_D_LENGTH = 4000
const MAX_VIEWBOX_LENGTH = 512
const TIMEOUT_MS = 8000
const VALID_NAME = /^[a-z0-9_-]+$/

export interface RemoteIconData {
  paths: string[]
  size: number
}

export function iconifyName(name: string) {
  return `${name.replaceAll('_', '-')}-rounded`
}

export function resultName(id: string): string | null {
  const [prefix, name] = id.split(':')
  if (prefix !== PREFIX || !name?.endsWith('-rounded') || name.endsWith('-outline-rounded')) {
    return null
  }
  return name.slice(0, -'-rounded'.length).replaceAll('-', '_')
}

export function bodyPaths(body: string): string[] | null {
  const paths: string[] = []
  const rest = body.replace(/<path\b([^>]*?)\/?>/g, (_, attributes: string) => {
    const d = /(?:^|\s)d="([^"]*)"/.exec(attributes)?.[1]
    if (d && d.length <= MAX_D_LENGTH && VALID_D.test(d)) paths.push(d)
    return ''
  })
  return rest.trim() === '' && paths.length > 0 ? paths : null
}

function validData(value: unknown): value is RemoteIconData {
  if (typeof value !== 'object' || value === null) return false
  const { paths, size } = value as Partial<RemoteIconData>
  return (
    Array.isArray(paths) &&
    paths.length > 0 &&
    paths.every((d) => typeof d === 'string' && d.length <= MAX_D_LENGTH && VALID_D.test(d)) &&
    typeof size === 'number' &&
    Number.isFinite(size) &&
    size > 0 &&
    size <= MAX_VIEWBOX_LENGTH
  )
}

function readCache(): Record<string, unknown> {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}')
    return typeof saved === 'object' && saved !== null && !Array.isArray(saved)
      ? (saved as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

function saveCache(newEntries: Record<string, RemoteIconData>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...readCache(), ...newEntries }))
  } catch {
    void 0
  }
}

function withTimeout(signal?: AbortSignal) {
  const control = new AbortController()
  const timer = setTimeout(() => control.abort(), TIMEOUT_MS)
  signal?.addEventListener('abort', () => control.abort(), { once: true })
  return { signal: control.signal, clear: () => clearTimeout(timer) }
}

async function fetchJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const limit = withTimeout(signal)
  try {
    const response = await fetch(url, { signal: limit.signal })
    if (!response.ok) throw new Error(`Iconify respondeu ${response.status}`)
    return await response.json()
  } finally {
    limit.clear()
  }
}

const inMemory = new Map<string, Promise<RemoteIconData | null>>()
let queue: { name: string; resolve(iconData: RemoteIconData | null): void }[] = []

async function fetchBatch(names: string[]): Promise<Map<string, RemoteIconData>> {
  const query = names.map(iconifyName).join(',')
  const json = (await fetchJson(`${HOST}/${PREFIX}.json?icons=${encodeURIComponent(query)}`)) as {
    width?: number
    icons?: Record<string, { body?: string; width?: number }>
  }
  const result = new Map<string, RemoteIconData>()
  for (const name of names) {
    const key = iconifyName(name)
    const icon = json.icons && Object.hasOwn(json.icons, key) ? json.icons[key] : undefined
    const paths = icon?.body ? bodyPaths(icon.body) : null
    const iconData = { paths: paths ?? [], size: icon?.width ?? json.width ?? 24 }
    if (validData(iconData)) result.set(name, iconData)
  }
  return result
}

function flushQueue() {
  const batch = queue
  queue = []
  if (batch.length === 0) return
  const names = batch.map((item) => item.name)
  fetchBatch(names)
    .then((result) => {
      saveCache(Object.fromEntries(result))
      for (const { name, resolve } of batch) resolve(result.get(name) ?? null)
    })
    .catch(() => {
      for (const { resolve } of batch) resolve(null)
    })
}

export function loadIcon(name: string): Promise<RemoteIconData | null> {
  if (!VALID_NAME.test(name)) return Promise.resolve(null)
  const existing = inMemory.get(name)
  if (existing) return existing

  const cache = readCache()
  const saved = Object.hasOwn(cache, name) && validData(cache[name]) ? cache[name] : null
  const promise = saved
    ? Promise.resolve(saved)
    : new Promise<RemoteIconData | null>((resolve) => {
        queue.push({ name, resolve })
        if (queue.length === 1) queueMicrotask(flushQueue)
      })
  inMemory.set(name, promise)
  return promise
}

export async function fetchIcons(query: string, signal?: AbortSignal): Promise<string[]> {
  const url = `${HOST}/search?query=${encodeURIComponent(query)}&prefix=${PREFIX}&limit=96`
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`Iconify respondeu ${response.status}`)
  const json = (await response.json()) as { icons?: string[] }
  return [...new Set((json.icons ?? []).map(resultName).filter((n): n is string => n !== null))]
}

export function clearIconCache() {
  inMemory.clear()
  queue = []
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {
    void 0
  }
}
