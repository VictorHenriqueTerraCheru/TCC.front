import { entrarComoCidadao } from '@/test/sessao'

import { useGuardaStore } from './guarda-store'
import { provedorAutenticacao, sessaoAtual, useSessaoStore } from './sessao-store'

const HORA = 3_600_000

function entrarExpirando(emMs: number) {
  useSessaoStore.getState().entrar({
    token: 'jwt-teste',
    expiresAt: new Date(Date.now() + emMs).toISOString(),
    user: { id: 'u-1', name: 'Ana', email: 'ana@tcc.local', role: 'citizen' },
  })
}

beforeEach(() => {
  useSessaoStore.setState({ sessao: null })
  useGuardaStore.setState({ reason: null, expirou: false, pendencia: null })
})

describe('sessão (regras 11 e 13)', () => {
  it('sessaoAtual devolve a sessão enquanto ela vale', () => {
    entrarExpirando(HORA)

    expect(sessaoAtual()?.token).toBe('jwt-teste')
    expect(useGuardaStore.getState().expirou).toBe(false)
  })

  it('sessaoAtual sem sessão devolve null e não marca expiração', () => {
    expect(sessaoAtual()).toBeNull()
    expect(useGuardaStore.getState().expirou).toBe(false)
  })

  it('sessaoAtual limpa a sessão vencida e marca a expiração para a guarda', () => {
    entrarExpirando(-1000)

    expect(sessaoAtual()).toBeNull()
    expect(useSessaoStore.getState().sessao).toBeNull()
    expect(useGuardaStore.getState().expirou).toBe(true)
  })

  it('expiraEm exatamente agora já conta como vencida', () => {
    vi.useFakeTimers()
    try {
      vi.setSystemTime(new Date('2026-10-20T12:00:00Z'))
      useSessaoStore.getState().entrar({
        token: 'jwt-teste',
        expiresAt: '2026-10-20T12:00:00Z',
        user: { id: 'u-1', name: 'Ana', email: 'ana@tcc.local', role: 'citizen' },
      })

      expect(sessaoAtual()).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it('o provedor entrega o token da sessão válida e null para visitante ou sessão vencida', () => {
    expect(provedorAutenticacao.obterToken()).toBeNull()

    entrarExpirando(HORA)
    expect(provedorAutenticacao.obterToken()).toBe('jwt-teste')

    entrarExpirando(-1000)
    expect(provedorAutenticacao.obterToken()).toBeNull()
  })

  it('aoExpirarSessao (401) limpa a sessão e marca a expiração', () => {
    entrarComoCidadao()

    provedorAutenticacao.aoExpirarSessao()

    expect(useSessaoStore.getState().sessao).toBeNull()
    expect(useGuardaStore.getState().expirou).toBe(true)
  })

  it('sair não marca expiração (só o vencimento marca)', () => {
    entrarComoCidadao()

    useSessaoStore.getState().sair()

    expect(useGuardaStore.getState().expirou).toBe(false)
  })

  it('a sessão é gravada no localStorage', () => {
    entrarExpirando(HORA)

    const guardado = JSON.parse(localStorage.getItem('ocorrencias.sessao') ?? '{}')
    expect(guardado.state.sessao.token).toBe('jwt-teste')
  })
})
