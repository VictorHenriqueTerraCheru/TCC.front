import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'

import { useGuardaStore } from '../stores/guarda-store'
import { useSessaoStore } from '../stores/sessao-store'

const TELAS_DE_LOGIN = new Set(['/login', '/cadastro'])

/**
 * Saiu do login/cadastro sem entrar (ex.: "voltar" do navegador ou do celular, que não passam
 * pelo "←" da tela): a ação pendente é descartada, senão um login futuro qualquer a executaria.
 */
export function useDescartarPendenciaAoSairDoLogin() {
  const { pathname } = useLocation()
  const anteriorRef = useRef(pathname)

  useEffect(() => {
    const saiuDoLogin = TELAS_DE_LOGIN.has(anteriorRef.current) && !TELAS_DE_LOGIN.has(pathname)
    anteriorRef.current = pathname
    if (saiuDoLogin && !useSessaoStore.getState().sessao) useGuardaStore.getState().descartar()
  }, [pathname])
}
