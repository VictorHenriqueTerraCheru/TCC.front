import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'

import { CadastroPage, EntrarPage } from '@/features/auth'
import { PermissaoLocalizacaoPage } from '@/features/localizacao'
import { AreaIncidentesPage, DetalheProblemaPage, MapaPage } from '@/features/mapa'
import { RecentesPage } from '@/features/problemas'
import {
  CategoriaPage,
  ConferenciaPage,
  LocalIncidentePage,
  LocalProblemaPage,
  RegistroLayout,
  RevisaoIncidentePage,
  RevisaoProblemaPage,
  SucessoIncidentePage,
  SucessoProblemaPage,
} from '@/features/registro'
import { FilaVerificacaoPage } from '@/features/admin'
import { ConfiguracoesPage, HistoricoPage, PerfilPage } from '@/features/perfil'
import { SolicitarVerificacaoPage } from '@/features/verificacao'

import { AppLayout } from './layouts/app-layout'
import { RaizLayout } from './layouts/raiz-layout'
import { TelaCheiaLayout } from './layouts/tela-cheia-layout'
import { PaginaNaoEncontrada } from './pagina-nao-encontrada'

// Rotas de docs/TELAS.md. Cada page é a "borda" da feature, como um module no back.
export const rotas: RouteObject[] = [
  {
    element: <RaizLayout />,
    errorElement: <PaginaNaoEncontrada />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/mapa" replace /> },
          {
            path: 'mapa',
            element: <MapaPage />,
            children: [
              { path: 'problema/:id', element: <DetalheProblemaPage /> },
              { path: 'area', element: <AreaIncidentesPage /> },
            ],
          },
          { path: 'recentes', element: <RecentesPage /> },
          { path: 'perfil', element: <PerfilPage /> },
          { path: 'perfil/verificacao', element: <SolicitarVerificacaoPage /> },
          { path: 'perfil/historico', element: <HistoricoPage /> },
          { path: 'perfil/configuracoes', element: <ConfiguracoesPage /> },
          { path: 'admin/verificacoes', element: <FilaVerificacaoPage /> },
          {
            path: 'registrar',
            element: <RegistroLayout />,
            children: [
              { index: true, element: <CategoriaPage /> },
              { path: 'local', element: <LocalProblemaPage /> },
              { path: 'conferencia', element: <ConferenciaPage /> },
              { path: 'revisao', element: <RevisaoProblemaPage /> },
              { path: 'sucesso', element: <SucessoProblemaPage /> },
              { path: 'incidente/local', element: <LocalIncidentePage /> },
              { path: 'incidente/revisao', element: <RevisaoIncidentePage /> },
              { path: 'incidente/sucesso', element: <SucessoIncidentePage /> },
            ],
          },
        ],
      },
      {
        element: <TelaCheiaLayout />,
        children: [
          { path: 'login', element: <EntrarPage /> },
          { path: 'cadastro', element: <CadastroPage /> },
          { path: 'permissao-localizacao', element: <PermissaoLocalizacaoPage /> },
        ],
      },
    ],
  },
]

export function criarRouter() {
  return createBrowserRouter(rotas)
}
