import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'

import { EntrarPage } from '@/features/auth'
import { AreaIncidentesPage, DetalheProblemaPage, MapaPage } from '@/features/mapa'
import { RecentesPage } from '@/features/problemas'
import { RegistrarPage } from '@/features/registro'
import { PerfilPage } from '@/features/usuarios'

import { AppLayout } from './layouts/app-layout'
import { PaginaNaoEncontrada } from './pagina-nao-encontrada'

// Rotas de docs/TELAS.md. Cada page é a "borda" da feature, como um module no back.
export const rotas: RouteObject[] = [
  {
    element: <AppLayout />,
    errorElement: <PaginaNaoEncontrada />,
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
      { path: 'registrar', element: <RegistrarPage /> },
      { path: 'login', element: <EntrarPage titulo="Entrar" /> },
      { path: 'cadastro', element: <EntrarPage titulo="Criar conta" /> },
    ],
  },
]

export function criarRouter() {
  return createBrowserRouter(rotas)
}
