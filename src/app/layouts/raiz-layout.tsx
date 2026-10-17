import { Outlet } from 'react-router'

import {
  EntreParaContinuar,
  useDescartarPendenciaAoSairDoLogin,
  useSincronizarCacheComSessao,
} from '@/features/auth'
import { useMonitorarLocalizacao, useRedirecionarPrePermissao } from '@/features/localizacao'

/** Envolve todas as rotas: serviços que valem para o app inteiro e a folha "Entre para…". */
export function RaizLayout() {
  useMonitorarLocalizacao()
  useRedirecionarPrePermissao()
  useSincronizarCacheComSessao()
  useDescartarPendenciaAoSairDoLogin()
  return (
    <>
      <Outlet />
      <EntreParaContinuar />
    </>
  )
}
