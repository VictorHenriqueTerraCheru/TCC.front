import { http, HttpResponse } from 'msw'

import { server } from '@/infrastructure/mocks/server'

import {
  buscarIcones,
  carregarIcone,
  caminhosDoCorpo,
  limparCacheDeIcones,
  nomeDoResultado,
  nomeNoIconify,
} from './iconify'

const HOST = 'https://api.iconify.design'
const corpoValido = '<path fill="currentColor" d="M8.5 17.5q-1.4 0-1.9-.5L12 4z"/>'

function iconesDoIconify(icones: Record<string, string>) {
  return http.get(`${HOST}/material-symbols.json`, () =>
    HttpResponse.json({
      prefix: 'material-symbols',
      width: 24,
      height: 24,
      icons: Object.fromEntries(Object.entries(icones).map(([nome, body]) => [nome, { body }])),
    }),
  )
}

beforeEach(() => limparCacheDeIcones())

describe('nomes', () => {
  it('Material Symbols (snake_case) ↔ Iconify (kebab + -rounded)', () => {
    expect(nomeNoIconify('edit_road')).toBe('edit-road-rounded')
    expect(nomeDoResultado('material-symbols:edit-road-rounded')).toBe('edit_road')
  })

  it('só o estilo Rounded sólido serve; outline, sharp e outro conjunto saem', () => {
    expect(nomeDoResultado('material-symbols:ico-a-outline-rounded')).toBeNull()
    expect(nomeDoResultado('material-symbols:ico-a-sharp')).toBeNull()
    expect(nomeDoResultado('material-symbols:ico-a')).toBeNull()
    expect(nomeDoResultado('mdi:ico-a-rounded')).toBeNull()
  })
})

describe('caminhosDoCorpo', () => {
  it('aceita só <path d>', () => {
    expect(caminhosDoCorpo(corpoValido)).toEqual(['M8.5 17.5q-1.4 0-1.9-.5L12 4z'])
    expect(caminhosDoCorpo(`${corpoValido}<path d="M1 1h2"/>`)).toHaveLength(2)
  })

  it.each([
    ['script', '<script>alert(1)</script>'],
    ['svg aninhado com evento', '<path d="M1 1" onload="x()"/><svg onload="x()"></svg>'],
    ['d com caracteres de comando fora do SVG', '<path d="M1 1 <img src=x onerror=x()>"/>'],
    ['sem path', '<g></g>'],
    ['vazio', ''],
  ])('rejeita %s', (_, corpo) => {
    expect(caminhosDoCorpo(corpo)).toBeNull()
  })
})

describe('carregarIcone', () => {
  it('pedidos do mesmo instante viajam em uma requisição, e o segundo uso vem do cache', async () => {
    const pedidos: string[] = []
    server.use(
      http.get(`${HOST}/material-symbols.json`, ({ request }) => {
        pedidos.push(new URL(request.url).searchParams.get('icons')!)
        return HttpResponse.json({
          width: 24,
          icons: { 'ico-a-rounded': { body: corpoValido }, 'ico-b-rounded': { body: corpoValido } },
        })
      }),
    )

    const [flood, park] = await Promise.all([carregarIcone('ico_a'), carregarIcone('ico_b')])
    await carregarIcone('ico_a')

    expect(pedidos).toEqual(['ico-a-rounded,ico-b-rounded'])
    expect(flood).toEqual({ caminhos: ['M8.5 17.5q-1.4 0-1.9-.5L12 4z'], tamanho: 24 })
    expect(park).not.toBeNull()
  })

  it('aceita hífen no nome, como o contrato de categorias', async () => {
    server.use(iconesDoIconify({ 'ico-a-b-rounded': corpoValido }))

    expect(await carregarIcone('ico-a-b')).not.toBeNull()
  })

  it('guarda no localStorage: outra sessão não pede de novo', async () => {
    server.use(iconesDoIconify({ 'ico-a-rounded': corpoValido }))
    await carregarIcone('ico_a')
    const salvo = localStorage.getItem('ocorrencias.iconesRemotos')

    server.resetHandlers() // qualquer pedido agora falharia (onUnhandledFrame: 'error')
    expect(salvo).toContain('ico_a')
    expect(await carregarIcone('ico_a')).not.toBeNull()
  })

  it('ícone com corpo suspeito ou que o Iconify não conhece vira null', async () => {
    server.use(iconesDoIconify({ 'ico-a-rounded': '<script>x</script>' }))

    expect(await carregarIcone('ico_a')).toBeNull()
    expect(await carregarIcone('naoexiste')).toBeNull()
  })

  it('falha de rede vira null e não é repetida na sessão', async () => {
    let pedidos = 0
    server.use(
      http.get(`${HOST}/material-symbols.json`, () => {
        pedidos++
        return new HttpResponse(null, { status: 503 })
      }),
    )

    expect(await carregarIcone('ico_a')).toBeNull()
    expect(await carregarIcone('ico_a')).toBeNull()
    expect(pedidos).toBe(1)
  })
})

