import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { setTimeout as delay } from 'node:timers/promises'

import { chromium } from 'playwright'

const OUTPUT = 'prints'
const API = process.env.PRINTS_API ?? '/api/v1'
const PASSWORD = process.env.PRINTS_PASSWORD ?? 'tcc12345'
const BROWSER = process.env.PRINTS_BROWSER ?? 'chrome'
const CENTER = { lat: -22.905, lng: -43.109 }
const POSITION = { latitude: -22.9062, longitude: -43.1086, accuracy: 15 }
const MOBILE = { width: 390, height: 844 }
const DESKTOP = { width: 1440, height: 900 }
const FIXED_NOW = new Date('2026-10-29T15:00:00-03:00').valueOf()

const server = process.env.PRINTS_URL ? null : await startViteWithMocks()
const BASE = process.env.PRINTS_URL ?? server.url

await mkdir(`${OUTPUT}/light`, { recursive: true })
await mkdir(`${OUTPUT}/dark`, { recursive: true })
const browser = await chromium.launch({
  ...(BROWSER === 'chromium' ? {} : { channel: BROWSER }),
  args: ['--disable-gpu', '--force-color-profile=srgb'],
})
const errors = []

try {
  const unwrapData = await discoverData()

  await capture('00-choose-theme', '/map', { firstTime: true })
  for (const theme of ['light', 'dark']) {
    await captureAll(unwrapData, theme)
  }

  if (errors.length) console.warn('\nBrowser console errors:\n' + errors.join('\n'))
  console.log(`\nPrints in ${OUTPUT}/`)
} finally {
  await browser.close()
  server?.stop()
}

async function captureAll(unwrapData, theme) {
  const capture = (name, route, options = {}) =>
    captureScreen(`${theme}/${name}`, route, { ...options, theme })
  await capture('01-map-both-legend', '/map?mode=both', { legend: true })
  await capture('02-detail-high', `/map/issue/${unwrapData.high.id}`)
  await capture('03-detail-new', `/map/issue/${unwrapData.fresh.id}`)
  await capture(
    '04-incident-area',
    `/map/area?mode=both&lat=${unwrapData.heatmap.lat}&lng=${unwrapData.heatmap.lng}`,
  )
  await capture('05-report-duplicate', '/report/duplicate-check', {
    account: 'cidadao1',
    draft: {
      categoryId: unwrapData.high.categoryId,
      location: { lat: unwrapData.high.lat + 0.0001, lng: unwrapData.high.lng + 0.0001 },
    },
  })
  await capture('06-report-incident', '/report/incident/review', {
    account: 'cidadao1',
    draft: {
      categoryId: unwrapData.incident.id,
      location: { lat: unwrapData.heatmap.lat, lng: unwrapData.heatmap.lng },
      description: 'Celular levado na saída do metrô, por volta das 19h.',
    },
  })
  await capture('07-recent', '/recent')
  await capture('08-profile-verification', '/profile', { account: 'cidadao1' })
  await capture('09-admin-queue', '/admin/verifications', { account: 'admin' })
  await capture('10-register', '/register')
  await capture('10b-login', '/login')
  await capture('11-desktop-map-panel', `/map/issue/${unwrapData.high.id}?mode=both`, {
    device: DESKTOP,
  })
}

function capture(name, route, options) {
  return captureScreen(name, route, options)
}

async function captureScreen(
  name,
  route,
  { account, draft, legend = false, device = MOBILE, theme = 'light', firstTime = false } = {},
) {
  const context = await newContext(device)
  const session = account ? await login(context, account) : null
  await context.addInitScript(
    ({ session, draft, legend, theme, firstTime }) => {
      if (!legend) localStorage.setItem('urbanReports.legendSeen', '1')
      if (!firstTime)
        localStorage.setItem(
          'urbanReports.theme',
          JSON.stringify({
            state: { preference: theme, chosen: true },
            version: 0,
          }),
        )
      if (session)
        localStorage.setItem(
          'urbanReports.session',
          JSON.stringify({ state: { session: session }, version: 0 }),
        )
      if (draft) {
        const state = { description: '', time: { mode: 'now', otherAt: null }, ...draft }
        sessionStorage.setItem(
          'urbanReports.reportDraft',
          JSON.stringify({ state: state, version: 0 }),
        )
      }
    },
    { session, draft, legend, theme, firstTime },
  )
  const page = await context.newPage()
  page.on('pageerror', (error) => errors.push(`${name}: ${error.message}`))
  await page.goto(BASE + route)
  await page.waitForLoadState('networkidle')
  await delay(2500)
  await waitForAnimations(page)
  await waitForStablePage(page)
  if (new URL(page.url()).pathname !== new URL(BASE + route).pathname) {
    console.warn(`${name}: a rota ${route} redirected to ${page.url()}`)
  }
  await page.screenshot({
    path: `${OUTPUT}/${name}.png`,
    animations: 'disabled',
    caret: 'hide',
  })
  console.log(`✓ ${name}`)
  await context.close()
}

