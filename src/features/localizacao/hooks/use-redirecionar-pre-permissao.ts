import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { prePermissaoVista } from '../lib/pre-permissao'
import { useLocalizacaoStore } from '../stores/localizacao-store'

export function useRedirecionarPrePermissao(ativo = true) {
  const estado = useLocalizacaoStore((s) => s.estado)
  const navigate = useNavigate()
  const { pathname, search } = useLocation()

  useEffect(() => {
    if (!ativo || estado !== 'prompt' || !pathname.startsWith('/mapa') || prePermissaoVista())
      return
    navigate('/permissao-localizacao', { replace: true, state: { de: `${pathname}${search}` } })
  }, [ativo, estado, pathname, search, navigate])
}
