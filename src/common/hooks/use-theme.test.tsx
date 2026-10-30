import { act, render, renderHook } from '@testing-library/react'

import { useApplyTheme, useTheme, useThemeStore } from './use-theme'

function systemDark(dark: boolean) {
  const original = window.matchMedia
  vi.stubGlobal('matchMedia', (query: string) => ({
    ...original(query),
    matches: query.includes('prefers-color-scheme: dark') ? dark : original(query).matches,
  }))
}

describe('theme', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    delete document.documentElement.dataset.theme
  })

  it('on first run it is system and not chosen yet', () => {
    useThemeStore.setState(useThemeStore.getInitialState())
    expect(useThemeStore.getState()).toMatchObject({ preference: 'system', chosen: false })
  })

  it.each([
    ['system', true, 'dark'],
    ['system', false, 'light'],
    ['light', true, 'light'],
    ['dark', false, 'dark'],
  ] as const)('preference %s with dark system=%s → %s', (preference, dark, expected) => {
    systemDark(dark)
    useThemeStore.setState({ preference })
    const { result } = renderHook(() => useTheme())
    expect(result.current).toBe(expected)
  })

  it('applies the theme to <html> and to the browser bar color, and follows changes', () => {
    const meta = document.createElement('meta')
    meta.name = 'theme-color'
    document.head.append(meta)
    useThemeStore.setState({ preference: 'dark' })

    function Root() {
      useApplyTheme()
      return null
    }
    render(<Root />)
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(meta.content).toBe('#121a24')

    act(() => useThemeStore.getState().setPreference('light'))
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(meta.content).toBe('#f2f2f7')
    meta.remove()
  })

  it('stores the choice in localStorage (read by the index.html script before paint)', () => {
    act(() => {
      useThemeStore.getState().setPreference('dark')
      useThemeStore.getState().completeChoice()
    })
    expect(JSON.parse(localStorage.getItem('ocorrencias.tema')!).state).toEqual({
      preference: 'dark',
      chosen: true,
    })
  })
})
