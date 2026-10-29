import { useMutation } from '@tanstack/react-query'

import { api, dados } from '@/infrastructure/api'

import { useSessaoStore } from '../stores/sessao-store'
import type { CadastrarForm, EntrarForm } from '../validators/auth'

export function useEntrar() {
  const entrar = useSessaoStore((s) => s.entrar)
  return useMutation({
    mutationFn: (form: EntrarForm) => api.POST('/auth/login', { body: form }).then(dados),
    onSuccess: entrar,
  })
}

export function useCadastrar() {
  const entrar = useSessaoStore((s) => s.entrar)
  return useMutation({
    mutationFn: (form: CadastrarForm) => api.POST('/auth/register', { body: form }).then(dados),
    onSuccess: entrar,
  })
}
