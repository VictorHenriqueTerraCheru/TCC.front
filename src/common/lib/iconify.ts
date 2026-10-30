const HOST = 'https://api.iconify.design'
const PREFIX = 'material-symbols'

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

export async function loadIcon(name: string): Promise<RemoteIconData | null> {
  const key = iconifyName(name)
  const response = await fetch(`${HOST}/${PREFIX}.json?icons=${encodeURIComponent(key)}`)
  if (!response.ok) return null
  const json = (await response.json()) as {
    width?: number
    icons?: Record<string, { body?: string; width?: number }>
  }
  const icon = json.icons?.[key]
  const paths = [...(icon?.body ?? '').matchAll(/<path\b[^>]*?\sd="([^"]*)"/g)].map((m) => m[1]!)
  return paths.length > 0 ? { paths, size: icon?.width ?? json.width ?? 24 } : null
}

export async function fetchIcons(query: string, signal?: AbortSignal): Promise<string[]> {
  const url = `${HOST}/search?query=${encodeURIComponent(query)}&prefix=${PREFIX}&limit=96`
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`Iconify respondeu ${response.status}`)
  const json = (await response.json()) as { icons?: string[] }
  return [...new Set((json.icons ?? []).map(resultName).filter((n): n is string => n !== null))]
}
