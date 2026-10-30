import { execFileSync } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { setTimeout as delay } from 'node:timers/promises'

import { chromium } from 'playwright'

const BASE = process.env.E2E_URL ?? 'http://localhost:5173'
const DB = process.env.E2E_DB ?? 'tccback-db-1'
const PASSWORD = process.env.E2E_PASSWORD ?? 'tcc12345'
const BROWSER = process.env.E2E_BROWSER ?? 'chrome'
const VISIBLE = process.env.E2E_HEADED === '1'
const OUTPUT = 'prints/e2e'
const MOBILE = { width: 390, height: 844 }
const DESKTOP = { width: 1440, height: 900 }

const jitter = () => (Math.random() - 0.5) * 0.006
const POSITION = { latitude: -22.9519 + jitter(), longitude: -43.1866 + jitter(), accuracy: 10 }
const RUN_ID = new Date().toISOString().replace(/\D/g, '').slice(0, 14)
const NEW = {
  name: `Teste E2E ${RUN_ID}`,
  email: `e2e-${RUN_ID}@tcc.local`,
  password: 'senha-e2e-123',
}
const DESCRIPTION = `Buraco aberto perto do meio-fio (e2e ${RUN_ID}).`

const results = []
const apiErrors = []
const consoleErrors = []
const state = {}

await mkdir(OUTPUT, { recursive: true })
await checkEnvironment()
const browser = await chromium.launch({
  ...(BROWSER === 'chromium' ? {} : { channel: BROWSER }),
  headless: !VISIBLE,
  slowMo: VISIBLE ? 250 : 0,
})

