import { http, HttpResponse } from 'msw'

import { server } from '@/infrastructure/mocks/server'

import { fetchIcons, loadIcon, bodyPaths, clearIconCache, resultName, iconifyName } from './iconify'

const HOST = 'https://api.iconify.design'
const validBody = '<path fill="currentColor" d="M8.5 17.5q-1.4 0-1.9-.5L12 4z"/>'

function iconifyIcons(icons: Record<string, string>) {
  return http.get(`${HOST}/material-symbols.json`, () =>
    HttpResponse.json({
      prefix: 'material-symbols',
      width: 24,
      height: 24,
      icons: Object.fromEntries(Object.entries(icons).map(([name, body]) => [name, { body }])),
    }),
  )
}

beforeEach(() => clearIconCache())

describe('names', () => {
  it('Material Symbols (snake_case) ↔ Iconify (kebab + -rounded)', () => {
    expect(iconifyName('edit_road')).toBe('edit-road-rounded')
    expect(resultName('material-symbols:edit-road-rounded')).toBe('edit_road')
  })

  it('only the solid Rounded style works; outline, sharp and other sets are dropped', () => {
    expect(resultName('material-symbols:ico-a-outline-rounded')).toBeNull()
    expect(resultName('material-symbols:ico-a-sharp')).toBeNull()
    expect(resultName('material-symbols:ico-a')).toBeNull()
    expect(resultName('mdi:ico-a-rounded')).toBeNull()
  })
})

describe('bodyPaths', () => {
  it('accepts only <path d>', () => {
    expect(bodyPaths(validBody)).toEqual(['M8.5 17.5q-1.4 0-1.9-.5L12 4z'])
    expect(bodyPaths(`${validBody}<path d="M1 1h2"/>`)).toHaveLength(2)
  })

  it.each([
    ['script', '<script>alert(1)</script>'],
    ['nested svg with event', '<path d="M1 1" onload="x()"/><svg onload="x()"></svg>'],
    ['d com caracteres de comando fora do SVG', '<path d="M1 1 <img src=x onerror=x()>"/>'],
    ['no path', '<g></g>'],
    ['empty', ''],
  ])('rejects %s', (_, body) => {
    expect(bodyPaths(body)).toBeNull()
  })
})

describe('loadIcon', () => {
  it('requests from the same instant travel in one request, and the second use comes from cache', async () => {
    const requests: string[] = []
    server.use(
      http.get(`${HOST}/material-symbols.json`, ({ request }) => {
        requests.push(new URL(request.url).searchParams.get('icons')!)
        return HttpResponse.json({
          width: 24,
          icons: { 'ico-a-rounded': { body: validBody }, 'ico-b-rounded': { body: validBody } },
        })
      }),
    )

    const [flood, park] = await Promise.all([loadIcon('ico_a'), loadIcon('ico_b')])
    await loadIcon('ico_a')

    expect(requests).toEqual(['ico-a-rounded,ico-b-rounded'])
    expect(flood).toEqual({ paths: ['M8.5 17.5q-1.4 0-1.9-.5L12 4z'], pageSize: 24 })
    expect(park).not.toBeNull()
  })

  it('accepts a hyphen in the name, like the categories contract', async () => {
    server.use(iconifyIcons({ 'ico-a-b-rounded': validBody }))

    expect(await loadIcon('ico-a-b')).not.toBeNull()
  })

  it('stores in localStorage: another session does not ask again', async () => {
    server.use(iconifyIcons({ 'ico-a-rounded': validBody }))
    await loadIcon('ico_a')
    const saved = localStorage.getItem('ocorrencias.iconesRemotos')

    server.resetHandlers()
    expect(saved).toContain('ico_a')
    expect(await loadIcon('ico_a')).not.toBeNull()
  })

  it('icon with a suspicious body or unknown to Iconify becomes null', async () => {
    server.use(iconifyIcons({ 'ico-a-rounded': '<script>x</script>' }))

    expect(await loadIcon('ico_a')).toBeNull()
    expect(await loadIcon('nonexistent')).toBeNull()
  })

  it('network failure becomes null and is not retried in the session', async () => {
    let requests = 0
    server.use(
      http.get(`${HOST}/material-symbols.json`, () => {
        requests++
        return new HttpResponse(null, { status: 503 })
      }),
    )

    expect(await loadIcon('ico_a')).toBeNull()
    expect(await loadIcon('ico_a')).toBeNull()
    expect(requests).toBe(1)
  })
})

describe('loadIcon: hostile inputs', () => {
  it.each([
    ['caminhos que não é lista', { paths: 'x', pageSize: 24 }],
    ['d com caracteres fora do SVG', { paths: ['M1 1 <script>'], pageSize: 24 }],
    ['absurd size', { paths: ['M1 1h4'], pageSize: 100000 }],
    ['no size', { paths: ['M1 1h4'] }],
    ['null', null],
  ])(
    'tampered localStorage cache (%s) is ignored and the icon comes from the network',
    async (_, lixo) => {
      localStorage.setItem('ocorrencias.iconesRemotos', JSON.stringify({ ico_a: lixo }))
      server.use(iconifyIcons({ 'ico-a-rounded': validBody }))

      expect(await loadIcon('ico_a')).toEqual({
        paths: ['M8.5 17.5q-1.4 0-1.9-.5L12 4z'],
        pageSize: 24,
      })
    },
  )

  it('cache that is not an object does not break', async () => {
    localStorage.setItem('ocorrencias.iconesRemotos', '[1,2]')
    server.use(iconifyIcons({ 'ico-a-rounded': validBody }))

    expect(await loadIcon('ico_a')).not.toBeNull()
  })

  it.each(['a,b', 'Maiuscula', 'com espaço', 'a/b', ''])(
    'name "%s" never reaches the network',
    async (name) => {
      expect(await loadIcon(name)).toBeNull()
    },
  )

  it.each(['constructor', '__proto__', 'toString'])(
    'object property name (%s) does not return the prototype as a response',
    async (name) => {
      server.use(iconifyIcons({}))

      expect(await loadIcon(name)).toBeNull()
      expect(localStorage.getItem('ocorrencias.iconesRemotos') ?? '').not.toContain(`"${name}"`)
    },
  )

  it('absurd width from the network discards the icon', async () => {
    server.use(
      http.get(`${HOST}/material-symbols.json`, () =>
        HttpResponse.json({ width: 99999, icons: { 'ico-a-rounded': { body: validBody } } }),
      ),
    )

    expect(await loadIcon('ico_a')).toBeNull()
  })
})

describe('fetchIcons', () => {
  it('returns the solid Rounded names, without repeats', async () => {
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

    expect(await fetchIcons('ico_a')).toEqual(['ico_a', 'ico_c'])
  })
})
