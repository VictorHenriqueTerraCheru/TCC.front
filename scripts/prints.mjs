import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { setTimeout as esperar } from 'node:timers/promises'

import { chromium } from 'playwright'

const SAIDA = 'prints'
const API = process.env.PRINTS_API ?? '/api/v1'
const SENHA = process.env.PRINTS_SENHA ?? 'tcc12345'
const NAVEGADOR = process.env.PRINTS_NAVEGADOR ?? 'chrome'
const CENTRO = { lat: -22.905, lng: -43.109 }
const POSICAO = { latitude: -22.9062, longitude: -43.1086, accuracy: 15 }
const CELULAR = { width: 390, height: 844 }
const DESKTOP = { width: 1440, height: 900 }
const AGORA_FIXO = new Date('2026-10-29T15:00:00-03:00').valueOf()

const servidor = process.env.PRINTS_URL ? null : await subirViteComMocks()
const BASE = process.env.PRINTS_URL ?? servidor.url

await mkdir(`${SAIDA}/claro`, { recursive: true })
await mkdir(`${SAIDA}/escuro`, { recursive: true })
const navegador = await chromium.launch({
  ...(NAVEGADOR === 'chromium' ? {} : { channel: NAVEGADOR }),
  args: ['--disable-gpu', '--force-color-profile=srgb'],
})
const erros = []

try {
  const dados = await descobrirDados()

  await capturar('00-escolha-tema', '/map', { primeiraVez: true })
  for (const tema of ['claro', 'escuro']) {
    await capturarTudo(dados, tema)
  }

  if (erros.length) console.warn('\nErros no console do navegador:\n' + erros.join('\n'))
  console.log(`\nPrints em ${SAIDA}/`)
} finally {
  await navegador.close()
  servidor?.parar()
}

async function capturarTudo(dados, tema) {
  const capturar = (nome, rota, opcoes = {}) =>
    capturarTela(`${tema}/${nome}`, rota, { ...opcoes, tema })
  await capturar('01-mapa-ambos-legenda', '/map?mode=both', { legenda: true })
  await capturar('02-detalhe-alta', `/map/issue/${dados.alta.id}`)
  await capturar('03-detalhe-nova', `/map/issue/${dados.nova.id}`)
  await capturar(
    '04-area-incidentes',
    `/map/area?mode=both&lat=${dados.calor.lat}&lng=${dados.calor.lng}`,
  )
  await capturar('05-registro-duplicata', '/report/duplicate-check', {
    usuario: 'cidadao1',
    rascunho: {
      categoryId: dados.alta.categoryId,
      location: { lat: dados.alta.lat + 0.0001, lng: dados.alta.lng + 0.0001 },
    },
  })
  await capturar('06-registro-incidente', '/report/incident/review', {
    usuario: 'cidadao1',
    rascunho: {
      categoryId: dados.incidente.id,
      location: { lat: dados.calor.lat, lng: dados.calor.lng },
      description: 'Celular levado na saída do metrô, por volta das 19h.',
    },
  })
  await capturar('07-recentes', '/recent')
  await capturar('08-perfil-verificacao', '/profile', { usuario: 'cidadao1' })
  await capturar('09-fila-admin', '/admin/verifications', { usuario: 'admin' })
  await capturar('10-cadastro', '/register')
  await capturar('10b-login', '/login')
  await capturar('11-desktop-mapa-painel', `/map/issue/${dados.alta.id}?mode=both`, {
    tela: DESKTOP,
  })
}

function capturar(nome, rota, opcoes) {
  return capturarTela(nome, rota, opcoes)
}

async function capturarTela(
  nome,
  rota,
  { usuario, rascunho, legenda = false, tela = CELULAR, tema = 'claro', primeiraVez = false } = {},
) {
  const contexto = await novoContexto(tela)
  const sessao = usuario ? await entrar(contexto, usuario) : null
  await contexto.addInitScript(
    ({ sessao, rascunho, legenda, tema, primeiraVez }) => {
      if (!legenda) localStorage.setItem('urbanReports.legendSeen', '1')
      if (!primeiraVez)
        localStorage.setItem(
          'urbanReports.theme',
          JSON.stringify({
            state: { preference: tema === 'claro' ? 'light' : 'dark', chosen: true },
            version: 0,
          }),
        )
      if (sessao)
        localStorage.setItem(
          'urbanReports.session',
          JSON.stringify({ state: { session: sessao }, version: 0 }),
        )
      if (rascunho) {
        const estado = { description: '', time: { mode: 'now', otherAt: null }, ...rascunho }
        sessionStorage.setItem(
          'urbanReports.reportDraft',
          JSON.stringify({ state: estado, version: 0 }),
        )
      }
    },
    { sessao, rascunho, legenda, tema, primeiraVez },
  )
  const pagina = await contexto.newPage()
  pagina.on('pageerror', (erro) => erros.push(`${nome}: ${erro.message}`))
  await pagina.goto(BASE + rota)
  await pagina.waitForLoadState('networkidle')
  await esperar(2500)
  await esperarAnimacoes(pagina)
  await esperarPaginaEstavel(pagina)
  if (new URL(pagina.url()).pathname !== new URL(BASE + rota).pathname) {
    console.warn(`${nome}: a rota ${rota} redirecionou para ${pagina.url()}`)
  }
  await pagina.screenshot({
    path: `${SAIDA}/${nome}.png`,
    animations: 'disabled',
    caret: 'hide',
  })
  console.log(`✓ ${nome}`)
  await contexto.close()
}

