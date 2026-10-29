import { Outlet } from 'react-router'

import { useAplicarTema } from '@/common/hooks/use-tema'
import { useRedirecionarEscolhaTema } from '@/features/aparencia'

import {
  EntreParaContinuar,
  useDescartarPendenciaAoSairDoLogin,
  useSincronizarCacheComSessao,
} from '@/features/auth'
import { useMonitorarLocalizacao, useRedirecionarPrePermissao } from '@/features/localizacao'

export function RaizLayout() {
  useAplicarTema()
  useMonitorarLocalizacao()
  const temaEscolhido = useRedirecionarEscolhaTema()
  useRedirecionarPrePermissao(temaEscolhido)
  useSincronizarCacheComSessao()
  useDescartarPendenciaAoSairDoLogin()
  return (
    <>
      <Outlet />
      <EntreParaContinuar />
    </>
  )
}
