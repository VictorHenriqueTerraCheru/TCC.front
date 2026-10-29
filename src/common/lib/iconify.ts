const HOST = 'https://api.iconify.design'
const PREFIXO = 'material-symbols'
const CHAVE_CACHE = 'ocorrencias.iconesRemotos'
const D_VALIDO = /^[MmLlHhVvCcSsQqTtAaZz0-9eE+\-.,\s]+$/
const TAMANHO_MAXIMO_D = 4000
const TAMANHO_MAXIMO_VIEWBOX = 512
const TEMPO_LIMITE_MS = 8000
const NOME_VALIDO = /^[a-z0-9_-]+$/

export interface IconeRemotoDados {
  caminhos: string[]
  pageSize: number
}

export function nomeNoIconify(nome: string) {
  return `${nome.replaceAll('_', '-')}-rounded`
}

export function nomeDoResultado(id: string): string | null {
  const [prefixo, nome] = id.split(':')
  if (prefixo !== PREFIXO || !nome?.endsWith('-rounded') || nome.endsWith('-outline-rounded')) {
    return null
  }
  return nome.slice(0, -'-rounded'.length).replaceAll('-', '_')
}

export function caminhosDoCorpo(corpo: string): string[] | null {
  const caminhos: string[] = []
  const resto = corpo.replace(/<path\b([^>]*?)\/?>/g, (_, atributos: string) => {
    const d = /(?:^|\s)d="([^"]*)"/.exec(atributos)?.[1]
    if (d && d.length <= TAMANHO_MAXIMO_D && D_VALIDO.test(d)) caminhos.push(d)
    return ''
  })
  return resto.trim() === '' && caminhos.length > 0 ? caminhos : null
}

function dadosValidos(valor: unknown): valor is IconeRemotoDados {
  if (typeof valor !== 'object' || valor === null) return false
  const { caminhos, pageSize: tamanho } = valor as Partial<IconeRemotoDados>
  return (
    Array.isArray(caminhos) &&
    caminhos.length > 0 &&
    caminhos.every(
      (d) => typeof d === 'string' && d.length <= TAMANHO_MAXIMO_D && D_VALIDO.test(d),
    ) &&
    typeof tamanho === 'number' &&
    Number.isFinite(tamanho) &&
    tamanho > 0 &&
    tamanho <= TAMANHO_MAXIMO_VIEWBOX
  )
}

function lerCache(): Record<string, unknown> {
  try {
    const salvo: unknown = JSON.parse(localStorage.getItem(CHAVE_CACHE) ?? '{}')
    return typeof salvo === 'object' && salvo !== null && !Array.isArray(salvo)
      ? (salvo as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

function gravarCache(novos: Record<string, IconeRemotoDados>) {
  try {
    localStorage.setItem(CHAVE_CACHE, JSON.stringify({ ...lerCache(), ...novos }))
  } catch {
    void 0
  }
}

function comTempoLimite(sinal?: AbortSignal) {
  const controle = new AbortController()
  const timer = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS)
  sinal?.addEventListener('abort', () => controle.abort(), { once: true })
  return { sinal: controle.signal, limpar: () => clearTimeout(timer) }
}

async function buscarJson(url: string, sinal?: AbortSignal): Promise<unknown> {
  const limite = comTempoLimite(sinal)
  try {
    const resposta = await fetch(url, { signal: limite.sinal })
    if (!resposta.ok) throw new Error(`Iconify respondeu ${resposta.status}`)
    return await resposta.json()
  } finally {
    limite.limpar()
  }
}

const emMemoria = new Map<string, Promise<IconeRemotoDados | null>>()
let fila: { name: string; resolver(dados: IconeRemotoDados | null): void }[] = []

async function buscarLote(nomes: string[]): Promise<Map<string, IconeRemotoDados>> {
  const consulta = nomes.map(nomeNoIconify).join(',')
  const json = (await buscarJson(
    `${HOST}/${PREFIXO}.json?icons=${encodeURIComponent(consulta)}`,
  )) as {
    width?: number
    icons?: Record<string, { body?: string; width?: number }>
  }
  const resultado = new Map<string, IconeRemotoDados>()
  for (const nome of nomes) {
    const chave = nomeNoIconify(nome)
    const icone = json.icons && Object.hasOwn(json.icons, chave) ? json.icons[chave] : undefined
    const caminhos = icone?.body ? caminhosDoCorpo(icone.body) : null
    const dados = { caminhos: caminhos ?? [], pageSize: icone?.width ?? json.width ?? 24 }
    if (dadosValidos(dados)) resultado.set(nome, dados)
  }
  return resultado
}

function descarregarFila() {
  const lote = fila
  fila = []
  if (lote.length === 0) return
  const nomes = lote.map((item) => item.name)
  buscarLote(nomes)
    .then((resultado) => {
      gravarCache(Object.fromEntries(resultado))
      for (const { name: nome, resolver } of lote) resolver(resultado.get(nome) ?? null)
    })
    .catch(() => {
      for (const { resolver } of lote) resolver(null)
    })
}

export function carregarIcone(nome: string): Promise<IconeRemotoDados | null> {
  if (!NOME_VALIDO.test(nome)) return Promise.resolve(null)
  const existente = emMemoria.get(nome)
  if (existente) return existente

  const cache = lerCache()
  const salvo = Object.hasOwn(cache, nome) && dadosValidos(cache[nome]) ? cache[nome] : null
  const promessa = salvo
    ? Promise.resolve(salvo)
    : new Promise<IconeRemotoDados | null>((resolver) => {
        fila.push({ name: nome, resolver })
        if (fila.length === 1) queueMicrotask(descarregarFila)
      })
  emMemoria.set(nome, promessa)
  return promessa
}

export async function buscarIcones(consulta: string, sinal?: AbortSignal): Promise<string[]> {
  const url = `${HOST}/search?query=${encodeURIComponent(consulta)}&prefix=${PREFIXO}&limit=96`
  const resposta = await fetch(url, { signal: sinal })
  if (!resposta.ok) throw new Error(`Iconify respondeu ${resposta.status}`)
  const json = (await resposta.json()) as { icons?: string[] }
  return [
    ...new Set((json.icons ?? []).map(nomeDoResultado).filter((n): n is string => n !== null)),
  ]
}

export function limparCacheDeIcones() {
  emMemoria.clear()
  fila = []
  try {
    localStorage.removeItem(CHAVE_CACHE)
  } catch {
    void 0
  }
}