async function esperarAnimacoes(pagina) {
  await pagina.evaluate(async () => {
    for (let tentativa = 0; tentativa < 5; tentativa++) {
      const animacoes = document
        .getAnimations({ subtree: true })
        .filter(
          (animacao) =>
            animacao.playState !== 'finished' &&
            animacao.effect?.getTiming().iterations !== Infinity,
        )
      if (!animacoes.length) return
      await Promise.all(animacoes.map((animacao) => animacao.finished.catch(() => undefined)))
    }
  })
}

async function esperarPaginaEstavel(pagina) {
  const estabilizou = await pagina.evaluate(async () => {
    await document.fonts.ready
    const proximoFrame = () => new Promise(requestAnimationFrame)
    const folha = document.querySelector('[data-slot="drawer-content"]')
    if (!folha) {
      await proximoFrame()
      return true
    }

    let quadroAnterior = ''
    let quadrosEstaveis = 0
    for (let tentativa = 0; tentativa < 120; tentativa++) {
      await proximoFrame()
      const retangulo = folha.getBoundingClientRect()
      const quadro = `${getComputedStyle(folha).transform}:${retangulo.top}:${retangulo.height}`
      quadrosEstaveis = quadro === quadroAnterior ? quadrosEstaveis + 1 : 0
      if (quadrosEstaveis === 4) return true
      quadroAnterior = quadro
    }
    return false
  })

  if (!estabilizou) throw new Error('A folha não estabilizou antes da captura.')
}

async function novoContexto(tela) {
  const celular = tela.width < 1024
  const contexto = await navegador.newContext({
    viewport: tela,
    deviceScaleFactor: 2,
    isMobile: celular,
    hasTouch: celular,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    reducedMotion: 'reduce',
    permissions: ['geolocation'],
    geolocation: POSICAO,
  })
  await contexto.addInitScript((agora) => {
    const DateReal = Date
    class DateFixa extends DateReal {
      constructor(...argumentos) {
        super(...(argumentos.length ? argumentos : [agora]))
      }

      static now() {
        return agora
      }
    }
    globalThis.Date = DateFixa
  }, AGORA_FIXO)
  return contexto
}

async function entrar(contexto, usuario) {
  const pagina = await abrirApp(contexto)
  const resposta = await chamarApi(pagina, '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `${usuario}@tcc.local`, password: SENHA }),
  })
  await pagina.close()
  const { token, expiresAt, user } = resposta
  return { token, expiresAt, user }
}

async function descobrirDados() {
  const contexto = await novoContexto(CELULAR)
  const pagina = await abrirApp(contexto)
  const area = `minLat=${CENTRO.lat - 0.02}&minLng=${CENTRO.lng - 0.02}&maxLat=${CENTRO.lat + 0.02}&maxLng=${CENTRO.lng + 0.02}`
  const [problemas, celulas, categorias] = await Promise.all([
    chamarApi(pagina, `/issues?${area}`),
    chamarApi(pagina, `/incidents/heatmap?${area}&days=7`),
    chamarApi(pagina, '/categories'),
  ])
  await contexto.close()

  const alta = problemas
    .filter((p) => p.band === 'high')
    .sort((a, b) => b.trustScore - a.trustScore)[0]
  const nova = problemas.find((p) => p.status === 'new')
  const calor = [...celulas].sort((a, b) => b.count - a.count)[0]
  const incidente = categorias.find((c) => c.type === 'incident')
  const faltando = Object.entries({ alta, nova, calor, incidente }).filter(([, valor]) => !valor)
  if (faltando.length) {
    throw new Error(
      `Faltam dados perto de Botafogo para os prints: ${faltando.map(([nome]) => nome).join(', ')}`,
    )
  }
  return { alta, nova, calor, incidente }
}

async function abrirApp(contexto) {
  const pagina = await contexto.newPage()
  await pagina.goto(BASE + '/login')
  await pagina.locator('#root > *').first().waitFor()
  return pagina
}

async function chamarApi(pagina, caminho, init) {
  const { status, corpo } = await pagina.evaluate(
    async ([url, init]) => {
      const resposta = await fetch(url, init)
      return { status: resposta.status, corpo: await resposta.text() }
    },
    [API + caminho, init],
  )
  if (status >= 400) throw new Error(`${status} em ${caminho}: ${corpo}`)
  return JSON.parse(corpo)
}

async function subirViteComMocks() {
  const porta = 5199
  const processo = spawn(
    process.execPath,
    ['node_modules/vite/bin/vite.js', '--port', String(porta), '--strictPort'],
    { env: { ...process.env, VITE_USE_MOCKS: 'true' }, stdio: 'ignore' },
  )
  const url = `http://localhost:${porta}`
  for (let tentativa = 0; tentativa < 60; tentativa++) {
    if (processo.exitCode !== null) throw new Error('O Vite encerrou antes de subir.')
    const pronto = await fetch(url).then(
      (r) => r.ok,
      () => false,
    )
    if (pronto) return { url, parar: () => processo.kill() }
    await esperar(500)
  }
  processo.kill()
  throw new Error(`O Vite não respondeu em ${url}.`)
}
