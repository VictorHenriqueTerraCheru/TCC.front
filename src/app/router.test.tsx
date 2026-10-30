import { screen } from '@testing-library/react'

import { renderRoutes } from '@/test/render'
import { loginAsAdmin } from '@/test/session'

import { routes } from './router'

const paths = [
  '/map',
  '/map/issue/00000000-0000-4000-8000-000000000001',
  '/map/area',
  '/recent',
  '/profile',
  '/profile/verification',
  '/profile/history',
  '/profile/settings',
  '/admin/verifications',
  '/admin/categories',
  '/admin/users',
  '/report',
  '/report/category',
  '/report/location',
  '/report/duplicate-check',
  '/report/review',
  '/report/success',
  '/report/incident/location',
  '/report/incident/review',
  '/report/incident/success',
  '/login',
  '/register',
  '/appearance',
  '/location-permission',
]

describe('app routes', () => {
  it.each(paths)('%s exists', (path) => {
    loginAsAdmin()
    const { router } = renderRoutes(routes, path)

    expect(router.state.errors).toBeNull()
    expect(screen.queryByText('Página não encontrada')).not.toBeInTheDocument()
  })
})
