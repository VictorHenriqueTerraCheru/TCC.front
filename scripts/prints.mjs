// Prints do app para a Seção 5.3.3 do TCC (Playwright; não é suíte de testes).
//
//   npm run prints                                  → sobe o Vite com a API falsa (MSW) e captura
//   PRINTS_URL=https://app.exemplo npm run prints   → captura o ambiente publicado
//
// Variáveis opcionais:
//   PRINTS_API        base da API vista pelo navegador (padrão: /api/v1 na mesma origem;
//                     no ambiente publicado, o mesmo valor do VITE_API_URL)
//   PRINTS_SENHA      senha dos usuários do seed (padrão: tcc12345)
//   PRINTS_NAVEGADOR  canal do Playwright (padrão: chrome, o Google Chrome instalado;
//                     use "chromium" depois de `npx playwright install chromium`)
//
// Saída: prints/claro/ e prints/escuro/ (fora do git), uma volta por tema. Usa só os usuários e dados do seed, sem dados pessoais reais.
import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { setTimeout as esperar } from 'node:timers/promises'

import { chromium } from 'playwright'

const SAIDA = 'prints'
const API = process.env.PRINTS_API ?? '/api/v1'
const SENHA = process.env.PRINTS_SENHA ?? 'tcc12345'
const NAVEGADOR = process.env.PRINTS_NAVEGADOR ?? 'chrome'
// Botafogo (CENTRO_PADRAO do app); o usuário fica ~130 m ao sul para aparecer "você está a X m".
const CENTRO = { lat: -22.9519, lng: -43.1866 }
const POSICAO = { latitude: -22.9531, longitude: -43.1862, accuracy: 15 }
const CELULAR = { width: 390, height: 844 }
const DESKTOP = { width: 1440, height: 900 }

const servidor = process.env.PRINTS_URL ? null : await subirViteComMocks()
const BASE = process.env.PRINTS_URL ?? servidor.url

await mkdir(`${SAIDA}/claro`, { recursive: true })
await mkdir(`${SAIDA}/escuro`, { recursive: true })
const navegador = await chromium.launch(NAVEGADOR === 'chromium' ? {} : { channel: NAVEGADOR })
const erros = []

try {
  const dados = await descobrirDados()

  await capturar('00-escolha-tema', '/mapa', { primeiraVez: true })
  for (const tema of ['claro', 'escuro']) {
    await capturarTudo(dados, tema)
  }

  if (erros.length) console.warn('\nErros no console do navegador:\n' + erros.join('\n'))
  console.log(`\nPrints em ${SAIDA}/`)
} finally {
  await navegador.close()
  servidor?.parar()
}

/** As telas do TCC num tema; os arquivos vão para prints/<tema>/. */
async function capturarTudo(dados, tema) {
  const capturar = (nome, rota, opcoes = {}) =>
    capturarTela(`${tema}/${nome}`, rota, { ...opcoes, tema })
  await capturar('01-mapa-ambos-legenda', '/mapa?modo=ambos', { legenda: true })
  await capturar('02-detalhe-alta', `/mapa/problema/${dados.alta.id}`)
  await capturar('03-detalhe-nova', `/mapa/problema/${dados.nova.id}`)
  await capturar(
    '04-area-incidentes',
    `/mapa/area?modo=ambos&lat=${dados.calor.lat}&lng=${dados.calor.lng}`,
  )
  // Registro: o rascunho (sessionStorage) já vem preenchido, como se o usuário tivesse feito os passos.
  await capturar('05-registro-duplicata', '/registrar/conferencia', {
    usuario: 'cidadao1',
    rascunho: {
      categoriaId: dados.alta.categoriaId,
      // ~15 m do problema existente da mesma categoria: cai no raio de duplicatas (50 m).
      local: { lat: dados.alta.lat + 0.0001, lng: dados.alta.lng + 0.0001 },
    },
  })
  await capturar('06-registro-incidente', '/registrar/incidente/revisao', {
    usuario: 'cidadao1',
    rascunho: {
      categoriaId: dados.incidente.id,
      local: { lat: dados.calor.lat, lng: dados.calor.lng },
      descricao: 'Celular levado na saída do metrô, por volta das 19h.',
    },
  })
  await capturar('07-recentes', '/recentes')
  await capturar('08-perfil-verificacao', '/perfil', { usuario: 'cidadao1' })
  await capturar('09-fila-admin', '/admin/verificacoes', { usuario: 'admin' })
  await capturar('10-cadastro', '/cadastro')
  await capturar('10b-login', '/login')
  await capturar('11-desktop-mapa-painel', `/mapa/problema/${dados.alta.id}?modo=ambos`, {
    tela: DESKTOP,
  })
}

