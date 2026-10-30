import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'

import { ChooseThemePage } from '@/features/appearance'
import { RegisterPage, LoginPage } from '@/features/auth'
import { LocationPermissionPage } from '@/features/location'
import { IncidentAreaPage, IssueDetailPage, MapPage } from '@/features/map'
import { RecentPage } from '@/features/issues'
import {
  CategoryPage,
  DuplicateCheckPage,
  IncidentLocationPage,
  IssueLocationPage,
  ReportLayout,
  TypePage,
  IncidentReviewPage,
  IssueReviewPage,
  IncidentSuccessPage,
  IssueSuccessPage,
} from '@/features/report'
import { AdminCategoriesPage, VerificationQueuePage, AdminUsersPage } from '@/features/admin'
import { SettingsPage, HistoryPage, ProfilePage } from '@/features/profile'
import { RequestVerificationPage } from '@/features/verification'

import { AppLayout } from './layouts/app-layout'
import { RootLayout } from './layouts/root-layout'
import { FullScreenLayout } from './layouts/full-screen-layout'
import { NotFoundPage } from './not-found-page'

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/mapa" replace /> },
          {
            path: 'mapa',
            element: <MapPage />,
            children: [
              { path: 'problema/:id', element: <IssueDetailPage /> },
              { path: 'area', element: <IncidentAreaPage /> },
            ],
          },
          { path: 'recentes', element: <RecentPage /> },
          { path: 'perfil', element: <ProfilePage /> },
          { path: 'perfil/verificacao', element: <RequestVerificationPage /> },
          { path: 'perfil/historico', element: <HistoryPage /> },
          { path: 'perfil/configuracoes', element: <SettingsPage /> },
          { path: 'admin/verificacoes', element: <VerificationQueuePage /> },
          { path: 'admin/categorias', element: <AdminCategoriesPage /> },
          { path: 'admin/usuarios', element: <AdminUsersPage /> },
          {
            path: 'registrar',
            element: <ReportLayout />,
            children: [
              { index: true, element: <TypePage /> },
              { path: 'categoria', element: <CategoryPage /> },
              { path: 'local', element: <IssueLocationPage /> },
              { path: 'conferencia', element: <DuplicateCheckPage /> },
              { path: 'revisao', element: <IssueReviewPage /> },
              { path: 'sucesso', element: <IssueSuccessPage /> },
              { path: 'incidente/local', element: <IncidentLocationPage /> },
              { path: 'incidente/revisao', element: <IncidentReviewPage /> },
              { path: 'incidente/sucesso', element: <IncidentSuccessPage /> },
            ],
          },
        ],
      },
      {
        element: <FullScreenLayout />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'cadastro', element: <RegisterPage /> },
          { path: 'aparencia', element: <ChooseThemePage /> },
          { path: 'permissao-localizacao', element: <LocationPermissionPage /> },
        ],
      },
    ],
  },
]

export function createAppRouter() {
  return createBrowserRouter(routes)
}
