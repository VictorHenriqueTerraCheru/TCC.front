// Ícones Material Symbols fora do pacote embutido (src/assets/material-symbols), buscados no
// Iconify só quando uma categoria criada pelo admin usa um deles. Só o nome do ícone sai do app.
//
// O Iconify é terceiro: o que ele devolve nunca vira HTML. Só `<path d="…">` com `d` num charset
// de comandos SVG é aceito e vira elemento React; qualquer outra coisa descarta o ícone.

const HOST = 'https://api.iconify.design'
const PREFIXO = 'material-symbols'
const CHAVE_CACHE = 'ocorrencias.iconesRemotos'
const D_VALIDO = /^[MmLlHhVvCcSsQqTtAaZz0-9eE+\-.,\s]+$/
const TAMANHO_MAXIMO_D = 4000
const TAMANHO_MAXIMO_VIEWBOX = 512
const TEMPO_LIMITE_MS = 8000
const NOME_VALIDO = /^[a-z0-9_-]+$/

export interface IconeRemotoDados {
  /** Atributos `d` dos `<path>`, na ordem. */
  caminhos: string[]
  /** Lado do quadrado do viewBox. */
  tamanho: number
}

/** `edit_road` → `edit-road-rounded`: nome do ícone Rounded no Iconify. */
export function nomeNoIconify(nome: string) {
  return `${nome.replaceAll('_', '-')}-rounded`
}

/** `material-symbols:edit-road-rounded` → `edit_road`; outro estilo (outline, sharp, fill) → null. */
export function nomeDoResultado(id: string): string | null {
  const [prefixo, nome] = id.split(':')
  if (prefixo !== PREFIXO || !nome?.endsWith('-rounded') || nome.endsWith('-outline-rounded')) {
    return null
  }
  return nome.slice(0, -'-rounded'.length).replaceAll('-', '_')
}

/** Extrai os caminhos de um `body` do Iconify; null se tiver qualquer coisa além de `<path d>` válido. */
export function caminhosDoCorpo(corpo: string): string[] | null {
  const caminhos: string[] = []
  const resto = corpo.replace(/<path\b([^>]*?)\/?>/g, (_, atributos: string) => {
    const d = /(?:^|\s)d="([^"]*)"/.exec(atributos)?.[1]
    if (d && d.length <= TAMANHO_MAXIMO_D && D_VALIDO.test(d)) caminhos.push(d)
    return ''
  })
  return resto.trim() === '' && caminhos.length > 0 ? caminhos : null
}

/** Mesma exigência para o que vem da rede e para o que volta do localStorage (que o usuário pode editar). */
function dadosValidos(valor: unknown): valor is IconeRemotoDados {
  if (typeof valor !== 'object' || valor === null) return false
  const { caminhos, tamanho } = valor as Partial<IconeRemotoDados>
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
    // Sem localStorage (modo privado, cota): só perde o cache entre sessões.
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
let fila: { nome: string; resolver(dados: IconeRemotoDados | null): void }[] = []

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
    const dados = { caminhos: caminhos ?? [], tamanho: icone?.width ?? json.width ?? 24 }
    if (dadosValidos(dados)) resultado.set(nome, dados)
  }
  return resultado
}

function descarregarFila() {
  const lote = fila
  fila = []
  if (lote.length === 0) return
  const nomes = lote.map((item) => item.nome)
  buscarLote(nomes)
    .then((resultado) => {
      gravarCache(Object.fromEntries(resultado))
      for (const { nome, resolver } of lote) resolver(resultado.get(nome) ?? null)
    })
    .catch(() => {
      for (const { resolver } of lote) resolver(null)
    })
}

/**
 * Dados do ícone: memória, depois localStorage, depois rede (vários pedidos do mesmo instante
 * viajam em uma requisição só). Falha vira null e não é repetida na sessão.
 */
export function carregarIcone(nome: string): Promise<IconeRemotoDados | null> {
  // O nome vem da API e vai para a URL de um terceiro: só o charset dos nomes Material Symbols.
  if (!NOME_VALIDO.test(nome)) return Promise.resolve(null)
  const existente = emMemoria.get(nome)
  if (existente) return existente

  const cache = lerCache()
  const salvo = Object.hasOwn(cache, nome) && dadosValidos(cache[nome]) ? cache[nome] : null
  const promessa = salvo
    ? Promise.resolve(salvo)
    : new Promise<IconeRemotoDados | null>((resolver) => {
        fila.push({ nome, resolver })
        if (fila.length === 1) queueMicrotask(descarregarFila)
      })
  emMemoria.set(nome, promessa)
  return promessa
}

/** Busca por palavra no catálogo Material Symbols (estilo Rounded), para o seletor do admin. */
export async function buscarIcones(consulta: string, sinal?: AbortSignal): Promise<string[]> {
  const url = `${HOST}/search?query=${encodeURIComponent(consulta)}&prefix=${PREFIXO}&limit=96`
  const resposta = await fetch(url, { signal: sinal })
  if (!resposta.ok) throw new Error(`Iconify respondeu ${resposta.status}`)
  const json = (await resposta.json()) as { icons?: string[] }
  return [
    ...new Set((json.icons ?? []).map(nomeDoResultado).filter((n): n is string => n !== null)),
  ]
}

/** Só para testes: esquece o que foi carregado. */
export function limparCacheDeIcones() {
  emMemoria.clear()
  fila = []
  try {
    localStorage.removeItem(CHAVE_CACHE)
  } catch {
    // ignorado
  }
}