try {
  const guest = await newPage('guest', MOBILE, { firstTime: true })
  const p = guest.page

  await step(
    'Guest opens the app, picks the dark theme and goes through the pre-permission',
    p,
    async () => {
      await p.goto(BASE + '/map')
      await p.getByRole('heading', { name: 'Escolha a aparência' }).waitFor()
      const system = p.getByRole('radio', { name: /Automático/ })
      assert((await system.getAttribute('aria-checked')) === 'true', 'Automático was not checked')
      await p.getByRole('radio', { name: /Escuro/ }).click()
      const theme = await p.evaluate(() => document.documentElement.dataset.theme)
      assert(theme === 'dark', `the theme did not change immediately (data-theme=${theme})`)
      await p.getByRole('button', { name: 'Continuar' }).click()
      await p.waitForURL(/location-permission|map/)
      if (p.url().includes('location-permission')) {
        await p.getByRole('button', { name: 'Continuar' }).click()
      }
      await p.waitForURL(/\/map/)
    },
  )

  await step('Map loads the markers from the API (GET /issues)', p, async () => {
    const response = await p.waitForResponse((r) => /\/api\/v1\/issues\?/.test(r.url()))
    assert(response.status() === 200, `GET /issues answered ${response.status()}`)
    const body = await response.json()
    await p.locator('[data-issue]').first().waitFor()
    const markers = await p.locator('[data-issue]').count()
    assert(markers > 0, 'no marker on screen')
    return `${body.length} from the API, ${markers} on screen`
  })

  await step('Guest taps an alert and sees the quick card with API data', p, async () => {
    await p.locator('[data-issue]').first().click({ force: true })
    await p.waitForURL(/\/map\/issue\//)
    state.seedIssue = p.url().split('/map/issue/')[1].split('?')[0]
    const card = p.getByRole('region', { name: 'Resumo do alerta' })
    await card.waitFor()
    return `issue ${state.seedIssue.slice(0, 8)} · ${await card.locator('h2').innerText()}`
  })

  await step('Voting as a guest opens the "Entre para votar" sheet', p, async () => {
    await p
      .getByRole('button', { name: /^Voto rápido/ })
      .first()
      .click()
    await p.getByRole('button', { name: 'Criar conta' }).waitFor()
  })

  await step(
    'Signing up from the sheet creates the account, returns to the alert and the vote is sent on the next tap',
    p,
    async () => {
      await p.getByRole('button', { name: 'Criar conta' }).click()
      await p.waitForURL(/\/register/)
      await p.getByLabel('Nome').fill(NEW.name)
      await p.getByLabel('E-mail').fill(NEW.email)
      await p.getByLabel('Senha', { exact: true }).fill(NEW.password)
      await p.locator('#accepted-terms').check()
      await p.getByRole('button', { name: /criar conta/i }).click()
      await p.waitForURL(new RegExp(`/map/issue/${state.seedIssue}`))
      const voted = p.waitForResponse(
        (r) => /\/vote$/.test(r.url()) && r.request().method() === 'PUT',
      )
      await p
        .getByRole('button', { name: /^Voto rápido/ })
        .first()
        .click()
      const response = await voted
      assert(response.ok(), `vote answered ${response.status()}`)
      state.userId = sql(`select id from users where email = '${NEW.email}'`)
      assert(state.userId, 'new user is not in the database')
      await p.getByRole('button', { name: /^Voto rápido/, pressed: true }).waitFor()
      const votes = sql(
        `select count(*) from votes where user_id = '${state.userId}' and issue_id = '${state.seedIssue}'`,
      )
      assert(votes === '1', `expected 1 vote in the database, found ${votes}`)
      return `user ${state.userId.slice(0, 8)} in the database, vote saved and marked on screen`
    },
  )

  await step(
    'Report an issue: category → location (address from the API) → review',
    p,
    async () => {
      await p.goto(BASE + '/map')
      await p.getByRole('link', { name: 'Registrar' }).click()
      await p.waitForURL(/\/report$/)
      await p.getByRole('link', { name: /^Problema/ }).click()
      await p.waitForURL(/\/report\/category\?type=issue/)
      await p.getByRole('button', { name: /Buraco na via/ }).click()
      await p.getByRole('button', { name: 'Continuar' }).click()
      await p.waitForURL(/\/report\/location/)
      const confirm = p.getByRole('button', { name: 'Confirmar local' })
      await confirm.waitFor()
      await waitUntilEnabled(confirm)
      await confirm.click()
      await p.waitForURL(/\/report\/(review|duplicate-check)/)
      if (p.url().includes('duplicate-check')) {
        await p.getByRole('button', { name: 'Não, é outro' }).click()
        await p.waitForURL(/\/report\/review/)
      }
      await p.locator('textarea').fill(DESCRIPTION)
      await p.getByText('Buscando endereço…').waitFor({ state: 'detached', timeout: 20_000 })
    },
  )

  await step(
    'Without internet the submission fails without losing the draft (screen 26)',
    p,
    async () => {
      await guest.context.setOffline(true)
      await p.getByRole('button', { name: 'Enviar registro' }).click()
      await p.getByText('Não foi possível enviar').waitFor({ timeout: 25_000 })
      await guest.context.setOffline(false)
    },
  )

  await step('"Tentar novamente" submits and the issue reaches the database', p, async () => {
    const didCreate = p.waitForResponse(
      (r) => /\/api\/v1\/issues$/.test(r.url()) && r.request().method() === 'POST',
    )
    await p.getByRole('button', { name: 'Tentar novamente' }).click()
    const response = await didCreate
    assert(response.status() === 201, `POST /issues answered ${response.status()}`)
    state.newIssue = (await response.json()).id
    await p.getByRole('heading', { name: 'Registro enviado' }).waitFor()
    const line = sql(
      `select description, author_id, approximate_address, round(st_distance(location, st_makepoint(${POSITION.longitude}, ${POSITION.latitude})::geography)) from issues where id = '${state.newIssue}'`,
    ).split('|')
    assert(line[0] === DESCRIPTION, 'different description in the database')
    assert(line[1] === state.userId, 'different author in the database')
    assert(Number(line[3]) < 60, `point ${line[3]} m away from the GPS position`)
    state.address = line[2]
    return `"${line[2]}", ${line[3]} m from the GPS`
  })

  await step('"Ver no mapa" opens the new alert with the author badge', p, async () => {
    await p.getByRole('button', { name: 'Ver no mapa' }).click()
    await p.waitForURL(new RegExp(`/map/issue/${state.newIssue}`))
    const card = p.getByRole('region', { name: 'Resumo do alerta' })
    await card.getByText('Buraco na via').waitFor()
    assert(
      (await card.getByRole('button').count()) === 0,
      'the author saw thumbs on their own alert',
    )
  })

  await step('Report an incident (anonymous) and check the area in the database', p, async () => {
    await p.goto(BASE + '/report')
    await p.getByRole('link', { name: /^Incidente/ }).click()
    await p.waitForURL(/\/report\/category\?type=incident/)
    await p.getByRole('button', { name: /Roubo/ }).click()
    await p.getByRole('button', { name: 'Continuar' }).click()
    await p.waitForURL(/\/report\/incident\/location/)
    await p.getByRole('button', { name: /continuar|confirmar/i }).click()
    await p.waitForURL(/\/report\/incident\/review/)
    const didCreate = p.waitForResponse(
      (r) => /\/api\/v1\/incidents$/.test(r.url()) && r.request().method() === 'POST',
    )
    await p.getByRole('button', { name: /enviar/i }).click()
    const response = await didCreate
    assert(response.status() === 201, `POST /incidents answered ${response.status()}`)
    await p.getByRole('heading', { name: 'Relato enviado' }).waitFor()
    const line = sql(
      `select radius_meters, area_label from incidents where author_id = '${state.userId}' order by registered_at desc limit 1`,
    ).split('|')
    assert(line[0], 'incident is not in the database')
    return `radius ${line[0]} m · ${line[1] || 'no label'}`
  })

  await step(
    'Incidents mode: tapping the map opens the area with the report (GET /incidents/area)',
    p,
    async () => {
      await p.goto(BASE + '/map?mode=incidents')
      const map = p.locator('canvas.maplibregl-canvas')
      await map.waitFor()
      await p.waitForLoadState('networkidle')
      const area = p.waitForResponse((r) => /\/incidents\/area/.test(r.url()))
      const box = await map.boundingBox()
      await p.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
      const response = await area
      assert(response.status() === 200, `GET /incidents/area answered ${response.status()}`)
      const body = await response.json()
      await p.waitForURL(/\/map\/area/)
      await p.getByRole('heading', { name: 'Área de incidentes' }).waitFor()
      const robberies = body.counts.find((c) => c.name === 'Roubo')
      assert(robberies?.days7 >= 1, 'the reported robbery did not enter the area count')
      return `level ${body.level} · ${robberies.days7} robbery(ies) in 7 days within ${body.radiusMeters} m`
    },
  )

  await step('Profile shows the totals and the history from GET /me', p, async () => {
    await p.goto(BASE + '/profile')
    await p.getByText(NEW.name).first().waitFor()
    await p.getByText('Buraco na via').first().waitFor()
    await p.getByText('Roubo').first().waitFor()
    const total = sql(
      `select (select count(*) from issues where author_id = '${state.userId}') + (select count(*) from incidents where author_id = '${state.userId}')`,
    )
    assert(total === '2', `expected 2 reports in the database, found ${total}`)
  })

  await step('Settings → editing the name saves it in the database (PATCH /me)', p, async () => {
    await p.goto(BASE + '/profile/settings')
    await p.getByRole('button', { name: /^Nome/ }).click()
    const field = p.getByRole('dialog').getByRole('textbox')
    state.newName = `${NEW.name} (editado)`
    await field.fill(state.newName)
    await p
      .getByRole('dialog')
      .getByRole('button', { name: /salvar/i })
      .click()
    await p.getByRole('dialog').waitFor({ state: 'detached' })
    await p.getByText(state.newName).waitFor()
    const name = sql(`select name from users where id = '${state.userId}'`)
    assert(name === state.newName, `name in the database: ${name}`)
  })

  await step('Verification request stays pending in the database', p, async () => {
    await p.goto(BASE + '/profile')
    await p.getByRole('link', { name: 'Solicitar verificação' }).click()
    await p.waitForURL(/\/profile\/verification/)
    await p.getByLabel('Tipo de vínculo').selectOption({ index: 1 })
    await p
      .getByLabel(/Justificativa/)
      .fill('Moro em Icaraí há dez anos e passo por estas ruas todos os dias a pé.')
    await p.getByRole('button', { name: 'Enviar pedido' }).click()
    await p.waitForURL(/\/profile$/)
    await p.getByText('Pedido em análise').waitFor()
    const status = sql(`select status from verification_requests where user_id = '${state.userId}'`)
    assert(status !== '', 'request is not in the database')
  })

  const neighbor = await newPage('cidadao2')
  await step('Another citizen logs in and confirms the new issue', neighbor.page, async () => {
    const q = neighbor.page
    await loginThroughScreen(q, 'cidadao2@tcc.local')
    await q.goto(BASE + `/map/issue/${state.newIssue}`)
    const card = q.getByRole('region', { name: 'Resumo do alerta' })
    await card.waitFor()
    const before = await card.innerText()
    const voted = q.waitForResponse((r) => /\/vote$/.test(r.url()))
    await q.getByRole('button', { name: 'Voto rápido: Sim, está lá' }).click()
    const response = await voted
    assert(response.ok(), `vote answered ${response.status()}`)
    await q.getByRole('button', { name: 'Voto rápido: Sim, está lá', pressed: true }).waitFor()
    await card.getByText('1 confirmaram').waitFor()
    const votes = sql(
      `select count(*) from votes where issue_id = '${state.newIssue}' and user_id <> '${state.userId}'`,
    )
    assert(votes === '1', `expected 1 vote in the database, found ${votes}`)
    return `before: "${before.split('\n').find((l) => l.includes('confirmaram'))}" → 1 confirmaram`
  })

  await step('Recent lists the new issue (GET /issues/recent)', neighbor.page, async () => {
    const q = neighbor.page
    await q.goto(BASE + '/recent')
    const url = `${BASE}/api/v1/issues/recent?lat=${POSITION.latitude}&lng=${POSITION.longitude}&radiusKm=10&pageSize=100`
    const body = await (await fetch(url)).json()
    assert(
      body.items.some((i) => i.id === state.newIssue),
      'new issue missing from the recent response',
    )
    await q.getByText(state.address).first().waitFor()
  })
  await neighbor.context.close()

  const admin = await newPage('admin')
  await step('Admin approves the request in the verification queue', admin.page, async () => {
    const q = admin.page
    await loginThroughScreen(q, 'admin@tcc.local')
    await q.goto(BASE + '/admin/verifications')
    const card = q.getByRole('article', { name: `Pedido de ${state.newName}` })
    await card.waitFor()
    await card.getByRole('button', { name: /aprovar/i }).click()
    await card.waitFor({ state: 'detached' })
    const line = sql(
      `select s.status, u.role, u.verified_at is not null from verification_requests s join users u on u.id = s.user_id where s.user_id = '${state.userId}'`,
    )
    return `database: status/role/verified = ${line}`
  })
  await admin.context.close()

  await step('User sees "Perfil verificado" without signing out (GET /me)', p, async () => {
    await p.goto(BASE + '/profile')
    await p.getByText(/^Verificado em/).waitFor()
    await p.getByText('Seu voto tem peso maior').waitFor()
  })

  await step(
    'Compass: rotating the map shows the heading and a tap points north again',
    p,
    async () => {
      await p.goto(BASE + '/map')
      const map = p.locator('canvas.maplibregl-canvas')
      await map.waitFor()
      await map.focus()
      for (let i = 0; i < 6; i++) {
        await p.keyboard.press('Shift+ArrowRight')
        await delay(250)
      }
      const compass = p.getByRole('button', { name: 'Apontar para o norte' })
      await compass.waitFor()
      await delay(800)
      const letter = await compass.innerText()
      assert(letter !== 'N', 'the letter stayed N with the map rotated')
      await compass.click()
      await compass.waitFor({ state: 'detached' })
      return `letter ${letter} with the map rotated`
    },
  )

  await step('Invalid token: voting asks for login again (rule 13)', p, async () => {
    await p.evaluate(() => {
      const key = 'urbanReports.session'
      const saved = JSON.parse(localStorage.getItem(key))
      saved.state.session.token = 'invalid-token'
      localStorage.setItem(key, JSON.stringify(saved))
    })
    await p.goto(BASE + `/map/issue/${state.seedIssue}`)
    await p.getByRole('region', { name: 'Resumo do alerta' }).waitFor()
    await p
      .getByRole('button', { name: /^Voto rápido/ })
      .first()
      .click()
    await p.getByRole('button', { name: 'Já tenho conta' }).waitFor()
    await p.getByRole('button', { name: 'Agora não' }).click()
  })

  await step('Signing out goes back to guest mode', p, async () => {
    await loginThroughScreen(p, NEW.email, NEW.password)
    await p.goto(BASE + '/profile/settings')
    await p.getByRole('button', { name: 'Sair da conta' }).click()
    await p.waitForURL(/\/map/)
    const session = await p.evaluate(() => localStorage.getItem('urbanReports.session'))
    assert(!session || !JSON.parse(session).state.session, 'session is still in the browser')
  })
  await guest.context.close()

  const desktopPage = await newPage('desktop', DESKTOP)
  await step(
    'Desktop: the alert opens in the side panel next to the map',
    desktopPage.page,
    async () => {
      const q = desktopPage.page
      await q.goto(BASE + `/map/issue/${state.newIssue}`)
      if (q.url().includes('location-permission'))
        await q.getByRole('button', { name: 'Continuar' }).click()
      await q.getByRole('region', { name: 'Resumo do alerta' }).getByText('Buraco na via').waitFor()
      await q.locator(`[data-issue="${state.newIssue}"]`).waitFor()
      await q.waitForLoadState('networkidle')
      await q.screenshot({ path: `${OUTPUT}/desktop-panel.png` })
    },
  )
  await desktopPage.context.close()
} catch {
} finally {
  await browser.close()
  report()
}

async function step(name, page, action) {
  const start = Date.now()
  try {
    const detail = await action()
    results.push({ ok: true, name, detail, ms: Date.now() - start })
    console.log(`✓ ${name}${detail ? ` — ${detail}` : ''}`)
  } catch (error) {
    const file = `${OUTPUT}/failure-${results.length + 1}.png`
    await page.screenshot({ path: file }).catch(() => {})
    results.push({
      ok: false,
      name,
      detail: error.message.split('\n')[0],
      ms: Date.now() - start,
    })
    console.log(
      `✗ ${name}\n  ${error.message.split('\n').slice(0, 3).join('\n  ')}\n  print: ${file}`,
    )
    throw error
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function waitUntilEnabled(button, limit = 20_000) {
  const end = Date.now() + limit
  while (await button.isDisabled()) {
    if (Date.now() > end) throw new Error('button stayed disabled')
    await delay(200)
  }
}

async function newPage(name, device = MOBILE, { firstTime = false } = {}) {
  const mobile = device.width < 1024
  const context = await browser.newContext({
    viewport: device,
    isMobile: mobile,
    hasTouch: mobile,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    permissions: ['geolocation'],
    geolocation: POSITION,
  })
  await context.addInitScript(() => localStorage.setItem('urbanReports.legendSeen', '1'))
  if (!firstTime) {
    await context.addInitScript(() =>
      localStorage.setItem(
        'urbanReports.theme',
        JSON.stringify({ state: { preference: 'light', chosen: true }, version: 0 }),
      ),
    )
  }
  const page = await context.newPage()
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(`[${name}] ${m.text().slice(0, 200)}`)
  })
  page.on('pageerror', (e) => consoleErrors.push(`[${name}] ${e.message.slice(0, 200)}`))
  page.on('response', (r) => {
    const url = new URL(r.url())
    if (url.pathname.startsWith('/api/') && r.status() >= 400) {
      apiErrors.push(`[${name}] ${r.request().method()} ${url.pathname} → ${r.status()}`)
    }
  })
  return { context, page }
}

async function loginThroughScreen(page, email, password = PASSWORD) {
  await page.goto(BASE + '/login')
  if (page.url().includes('location-permission')) {
    await page.getByRole('button', { name: 'Continuar' }).click()
    await page.goto(BASE + '/login')
  }
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha', { exact: true }).fill(password)
  const loggedIn = page.waitForResponse((r) => /\/auth\/login/.test(r.url()))
  await page.getByRole('button', { name: 'Entrar' }).click()
  const response = await loggedIn
  assert(response.ok(), `login of ${email} answered ${response.status()}`)
  await page.waitForURL((url) => !url.pathname.startsWith('/login'))
}

function sql(query) {
  return execFileSync(
    'docker',
    ['exec', DB, 'psql', '-U', 'ocorrencias', '-d', 'ocorrencias', '-tAc', query],
    { encoding: 'utf8' },
  ).trim()
}

async function checkEnvironment() {
  const check = async (url, label) => {
    try {
      const r = await fetch(url)
      if (!r.ok) throw new Error(`${r.status}`)
    } catch (error) {
      console.error(`${label} is down (${url}): ${error.message}`)
      process.exit(1)
    }
  }
  await check(BASE, 'Front')
  await check(BASE + '/api/v1/health/database', 'API/database')
  sql('select 1')
}

function report() {
  const ok = results.filter((r) => r.ok).length
  console.log(`\n${ok}/${results.length} steps ok · account ${NEW.email}`)
  const unexpected = apiErrors.filter((l) => !l.endsWith('→ 401'))
  if (unexpected.length) console.log('\nAPI error responses:\n  ' + unexpected.join('\n  '))
  const browserErrors = consoleErrors.filter(
    (l) => !l.includes('ERR_INTERNET_DISCONNECTED') && !l.includes('status of 401'),
  )
  if (browserErrors.length) console.log('\nConsole errors:\n  ' + browserErrors.join('\n  '))
  if (ok !== results.length) process.exitCode = 1
}
