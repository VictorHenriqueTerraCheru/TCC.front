import { useMutation } from '@tanstack/react-query'

import { api, dados } from '@/infrastructure/api'

import { useSessaoStore } from '../stores/sessao-store'
import type { CadastrarForm, EntrarForm } from '../validators/auth'

// POST /auth/login
export function useEntrar() {
  const entrar = useSessaoStore((s) => s.entrar)
  return useMutation({
    mutationFn: (form: EntrarForm) => api.POST('/auth/login', { body: form }).then(dados),
    onSuccess: entrar,
  })
}

// POST /auth/cadastro — já devolve a sessão (201), sem login separado.
export function useCadastrar() {
  const entrar = useSessaoStore((s) => s.entrar)
  return useMutation({
    mutationFn: (form: CadastrarForm) => api.POST('/auth/cadastro', { body: form }).then(dados),
    onSuccess: entrar,
  })
}
