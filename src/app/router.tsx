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
          { index: true, element: <Navigate to="/map" replace /> },
          {
            path: 'map',
            element: <MapPage />,
            children: [
              { path: 'issue/:id', element: <IssueDetailPage /> },
              { path: 'area', element: <IncidentAreaPage /> },
            ],
          },
          { path: 'recent', element: <RecentPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'profile/verification', element: <RequestVerificationPage /> },
          { path: 'profile/history', element: <HistoryPage /> },
          { path: 'profile/settings', element: <SettingsPage /> },
          { path: 'admin/verifications', element: <VerificationQueuePage /> },
          { path: 'admin/categories', element: <AdminCategoriesPage /> },
          { path: 'admin/users', element: <AdminUsersPage /> },
          {
            path: 'report',
            element: <ReportLayout />,
            children: [
              { index: true, element: <TypePage /> },
              { path: 'category', element: <CategoryPage /> },
              { path: 'location', element: <IssueLocationPage /> },
              { path: 'duplicate-check', element: <DuplicateCheckPage /> },
              { path: 'review', element: <IssueReviewPage /> },
              { path: 'success', element: <IssueSuccessPage /> },
              { path: 'incident/location', element: <IncidentLocationPage /> },
              { path: 'incident/review', element: <IncidentReviewPage /> },
              { path: 'incident/success', element: <IncidentSuccessPage /> },
            ],
          },
        ],
      },
      {
        element: <FullScreenLayout />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
          { path: 'appearance', element: <ChooseThemePage /> },
          { path: 'location-permission', element: <LocationPermissionPage /> },
        ],
      },
    ],
  },
]

export function createAppRouter() {
  return createBrowserRouter(routes)
}