describe('carregarIcone: entradas hostis', () => {
  it.each([
    ['caminhos que não é lista', { caminhos: 'x', tamanho: 24 }],
    ['d com caracteres fora do SVG', { caminhos: ['M1 1 <script>'], tamanho: 24 }],
    ['tamanho absurdo', { caminhos: ['M1 1h4'], tamanho: 100000 }],
    ['sem tamanho', { caminhos: ['M1 1h4'] }],
    ['null', null],
  ])('cache do localStorage adulterado (%s) é ignorado e o ícone vem da rede', async (_, lixo) => {
    localStorage.setItem('ocorrencias.iconesRemotos', JSON.stringify({ ico_a: lixo }))
    server.use(iconesDoIconify({ 'ico-a-rounded': corpoValido }))

    expect(await carregarIcone('ico_a')).toEqual({
      caminhos: ['M8.5 17.5q-1.4 0-1.9-.5L12 4z'],
      tamanho: 24,
    })
  })

  it('cache que não é objeto não quebra', async () => {
    localStorage.setItem('ocorrencias.iconesRemotos', '[1,2]')
    server.use(iconesDoIconify({ 'ico-a-rounded': corpoValido }))

    expect(await carregarIcone('ico_a')).not.toBeNull()
  })

  it.each(['a,b', 'Maiuscula', 'com-hifen', ''])('nome "%s" nem chega à rede', async (nome) => {
    // Sem handler: qualquer requisição derrubaria o teste (onUnhandledFrame: 'error').
    expect(await carregarIcone(nome)).toBeNull()
  })

  it.each(['constructor', '__proto__', 'toString'])(
    'nome de propriedade de objeto (%s) não vira o protótipo como resposta',
    async (nome) => {
      server.use(iconesDoIconify({}))

      expect(await carregarIcone(nome)).toBeNull()
      expect(localStorage.getItem('ocorrencias.iconesRemotos') ?? '').not.toContain(`"${nome}"`)
    },
  )

  it('largura absurda vinda da rede descarta o ícone', async () => {
    server.use(
      http.get(`${HOST}/material-symbols.json`, () =>
        HttpResponse.json({ width: 99999, icons: { 'ico-a-rounded': { body: corpoValido } } }),
      ),
    )

    expect(await carregarIcone('ico_a')).toBeNull()
  })
})

describe('buscarIcones', () => {
  it('devolve os nomes Rounded sólidos, sem repetir', async () => {
    server.use(
      http.get(`${HOST}/search`, ({ request }) => {
        expect(new URL(request.url).searchParams.get('prefix')).toBe('material-symbols')
        return HttpResponse.json({
          icons: [
            'material-symbols:ico-a',
            'material-symbols:ico-a-outline-rounded',
            'material-symbols:ico-a-rounded',
            'material-symbols:ico-a-rounded',
            'material-symbols:ico-c-rounded',
          ],
        })
      }),
    )

    expect(await buscarIcones('ico_a')).toEqual(['ico_a', 'ico_c'])
  })
})
