import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { prePermissaoVista } from '../lib/pre-permissao'
import { useLocalizacaoStore } from '../stores/localizacao-store'

/**
 * Tela 17: na primeira abertura do mapa, se o navegador ainda não perguntou (prompt), mostra a
 * explicação antes do pedido. granted/denied/indisponível pulam a tela.
 */
export function useRedirecionarPrePermissao() {
  const estado = useLocalizacaoStore((s) => s.estado)
  const navigate = useNavigate()
  const { pathname, search } = useLocation()

  useEffect(() => {
    if (estado !== 'prompt' || !pathname.startsWith('/mapa') || prePermissaoVista()) return
    navigate('/permissao-localizacao', { replace: true, state: { de: `${pathname}${search}` } })
  }, [estado, pathname, search, navigate])
}
