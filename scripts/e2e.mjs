import { execFileSync } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { setTimeout as esperar } from 'node:timers/promises'

import { chromium } from 'playwright'

const BASE = process.env.E2E_URL ?? 'http://localhost:5173'
const DB = process.env.E2E_DB ?? 'tccback-db-1'
const SENHA = process.env.E2E_SENHA ?? 'tcc12345'
const NAVEGADOR = process.env.E2E_NAVEGADOR ?? 'chrome'
const VISIVEL = process.env.E2E_VISIVEL === '1'
const SAIDA = 'prints/e2e'
const CELULAR = { width: 390, height: 844 }
const DESKTOP = { width: 1440, height: 900 }

const sorteio = () => (Math.random() - 0.5) * 0.006
const POSICAO = { latitude: -22.9519 + sorteio(), longitude: -43.1866 + sorteio(), accuracy: 10 }
const EXECUCAO = new Date().toISOString().replace(/\D/g, '').slice(0, 14)
const NOVO = {
  nome: `Teste E2E ${EXECUCAO}`,
  email: `e2e-${EXECUCAO}@tcc.local`,
  senha: 'senha-e2e-123',
}
const DESCRICAO = `Buraco aberto perto do meio-fio (e2e ${EXECUCAO}).`

const resultados = []
const problemasRede = []
const errosConsole = []
const estado = {}

await mkdir(SAIDA, { recursive: true })
await conferirAmbiente()
const navegador = await chromium.launch({
  ...(NAVEGADOR === 'chromium' ? {} : { channel: NAVEGADOR }),
  headless: !VISIVEL,
  slowMo: VISIVEL ? 250 : 0,
})