async function waitForAnimations(page) {
  await page.evaluate(async () => {
    for (let attempt = 0; attempt < 5; attempt++) {
      const animations = document
        .getAnimations({ subtree: true })
        .filter(
          (animation) =>
            animation.playState !== 'finished' &&
            animation.effect?.getTiming().iterations !== Infinity,
        )
      if (!animations.length) return
      await Promise.all(animations.map((animation) => animation.finished.catch(() => undefined)))
    }
  })
}

async function waitForStablePage(page) {
  const stabilized = await page.evaluate(async () => {
    await document.fonts.ready
    const nextFrame = () => new Promise(requestAnimationFrame)
    const sheet = document.querySelector('[data-slot="drawer-content"]')
    if (!sheet) {
      await nextFrame()
      return true
    }

    let previousFrame = ''
    let stableFrames = 0
    for (let attempt = 0; attempt < 120; attempt++) {
      await nextFrame()
      const bounds = sheet.getBoundingClientRect()
      const frame = `${getComputedStyle(sheet).transform}:${bounds.top}:${bounds.height}`
      stableFrames = frame === previousFrame ? stableFrames + 1 : 0
      if (stableFrames === 4) return true
      previousFrame = frame
    }
    return false
  })

  if (!stabilized) throw new Error('The sheet did not settle before the capture.')
}

async function newContext(device) {
  const mobile = device.width < 1024
  const context = await browser.newContext({
    viewport: device,
    deviceScaleFactor: 2,
    isMobile: mobile,
    hasTouch: mobile,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    reducedMotion: 'reduce',
    permissions: ['geolocation'],
    geolocation: POSITION,
  })
  await context.addInitScript((now) => {
    const RealDate = Date
    class FixedDate extends RealDate {
      constructor(...cliArgs) {
        super(...(cliArgs.length ? cliArgs : [now]))
      }

      static now() {
        return now
      }
    }
    globalThis.Date = FixedDate
  }, FIXED_NOW)
  return context
}

async function login(context, account) {
  const page = await openApp(context)
  const response = await callApi(page, '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `${account}@tcc.local`, password: PASSWORD }),
  })
  await page.close()
  const { token, expiresAt, user } = response
  return { token, expiresAt, user }
}

async function discoverData() {
  const context = await newContext(MOBILE)
  const page = await openApp(context)
  const area = `minLat=${CENTER.lat - 0.02}&minLng=${CENTER.lng - 0.02}&maxLat=${CENTER.lat + 0.02}&maxLng=${CENTER.lng + 0.02}`
  const [issues, cells, categories] = await Promise.all([
    callApi(page, `/issues?${area}`),
    callApi(page, `/incidents/heatmap?${area}&days=7`),
    callApi(page, '/categories'),
  ])
  await context.close()

  const high = issues
    .filter((p) => p.band === 'high')
    .sort((a, b) => b.trustScore - a.trustScore)[0]
  const fresh = issues.find((p) => p.status === 'new')
  const heatmap = [...cells].sort((a, b) => b.count - a.count)[0]
  const incident = categories.find((c) => c.type === 'incident')
  const missing = Object.entries({ high, fresh, heatmap, incident }).filter(([, value]) => !value)
  if (missing.length) {
    throw new Error(
      `Missing data near Icaraí for the prints: ${missing.map(([name]) => name).join(', ')}`,
    )
  }
  return { high, fresh, heatmap, incident }
}

async function openApp(context) {
  const page = await context.newPage()
  await page.goto(BASE + '/login')
  await page.locator('#root > *').first().waitFor()
  return page
}

async function callApi(page, path, init) {
  const { status, body } = await page.evaluate(
    async ([url, init]) => {
      const response = await fetch(url, init)
      return { status: response.status, body: await response.text() }
    },
    [API + path, init],
  )
  if (status >= 400) throw new Error(`${status} em ${path}: ${body}`)
  return JSON.parse(body)
}

async function startViteWithMocks() {
  const port = 5199
  const viteProcess = spawn(
    process.execPath,
    ['node_modules/vite/bin/vite.js', '--port', String(port), '--strictPort'],
    { env: { ...process.env, VITE_USE_MOCKS: 'true' }, stdio: 'ignore' },
  )
  const url = `http://localhost:${port}`
  for (let attempt = 0; attempt < 60; attempt++) {
    if (viteProcess.exitCode !== null) throw new Error('Vite exited before starting.')
    const ready = await fetch(url).then(
      (r) => r.ok,
      () => false,
    )
    if (ready) return { url, stop: () => viteProcess.kill() }
    await delay(500)
  }
  viteProcess.kill()
  throw new Error(`Vite did not respond within ${url}.`)
}
