import { useMutation } from '@tanstack/react-query'

import { api, unwrapData } from '@/infrastructure/api'

import { useSessionStore } from '../stores/sessao-store'
import type { RegisterFormValues, LoginFormValues } from '../validators/auth'

export function useLogin() {
  const login = useSessionStore((s) => s.login)
  return useMutation({
    mutationFn: (form: LoginFormValues) => api.POST('/auth/login', { body: form }).then(unwrapData),
    onSuccess: login,
  })
}

export function useRegister() {
  const login = useSessionStore((s) => s.login)
  return useMutation({
    mutationFn: (form: RegisterFormValues) =>
      api.POST('/auth/register', { body: form }).then(unwrapData),
    onSuccess: login,
  })
}