try {
  const visitante = await novaPagina('visitante', CELULAR, { primeiraVez: true })
  const p = visitante.pagina

  await passo(
    'Visitante abre o app, escolhe o tema escuro e passa pela pré-permissão',
    p,
    async () => {
      await p.goto(BASE + '/mapa')
      await p.getByRole('heading', { name: 'Escolha a aparência' }).waitFor()
      const automatico = p.getByRole('radio', { name: /Automático/ })
      confere(
        (await automatico.getAttribute('aria-checked')) === 'true',
        'Automático não veio marcado',
      )
      await p.getByRole('radio', { name: /Escuro/ }).click()
      const tema = await p.evaluate(() => document.documentElement.dataset.tema)
      confere(tema === 'escuro', `o tema não mudou na hora (data-tema=${tema})`)
      await p.getByRole('button', { name: 'Continuar' }).click()
      await p.waitForURL(/permissao|mapa/)
      if (p.url().includes('permissao')) {
        await p.getByRole('button', { name: 'Continuar' }).click()
      }
      await p.waitForURL(/\/mapa/)
    },
  )

  await passo('Mapa carrega os marcadores da API (GET /problemas)', p, async () => {
    const resposta = await p.waitForResponse((r) => /\/api\/v1\/problemas\?/.test(r.url()))
    confere(resposta.status() === 200, `GET /problemas respondeu ${resposta.status()}`)
    const corpo = await resposta.json()
    await p.locator('[data-problema]').first().waitFor()
    const marcadores = await p.locator('[data-problema]').count()
    confere(marcadores > 0, 'nenhum marcador na tela')
    return `${corpo.length} da API, ${marcadores} na tela`
  })

  await passo('Visitante toca num alerta e vê o card rápido com dados da API', p, async () => {
    await p.locator('[data-problema]').first().click({ force: true })
    await p.waitForURL(/\/mapa\/problema\//)
    estado.problemaSeed = p.url().split('/mapa/problema/')[1].split('?')[0]
    const card = p.getByRole('region', { name: 'Resumo do alerta' })
    await card.waitFor()
    return `problema ${estado.problemaSeed.slice(0, 8)} · ${await card.locator('h2').innerText()}`
  })

  await passo('Voto como visitante abre a folha "Entre para votar"', p, async () => {
    await p
      .getByRole('button', { name: /^Voto rápido/ })
      .first()
      .click()
    await p.getByRole('button', { name: 'Criar conta' }).waitFor()
  })

  await passo(
    'Cadastro pela folha cria a conta e volta ao alerta com o voto retomado',
    p,
    async () => {
      await p.getByRole('button', { name: 'Criar conta' }).click()
      await p.waitForURL(/\/cadastro/)
      await p.getByLabel('Nome').fill(NOVO.nome)
      await p.getByLabel('E-mail').fill(NOVO.email)
      await p.getByLabel('Senha', { exact: true }).fill(NOVO.senha)
      await p.locator('#aceitou-termos').check()
      const votou = p.waitForResponse(
        (r) => /\/voto$/.test(r.url()) && r.request().method() === 'PUT',
      )
      await p.getByRole('button', { name: /criar conta/i }).click()
      await p.waitForURL(new RegExp(`/mapa/problema/${estado.problemaSeed}`))
      const resposta = await votou
      confere(resposta.ok(), `voto retomado respondeu ${resposta.status()}`)
      estado.usuarioId = sql(`select id from usuarios where email = '${NOVO.email}'`)
      confere(estado.usuarioId, 'usuário novo não está no banco')
      await p.getByRole('button', { name: /^Voto rápido/, pressed: true }).waitFor()
      const votos = sql(
        `select count(*) from votos where usuario_id = '${estado.usuarioId}' and problema_id = '${estado.problemaSeed}'`,
      )
      confere(votos === '1', `esperava 1 voto no banco, há ${votos}`)
      return `usuário ${estado.usuarioId.slice(0, 8)} no banco, voto gravado e marcado na tela`
    },
  )

  await passo('Registrar problema: categoria → local (endereço da API) → revisão', p, async () => {
    await p.goto(BASE + '/mapa')
    await p.getByRole('link', { name: 'Registrar' }).click()
    await p.waitForURL(/\/registrar$/)
    await p.getByRole('link', { name: /^Estado/ }).click()
    await p.waitForURL(/\/registrar\/categoria\?tipo=problema/)
    await p.getByRole('button', { name: /Buraco na via/ }).click()
    await p.getByRole('button', { name: 'Continuar' }).click()
    await p.waitForURL(/\/registrar\/local/)
    const confirmar = p.getByRole('button', { name: 'Confirmar local' })
    await confirmar.waitFor()
    await esperarHabilitado(confirmar)
    await confirmar.click()
    await p.waitForURL(/\/registrar\/(revisao|conferencia)/)
    if (p.url().includes('conferencia')) {
      await p.getByRole('button', { name: 'Não, é outro' }).click()
      await p.waitForURL(/\/registrar\/revisao/)
    }
    await p.locator('textarea').fill(DESCRICAO)
    await p.getByText('Buscando endereço…').waitFor({ state: 'detached', timeout: 20_000 })
  })

  await passo('Sem internet o envio falha sem perder o rascunho (tela 26)', p, async () => {
    await visitante.contexto.setOffline(true)
    await p.getByRole('button', { name: 'Enviar registro' }).click()
    await p.getByText('Não foi possível enviar').waitFor({ timeout: 25_000 })
    await visitante.contexto.setOffline(false)
  })

  await passo('"Tentar novamente" envia e o problema chega ao banco', p, async () => {
    const criou = p.waitForResponse(
      (r) => /\/api\/v1\/problemas$/.test(r.url()) && r.request().method() === 'POST',
    )
    await p.getByRole('button', { name: 'Tentar novamente' }).click()
    const resposta = await criou
    confere(resposta.status() === 201, `POST /problemas respondeu ${resposta.status()}`)
    estado.problemaNovo = (await resposta.json()).id
    await p.getByRole('heading', { name: 'Registro enviado' }).waitFor()
    const linha = sql(
      `select descricao, autor_id, endereco_aproximado, round(st_distance(localizacao, st_makepoint(${POSICAO.longitude}, ${POSICAO.latitude})::geography)) from problemas where id = '${estado.problemaNovo}'`,
    ).split('|')
    confere(linha[0] === DESCRICAO, 'descrição diferente no banco')
    confere(linha[1] === estado.usuarioId, 'autor diferente no banco')
    confere(Number(linha[3]) < 60, `ponto a ${linha[3]} m da posição do GPS`)
    estado.endereco = linha[2]
    return `"${linha[2]}", a ${linha[3]} m do GPS`
  })

  await passo('"Ver no mapa" abre o alerta novo com o selo de autor', p, async () => {
    await p.getByRole('button', { name: 'Ver no mapa' }).click()
    await p.waitForURL(new RegExp(`/mapa/problema/${estado.problemaNovo}`))
    const card = p.getByRole('region', { name: 'Resumo do alerta' })
    await card.getByText('Buraco na via').waitFor()
    confere((await card.getByRole('button').count()) === 0, 'autor viu polegares no próprio alerta')
  })

  await passo('Registrar incidente (anônimo) e conferir a área no banco', p, async () => {
    await p.goto(BASE + '/registrar')
    await p.getByRole('link', { name: /^Evento/ }).click()
    await p.waitForURL(/\/registrar\/categoria\?tipo=incidente/)
    await p.getByRole('button', { name: /Roubo/ }).click()
    await p.getByRole('button', { name: 'Continuar' }).click()
    await p.waitForURL(/\/registrar\/incidente\/local/)
    await p.getByRole('button', { name: /continuar|confirmar/i }).click()
    await p.waitForURL(/\/registrar\/incidente\/revisao/)
    const criou = p.waitForResponse(
      (r) => /\/api\/v1\/incidentes$/.test(r.url()) && r.request().method() === 'POST',
    )
    await p.getByRole('button', { name: /enviar/i }).click()
    const resposta = await criou
    confere(resposta.status() === 201, `POST /incidentes respondeu ${resposta.status()}`)
    await p.getByRole('heading', { name: 'Relato enviado' }).waitFor()
    const linha = sql(
      `select raio_metros, rotulo_area from incidentes where autor_id = '${estado.usuarioId}' order by registrado_em desc limit 1`,
    ).split('|')
    confere(linha[0], 'incidente não está no banco')
    return `raio ${linha[0]} m · ${linha[1] || 'sem rótulo'}`
  })

  await passo(
    'Modo Incidentes: tocar no mapa abre a área com o relato (GET /incidentes/area)',
    p,
    async () => {
      await p.goto(BASE + '/mapa?mode=incidents')
      const mapa = p.locator('canvas.maplibregl-canvas')
      await mapa.waitFor()
      await p.waitForLoadState('networkidle')
      const area = p.waitForResponse((r) => /\/incidentes\/area/.test(r.url()))
      const caixa = await mapa.boundingBox()
      await p.mouse.click(caixa.x + caixa.width / 2, caixa.y + caixa.height / 2)
      const resposta = await area
      confere(resposta.status() === 200, `GET /incidentes/area respondeu ${resposta.status()}`)
      const corpo = await resposta.json()
      await p.waitForURL(/\/mapa\/area/)
      await p.getByRole('heading', { name: 'Área de incidentes' }).waitFor()
      const roubos = corpo.contagens.find((c) => c.nome === 'Roubo')
      confere(roubos?.dias7 >= 1, 'o roubo registrado não entrou na contagem da área')
      return `nível ${corpo.nivel} · ${roubos.dias7} roubo(s) em 7 dias no raio de ${corpo.raioMetros} m`
    },
  )

  await passo('Perfil mostra os totais e o histórico vindos de GET /me', p, async () => {
    await p.goto(BASE + '/perfil')
    await p.getByText(NOVO.nome).first().waitFor()
    await p.getByText('Buraco na via').first().waitFor()
    await p.getByText('Roubo').first().waitFor()
    const total = sql(
      `select (select count(*) from problemas where autor_id = '${estado.usuarioId}') + (select count(*) from incidentes where autor_id = '${estado.usuarioId}')`,
    )
    confere(total === '2', `esperava 2 registros no banco, há ${total}`)
  })

  await passo('Configurações → editar nome grava no banco (PATCH /me)', p, async () => {
    await p.goto(BASE + '/perfil/configuracoes')
    await p.getByRole('button', { name: /^Nome/ }).click()
    const campo = p.getByRole('dialog').getByRole('textbox')
    estado.nomeNovo = `${NOVO.nome} (editado)`
    await campo.fill(estado.nomeNovo)
    await p
      .getByRole('dialog')
      .getByRole('button', { name: /salvar/i })
      .click()
    await p.getByRole('dialog').waitFor({ state: 'detached' })
    await p.getByText(estado.nomeNovo).waitFor()
    const nome = sql(`select nome from usuarios where id = '${estado.usuarioId}'`)
    confere(nome === estado.nomeNovo, `nome no banco: ${nome}`)
  })

  await passo('Pedido de verificação fica pendente no banco', p, async () => {
    await p.goto(BASE + '/perfil')
    await p.getByRole('link', { name: 'Solicitar verificação' }).click()
    await p.waitForURL(/\/perfil\/verificacao/)
    await p.getByLabel('Tipo de vínculo').selectOption({ index: 1 })
    await p
      .getByLabel(/Justificativa/)
      .fill('Moro em Botafogo há dez anos e passo por estas ruas todos os dias a pé.')
    await p.getByRole('button', { name: 'Enviar pedido' }).click()
    await p.waitForURL(/\/perfil$/)
    await p.getByText('Pedido em análise').waitFor()
    const status = sql(
      `select status from solicitacoes_verificacao where usuario_id = '${estado.usuarioId}'`,
    )
    confere(status !== '', 'pedido não está no banco')
  })

  const vizinho = await novaPagina('cidadao2')
  await passo(
    'Outro cidadão entra pelo login e confirma o problema novo',
    vizinho.pagina,
    async () => {
      const q = vizinho.pagina
      await entrarPelaTela(q, 'cidadao2@tcc.local')
      await q.goto(BASE + `/mapa/problema/${estado.problemaNovo}`)
      const card = q.getByRole('region', { name: 'Resumo do alerta' })
      await card.waitFor()
      const antes = await card.innerText()
      const votou = q.waitForResponse((r) => /\/voto$/.test(r.url()))
      await q.getByRole('button', { name: 'Voto rápido: Sim, está lá' }).click()
      const resposta = await votou
      confere(resposta.ok(), `voto respondeu ${resposta.status()}`)
      await q.getByRole('button', { name: 'Voto rápido: Sim, está lá', pressed: true }).waitFor()
      await card.getByText('1 confirmaram').waitFor()
      const votos = sql(
        `select count(*) from votos where problema_id = '${estado.problemaNovo}' and usuario_id <> '${estado.usuarioId}'`,
      )
      confere(votos === '1', `esperava 1 voto no banco, há ${votos}`)
      return `antes: "${antes.split('\n').find((l) => l.includes('confirmaram'))}" → 1 confirmaram`
    },
  )

  await passo(
    'Recentes lista o problema novo (GET /problemas/recentes)',
    vizinho.pagina,
    async () => {
      const q = vizinho.pagina
      await q.goto(BASE + '/recentes')
      const url = `${BASE}/api/v1/problemas/recentes?lat=${POSICAO.latitude}&lng=${POSICAO.longitude}&raioKm=10&tamanho=100`
      const corpo = await (await fetch(url)).json()
      confere(
        corpo.itens.some((i) => i.id === estado.problemaNovo),
        'problema novo fora da resposta de recentes',
      )
      await q.getByText(estado.endereco).first().waitFor()
    },
  )
  await vizinho.contexto.close()

  const admin = await novaPagina('admin')
  await passo('Admin aprova o pedido na fila de verificação', admin.pagina, async () => {
    const q = admin.pagina
    await entrarPelaTela(q, 'admin@tcc.local')
    await q.goto(BASE + '/admin/verificacoes')
    const cartao = q.getByRole('article', { name: `Pedido de ${estado.nomeNovo}` })
    await cartao.waitFor()
    await cartao.getByRole('button', { name: /aprovar/i }).click()
    await cartao.waitFor({ state: 'detached' })
    const linha = sql(
      `select s.status, u.perfil, u.verificado_em is not null from solicitacoes_verificacao s join usuarios u on u.id = s.usuario_id where s.usuario_id = '${estado.usuarioId}'`,
    )
    return `banco: status/perfil/verificado = ${linha}`
  })
  await admin.contexto.close()

  await passo('Usuário vê "Perfil verificado" sem sair da conta (GET /me)', p, async () => {
    await p.goto(BASE + '/perfil')
    await p.getByText(/^Verificado em/).waitFor()
    await p.getByText('Seu voto tem peso maior').waitFor()
  })

  await passo('Bússola: girar o mapa mostra a direção e o toque volta ao norte', p, async () => {
    await p.goto(BASE + '/mapa')
    const mapa = p.locator('canvas.maplibregl-canvas')
    await mapa.waitFor()
    await mapa.focus()
    for (let i = 0; i < 6; i++) {
      await p.keyboard.press('Shift+ArrowRight')
      await esperar(250)
    }
    const bussola = p.getByRole('button', { name: 'Apontar para o norte' })
    await bussola.waitFor()
    await esperar(800)
    const letra = await bussola.innerText()
    confere(letra !== 'N', `a letra continuou N com o mapa girado`)
    await bussola.click()
    await bussola.waitFor({ state: 'detached' })
    return `letra ${letra} com o mapa girado`
  })

  await passo('Token inválido: o voto pede login de novo (regra 13)', p, async () => {
    await p.evaluate(() => {
      const chave = 'ocorrencias.sessao'
      const salvo = JSON.parse(localStorage.getItem(chave))
      salvo.state.sessao.token = 'token-invalido'
      localStorage.setItem(chave, JSON.stringify(salvo))
    })
    await p.goto(BASE + `/mapa/problema/${estado.problemaSeed}`)
    await p.getByRole('region', { name: 'Resumo do alerta' }).waitFor()
    await p
      .getByRole('button', { name: /^Voto rápido/ })
      .first()
      .click()
    await p.getByRole('button', { name: 'Já tenho conta' }).waitFor()
    await p.getByRole('button', { name: 'Agora não' }).click()
  })

  await passo('Sair da conta volta ao modo visitante', p, async () => {
    await entrarPelaTela(p, NOVO.email, NOVO.senha)
    await p.goto(BASE + '/perfil/configuracoes')
    await p.getByRole('button', { name: 'Sair da conta' }).click()
    await p.waitForURL(/\/mapa/)
    const sessao = await p.evaluate(() => localStorage.getItem('ocorrencias.sessao'))
    confere(!sessao || !JSON.parse(sessao).state.sessao, 'sessão continua no navegador')
  })
  await visitante.contexto.close()

  const mesa = await novaPagina('desktop', DESKTOP)
  await passo('Desktop: alerta abre no painel lateral ao lado do mapa', mesa.pagina, async () => {
    const q = mesa.pagina
    await q.goto(BASE + `/mapa/problema/${estado.problemaNovo}`)
    if (q.url().includes('permissao')) await q.getByRole('button', { name: 'Continuar' }).click()
    await q.getByRole('region', { name: 'Resumo do alerta' }).getByText('Buraco na via').waitFor()
    await q.locator(`[data-problema="${estado.problemaNovo}"]`).waitFor()
    await q.waitForLoadState('networkidle')
    await q.screenshot({ path: `${SAIDA}/desktop-painel.png` })
  })
  await mesa.contexto.close()
} catch {
} finally {
  await navegador.close()
  relatorio()
}

async function passo(nome, pagina, acao) {
  const inicio = Date.now()
  try {
    const detalhe = await acao()
    resultados.push({ ok: true, nome, detalhe, ms: Date.now() - inicio })
    console.log(`✓ ${nome}${detalhe ? ` — ${detalhe}` : ''}`)
  } catch (erro) {
    const arquivo = `${SAIDA}/falha-${resultados.length + 1}.png`
    await pagina.screenshot({ path: arquivo }).catch(() => {})
    resultados.push({
      ok: false,
      nome,
      detalhe: erro.message.split('\n')[0],
      ms: Date.now() - inicio,
    })
    console.log(
      `✗ ${nome}\n  ${erro.message.split('\n').slice(0, 3).join('\n  ')}\n  print: ${arquivo}`,
    )
    throw erro
  }
}

function confere(condicao, mensagem) {
  if (!condicao) throw new Error(mensagem)
}

async function esperarHabilitado(botao, limite = 20_000) {
  const fim = Date.now() + limite
  while (await botao.isDisabled()) {
    if (Date.now() > fim) throw new Error('botão continuou desabilitado')
    await esperar(200)
  }
}

async function novaPagina(nome, tela = CELULAR, { primeiraVez = false } = {}) {
  const celular = tela.width < 1024
  const contexto = await navegador.newContext({
    viewport: tela,
    isMobile: celular,
    hasTouch: celular,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    permissions: ['geolocation'],
    geolocation: POSICAO,
  })
  await contexto.addInitScript(() => localStorage.setItem('ocorrencias.legendaVista', '1'))
  if (!primeiraVez) {
    await contexto.addInitScript(() =>
      localStorage.setItem(
        'ocorrencias.tema',
        JSON.stringify({ state: { preferencia: 'claro', escolhido: true }, version: 0 }),
      ),
    )
  }
  const pagina = await contexto.newPage()
  pagina.on('console', (m) => {
    if (m.type() === 'error') errosConsole.push(`[${nome}] ${m.text().slice(0, 200)}`)
  })
  pagina.on('pageerror', (e) => errosConsole.push(`[${nome}] ${e.message.slice(0, 200)}`))
  pagina.on('response', (r) => {
    const url = new URL(r.url())
    if (url.pathname.startsWith('/api/') && r.status() >= 400) {
      problemasRede.push(`[${nome}] ${r.request().method()} ${url.pathname} → ${r.status()}`)
    }
  })
  return { contexto, pagina }
}

async function entrarPelaTela(pagina, email, senha = SENHA) {
  await pagina.goto(BASE + '/login')
  if (pagina.url().includes('permissao')) {
    await pagina.getByRole('button', { name: 'Continuar' }).click()
    await pagina.goto(BASE + '/login')
  }
  await pagina.getByLabel('E-mail').fill(email)
  await pagina.getByLabel('Senha', { exact: true }).fill(senha)
  const entrou = pagina.waitForResponse((r) => /\/auth\/login/.test(r.url()))
  await pagina.getByRole('button', { name: 'Entrar' }).click()
  const resposta = await entrou
  confere(resposta.ok(), `login de ${email} respondeu ${resposta.status()}`)
  await pagina.waitForURL((url) => !url.pathname.startsWith('/login'))
}

function sql(consulta) {
  return execFileSync(
    'docker',
    ['exec', DB, 'psql', '-U', 'ocorrencias', '-d', 'ocorrencias', '-tAc', consulta],
    { encoding: 'utf8' },
  ).trim()
}

async function conferirAmbiente() {
  const checar = async (url, rotulo) => {
    try {
      const r = await fetch(url)
      if (!r.ok) throw new Error(`${r.status}`)
    } catch (erro) {
      console.error(`${rotulo} fora do ar (${url}): ${erro.message}`)
      process.exit(1)
    }
  }
  await checar(BASE, 'Front')
  await checar(BASE + '/api/v1/saude/banco', 'API/banco')
  sql('select 1')
}

function relatorio() {
  const ok = resultados.filter((r) => r.ok).length
  console.log(`\n${ok}/${resultados.length} passos ok · conta ${NOVO.email}`)
  const inesperados = problemasRede.filter((l) => !l.endsWith('→ 401'))
  if (inesperados.length) console.log('\nRespostas de erro da API:\n  ' + inesperados.join('\n  '))
  const console_ = errosConsole.filter(
    (l) => !l.includes('ERR_INTERNET_DISCONNECTED') && !l.includes('status of 401'),
  )
  if (console_.length) console.log('\nErros no console:\n  ' + console_.join('\n  '))
  if (ok !== resultados.length) process.exitCode = 1
}
