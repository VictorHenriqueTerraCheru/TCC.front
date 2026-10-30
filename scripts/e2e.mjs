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
const fetchedIssues = []
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
  const guest = await newPage('visitante', MOBILE, { firstTime: true })
  const p = guest.page

  await step(
    'Visitante abre o app, escolhe o tema escuro e passa pela pré-permissão',
    p,
    async () => {
      await p.goto(BASE + '/map')
      await p.getByRole('heading', { name: 'Escolha a aparência' }).waitFor()
      const system = p.getByRole('radio', { name: /Automático/ })
      assert((await system.getAttribute('aria-checked')) === 'true', 'Automático não veio marcado')
      await p.getByRole('radio', { name: /Escuro/ }).click()
      const theme = await p.evaluate(() => document.documentElement.dataset.theme)
      assert(theme === 'escuro', `o tema não mudou na hora (data-theme=${theme})`)
      await p.getByRole('button', { name: 'Continuar' }).click()
      await p.waitForURL(/location-permission|map/)
      if (p.url().includes('permissao')) {
        await p.getByRole('button', { name: 'Continuar' }).click()
      }
      await p.waitForURL(/\/map/)
    },
  )

  await step('Mapa carrega os marcadores da API (GET /problemas)', p, async () => {
    const response = await p.waitForResponse((r) => /\/api\/v1\/problemas\?/.test(r.url()))
    assert(response.status() === 200, `GET /problemas respondeu ${response.status()}`)
    const body = await response.json()
    await p.locator('[data-issue]').first().waitFor()
    const markers = await p.locator('[data-issue]').count()
    assert(markers > 0, 'nenhum marcador na tela')
    return `${body.length} da API, ${markers} na tela`
  })

  await step('Visitante toca num alerta e vê o card rápido com dados da API', p, async () => {
    await p.locator('[data-issue]').first().click({ force: true })
    await p.waitForURL(/\/map\/issue\//)
    state.seedIssue = p.url().split('/map/issue/')[1].split('?')[0]
    const card = p.getByRole('region', { name: 'Resumo do alerta' })
    await card.waitFor()
    return `problema ${state.seedIssue.slice(0, 8)} · ${await card.locator('h2').innerText()}`
  })

  await step('Voto como visitante abre a folha "Entre para votar"', p, async () => {
    await p
      .getByRole('button', { name: /^Voto rápido/ })
      .first()
      .click()
    await p.getByRole('button', { name: 'Criar conta' }).waitFor()
  })

  await step(
    'Cadastro pela folha cria a conta e volta ao alerta com o voto retomado',
    p,
    async () => {
      await p.getByRole('button', { name: 'Criar conta' }).click()
      await p.waitForURL(/\/register/)
      await p.getByLabel('Nome').fill(NEW.name)
      await p.getByLabel('E-mail').fill(NEW.email)
      await p.getByLabel('Senha', { exact: true }).fill(NEW.password)
      await p.locator('#aceitou-termos').check()
      const voted = p.waitForResponse(
        (r) => /\/voto$/.test(r.url()) && r.request().method() === 'PUT',
      )
      await p.getByRole('button', { name: /criar conta/i }).click()
      await p.waitForURL(new RegExp(`/map/issue/${state.seedIssue}`))
      const response = await voted
      assert(response.ok(), `voto retomado respondeu ${response.status()}`)
      state.userId = sql(`select id from usuarios where email = '${NEW.email}'`)
      assert(state.userId, 'usuário novo não está no banco')
      await p.getByRole('button', { name: /^Voto rápido/, pressed: true }).waitFor()
      const votes = sql(
        `select count(*) from votos where usuario_id = '${state.userId}' and problema_id = '${state.seedIssue}'`,
      )
      assert(votes === '1', `esperava 1 voto no banco, há ${votes}`)
      return `usuário ${state.userId.slice(0, 8)} no banco, voto gravado e marcado na tela`
    },
  )

  await step('Registrar problema: categoria → local (endereço da API) → revisão', p, async () => {
    await p.goto(BASE + '/map')
    await p.getByRole('link', { name: 'Registrar' }).click()
    await p.waitForURL(/\/report$/)
    await p.getByRole('link', { name: /^Estado/ }).click()
    await p.waitForURL(/\/report\/category\?type=issue/)
    await p.getByRole('button', { name: /Buraco na via/ }).click()
    await p.getByRole('button', { name: 'Continuar' }).click()
    await p.waitForURL(/\/report\/location/)
    const confirm = p.getByRole('button', { name: 'Confirmar local' })
    await confirm.waitFor()
    await waitUntilEnabled(confirm)
    await confirm.click()
    await p.waitForURL(/\/report\/(review|duplicate-check)/)
    if (p.url().includes('conferencia')) {
      await p.getByRole('button', { name: 'Não, é outro' }).click()
      await p.waitForURL(/\/report\/review/)
    }
    await p.locator('textarea').fill(DESCRIPTION)
    await p.getByText('Buscando endereço…').waitFor({ state: 'detached', timeout: 20_000 })
  })

  await step('Sem internet o envio falha sem perder o rascunho (tela 26)', p, async () => {
    await guest.context.setOffline(true)
    await p.getByRole('button', { name: 'Enviar registro' }).click()
    await p.getByText('Não foi possível enviar').waitFor({ timeout: 25_000 })
    await guest.context.setOffline(false)
  })

  await step('"Tentar novamente" envia e o problema chega ao banco', p, async () => {
    const didCreate = p.waitForResponse(
      (r) => /\/api\/v1\/problemas$/.test(r.url()) && r.request().method() === 'POST',
    )
    await p.getByRole('button', { name: 'Tentar novamente' }).click()
    const response = await didCreate
    assert(response.status() === 201, `POST /problemas respondeu ${response.status()}`)
    state.newIssue = (await response.json()).id
    await p.getByRole('heading', { name: 'Registro enviado' }).waitFor()
    const line = sql(
      `select descricao, autor_id, endereco_aproximado, round(st_distance(localizacao, st_makepoint(${POSITION.longitude}, ${POSITION.latitude})::geography)) from problemas where id = '${state.newIssue}'`,
    ).split('|')
    assert(line[0] === DESCRIPTION, 'descrição diferente no banco')
    assert(line[1] === state.userId, 'autor diferente no banco')
    assert(Number(line[3]) < 60, `ponto a ${line[3]} m da posição do GPS`)
    state.address = line[2]
    return `"${line[2]}", a ${line[3]} m do GPS`
  })

  await step('"Ver no mapa" abre o alerta novo com o selo de autor', p, async () => {
    await p.getByRole('button', { name: 'Ver no mapa' }).click()
    await p.waitForURL(new RegExp(`/map/issue/${state.newIssue}`))
    const card = p.getByRole('region', { name: 'Resumo do alerta' })
    await card.getByText('Buraco na via').waitFor()
    assert((await card.getByRole('button').count()) === 0, 'autor viu polegares no próprio alerta')
  })

  await step('Registrar incidente (anônimo) e conferir a área no banco', p, async () => {
    await p.goto(BASE + '/report')
    await p.getByRole('link', { name: /^Evento/ }).click()
    await p.waitForURL(/\/report\/category\?type=incident/)
    await p.getByRole('button', { name: /Roubo/ }).click()
    await p.getByRole('button', { name: 'Continuar' }).click()
    await p.waitForURL(/\/report\/incident\/location/)
    await p.getByRole('button', { name: /continuar|confirmar/i }).click()
    await p.waitForURL(/\/report\/incident\/review/)
    const didCreate = p.waitForResponse(
      (r) => /\/api\/v1\/incidentes$/.test(r.url()) && r.request().method() === 'POST',
    )
    await p.getByRole('button', { name: /enviar/i }).click()
    const response = await didCreate
    assert(response.status() === 201, `POST /incidentes respondeu ${response.status()}`)
    await p.getByRole('heading', { name: 'Relato enviado' }).waitFor()
    const line = sql(
      `select raio_metros, rotulo_area from incidentes where autor_id = '${state.userId}' order by registrado_em desc limit 1`,
    ).split('|')
    assert(line[0], 'incidente não está no banco')
    return `raio ${line[0]} m · ${line[1] || 'sem rótulo'}`
  })

  await step(
    'Modo Incidentes: tocar no mapa abre a área com o relato (GET /incidentes/area)',
    p,
    async () => {
      await p.goto(BASE + '/map?mode=incidents')
      const map = p.locator('canvas.maplibregl-canvas')
      await map.waitFor()
      await p.waitForLoadState('networkidle')
      const area = p.waitForResponse((r) => /\/incidentes\/area/.test(r.url()))
      const box = await map.boundingBox()
      await p.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
      const response = await area
      assert(response.status() === 200, `GET /incidentes/area respondeu ${response.status()}`)
      const body = await response.json()
      await p.waitForURL(/\/map\/area/)
      await p.getByRole('heading', { name: 'Área de incidentes' }).waitFor()
      const robberies = body.counts.find((c) => c.name === 'Roubo')
      assert(robberies?.sevenDays >= 1, 'o roubo registrado não entrou na contagem da área')
      return `nível ${body.level} · ${robberies.sevenDays} roubo(s) em 7 dias no raio de ${body.radiusMeters} m`
    },
  )

  await step('Perfil mostra os totais e o histórico vindos de GET /me', p, async () => {
    await p.goto(BASE + '/profile')
    await p.getByText(NEW.name).first().waitFor()
    await p.getByText('Buraco na via').first().waitFor()
    await p.getByText('Roubo').first().waitFor()
    const total = sql(
      `select (select count(*) from problemas where autor_id = '${state.userId}') + (select count(*) from incidentes where autor_id = '${state.userId}')`,
    )
    assert(total === '2', `esperava 2 registros no banco, há ${total}`)
  })

  await step('Configurações → editar nome grava no banco (PATCH /me)', p, async () => {
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
    const name = sql(`select nome from usuarios where id = '${state.userId}'`)
    assert(name === state.newName, `nome no banco: ${name}`)
  })

  await step('Pedido de verificação fica pendente no banco', p, async () => {
    await p.goto(BASE + '/profile')
    await p.getByRole('link', { name: 'Solicitar verificação' }).click()
    await p.waitForURL(/\/profile\/verification/)
    await p.getByLabel('Tipo de vínculo').selectOption({ index: 1 })
    await p
      .getByLabel(/Justificativa/)
      .fill('Moro em Botafogo há dez anos e passo por estas ruas todos os dias a pé.')
    await p.getByRole('button', { name: 'Enviar pedido' }).click()
    await p.waitForURL(/\/profile$/)
    await p.getByText('Pedido em análise').waitFor()
    const status = sql(
      `select status from solicitacoes_verificacao where usuario_id = '${state.userId}'`,
    )
    assert(status !== '', 'pedido não está no banco')
  })

  const neighbor = await newPage('cidadao2')
  await step(
    'Outro cidadão entra pelo login e confirma o problema novo',
    neighbor.page,
    async () => {
      const q = neighbor.page
      await loginThroughScreen(q, 'cidadao2@tcc.local')
      await q.goto(BASE + `/map/issue/${state.newIssue}`)
      const card = q.getByRole('region', { name: 'Resumo do alerta' })
      await card.waitFor()
      const before = await card.innerText()
      const voted = q.waitForResponse((r) => /\/voto$/.test(r.url()))
      await q.getByRole('button', { name: 'Voto rápido: Sim, está lá' }).click()
      const response = await voted
      assert(response.ok(), `voto respondeu ${response.status()}`)
      await q.getByRole('button', { name: 'Voto rápido: Sim, está lá', pressed: true }).waitFor()
      await card.getByText('1 confirmaram').waitFor()
      const votes = sql(
        `select count(*) from votos where problema_id = '${state.newIssue}' and usuario_id <> '${state.userId}'`,
      )
      assert(votes === '1', `esperava 1 voto no banco, há ${votes}`)
      return `antes: "${before.split('\n').find((l) => l.includes('confirmaram'))}" → 1 confirmaram`
    },
  )

  await step(
    'Recentes lista o problema novo (GET /problemas/recentes)',
    neighbor.page,
    async () => {
      const q = neighbor.page
      await q.goto(BASE + '/recent')
      const url = `${BASE}/api/v1/problemas/recentes?lat=${POSITION.latitude}&lng=${POSITION.longitude}&raioKm=10&tamanho=100`
      const body = await (await fetch(url)).json()
      assert(
        body.items.some((i) => i.id === state.newIssue),
        'problema novo fora da resposta de recentes',
      )
      await q.getByText(state.address).first().waitFor()
    },
  )
  await neighbor.context.close()

  const admin = await newPage('admin')
  await step('Admin aprova o pedido na fila de verificação', admin.page, async () => {
    const q = admin.page
    await loginThroughScreen(q, 'admin@tcc.local')
    await q.goto(BASE + '/admin/verifications')
    const card = q.getByRole('article', { name: `Pedido de ${state.newName}` })
    await card.waitFor()
    await card.getByRole('button', { name: /aprovar/i }).click()
    await card.waitFor({ state: 'detached' })
    const line = sql(
      `select s.status, u.perfil, u.verificado_em is not null from solicitacoes_verificacao s join usuarios u on u.id = s.usuario_id where s.usuario_id = '${state.userId}'`,
    )
    return `banco: status/perfil/verificado = ${line}`
  })
  await admin.context.close()

  await step('Usuário vê "Perfil verificado" sem sair da conta (GET /me)', p, async () => {
    await p.goto(BASE + '/profile')
    await p.getByText(/^Verificado em/).waitFor()
    await p.getByText('Seu voto tem peso maior').waitFor()
  })

  await step('Bússola: girar o mapa mostra a direção e o toque volta ao norte', p, async () => {
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
    assert(letter !== 'N', `a letra continuou N com o mapa girado`)
    await compass.click()
    await compass.waitFor({ state: 'detached' })
    return `letra ${letter} com o mapa girado`
  })

  await step('Token inválido: o voto pede login de novo (regra 13)', p, async () => {
    await p.evaluate(() => {
      const key = 'urbanReports.session'
      const saved = JSON.parse(localStorage.getItem(key))
      saved.state.session.token = 'token-invalido'
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

  await step('Sair da conta volta ao modo visitante', p, async () => {
    await loginThroughScreen(p, NEW.email, NEW.password)
    await p.goto(BASE + '/profile/settings')
    await p.getByRole('button', { name: 'Sair da conta' }).click()
    await p.waitForURL(/\/map/)
    const session = await p.evaluate(() => localStorage.getItem('urbanReports.session'))
    assert(!session || !JSON.parse(session).state.session, 'sessão continua no navegador')
  })
  await guest.context.close()

  const desktopPage = await newPage('desktop', DESKTOP)
  await step(
    'Desktop: alerta abre no painel lateral ao lado do mapa',
    desktopPage.page,
    async () => {
      const q = desktopPage.page
      await q.goto(BASE + `/map/issue/${state.newIssue}`)
      if (q.url().includes('permissao')) await q.getByRole('button', { name: 'Continuar' }).click()
      await q.getByRole('region', { name: 'Resumo do alerta' }).getByText('Buraco na via').waitFor()
      await q.locator(`[data-issue="${state.newIssue}"]`).waitFor()
      await q.waitForLoadState('networkidle')
      await q.screenshot({ path: `${OUTPUT}/desktop-painel.png` })
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
    const file = `${OUTPUT}/falha-${results.length + 1}.png`
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
    if (Date.now() > end) throw new Error('botão continuou desabilitado')
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
        JSON.stringify({ state: { preference: 'claro', chosen: true }, version: 0 }),
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
      fetchedIssues.push(`[${name}] ${r.request().method()} ${url.pathname} → ${r.status()}`)
    }
  })
  return { context, page }
}

async function loginThroughScreen(page, email, password = PASSWORD) {
  await page.goto(BASE + '/login')
  if (page.url().includes('permissao')) {
    await page.getByRole('button', { name: 'Continuar' }).click()
    await page.goto(BASE + '/login')
  }
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha', { exact: true }).fill(password)
  const loggedIn = page.waitForResponse((r) => /\/auth\/login/.test(r.url()))
  await page.getByRole('button', { name: 'Entrar' }).click()
  const response = await loggedIn
  assert(response.ok(), `login de ${email} respondeu ${response.status()}`)
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
      console.error(`${label} fora do ar (${url}): ${error.message}`)
      process.exit(1)
    }
  }
  await check(BASE, 'Front')
  await check(BASE + '/api/v1/saude/banco', 'API/banco')
  sql('select 1')
}

function report() {
  const ok = results.filter((r) => r.ok).length
  console.log(`\n${ok}/${results.length} passos ok · conta ${NEW.email}`)
  const unexpected = fetchedIssues.filter((l) => !l.endsWith('→ 401'))
  if (unexpected.length) console.log('\nRespostas de erro da API:\n  ' + unexpected.join('\n  '))
  const console_ = consoleErrors.filter(
    (l) => !l.includes('ERR_INTERNET_DISCONNECTED') && !l.includes('status of 401'),
  )
  if (console_.length) console.log('\nErros no console:\n  ' + console_.join('\n  '))
  if (ok !== results.length) process.exitCode = 1
}