/** Primeira abertura (escolha do tema), fora das voltas por tema. */
function capturar(nome, rota, opcoes) {
  return capturarTela(nome, rota, opcoes)
}

/** Abre uma rota com sessão, posição, rascunho e tema prontos e salva o print. */
async function capturarTela(
  nome,
  rota,
  { usuario, rascunho, legenda = false, tela = CELULAR, tema = 'claro', primeiraVez = false } = {},
) {
  const contexto = await novoContexto(tela)
  const sessao = usuario ? await entrar(contexto, usuario) : null
  await contexto.addInitScript(
    ({ sessao, rascunho, legenda, tema, primeiraVez }) => {
      if (!legenda) localStorage.setItem('ocorrencias.legendaVista', '1')
      if (!primeiraVez)
        localStorage.setItem(
          'ocorrencias.tema',
          JSON.stringify({ state: { preferencia: tema, escolhido: true }, version: 0 }),
        )
      if (sessao)
        localStorage.setItem(
          'ocorrencias.sessao',
          JSON.stringify({ state: { sessao }, version: 0 }),
        )
      if (rascunho) {
        const estado = { descricao: '', horario: { modo: 'agora', outroEm: null }, ...rascunho }
        sessionStorage.setItem(
          'ocorrencias.rascunhoRegistro',
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
  // Folhas (vaul) animam e os tiles do mapa terminam de pintar depois do networkidle.
  await esperar(1200)
  if (new URL(pagina.url()).pathname !== new URL(BASE + rota).pathname) {
    console.warn(`${nome}: a rota ${rota} redirecionou para ${pagina.url()}`)
  }
  await pagina.screenshot({ path: `${SAIDA}/${nome}.png` })
  console.log(`✓ ${nome}`)
  await contexto.close()
}

function novoContexto(tela) {
  const celular = tela.width < 1024
  return navegador.newContext({
    viewport: tela,
    deviceScaleFactor: 2,
    isMobile: celular,
    hasTouch: celular,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    permissions: ['geolocation'],
    geolocation: POSICAO,
  })
}

/** Login pela página (a API falsa só existe dentro do navegador, no service worker do MSW). */
async function entrar(contexto, usuario) {
  const pagina = await abrirApp(contexto)
  const resposta = await chamarApi(pagina, '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `${usuario}@tcc.local`, senha: SENHA }),
  })
  await pagina.close()
  const { token, expiraEm, usuario: dados } = resposta
  return { token, expiraEm, usuario: dados }
}

/** Escolhe os problemas, a categoria de incidente e a área mais quente a partir dos dados da API. */
async function descobrirDados() {
  const contexto = await novoContexto(CELULAR)
  const pagina = await abrirApp(contexto)
  const area = `minLat=${CENTRO.lat - 0.02}&minLng=${CENTRO.lng - 0.02}&maxLat=${CENTRO.lat + 0.02}&maxLng=${CENTRO.lng + 0.02}`
  const [problemas, celulas, categorias] = await Promise.all([
    chamarApi(pagina, `/problemas?${area}`),
    chamarApi(pagina, `/incidentes/calor?${area}&dias=7`),
    chamarApi(pagina, '/categorias'),
  ])
  await contexto.close()

  const alta = problemas
    .filter((p) => p.faixa === 'alta')
    .sort((a, b) => b.confianca - a.confianca)[0]
  const nova = problemas.find((p) => p.status === 'nova')
  const calor = [...celulas].sort((a, b) => b.quantidade - a.quantidade)[0]
  const incidente = categorias.find((c) => c.tipo === 'incidente')
  const faltando = Object.entries({ alta, nova, calor, incidente }).filter(([, valor]) => !valor)
  if (faltando.length) {
    throw new Error(
      `Faltam dados perto de Botafogo para os prints: ${faltando.map(([nome]) => nome).join(', ')}`,
    )
  }
  return { alta, nova, calor, incidente }
}

/**
 * Abre o app e espera ele renderizar. No modo com mocks o main.tsx só renderiza depois de o MSW
 * subir; antes disso, um fetch passaria direto para o proxy do Vite (API real).
 */
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

/** Vite em outra porta, com VITE_USE_MOCKS=true, para não depender da API nem do banco local. */
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
