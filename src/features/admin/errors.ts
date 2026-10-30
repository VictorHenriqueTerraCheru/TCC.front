import { isApiError, isNetworkError } from '@/infrastructure/api'

const messages: Record<string, string> = {
  'duplicate-name': 'Já existe uma categoria com este nome.',
  'group-type-mismatch': 'O grupo escolhido é de outro tipo (Problema ou Incidente).',
  'duplicate-group-label': 'Já existe um grupo com este nome.',
  'own-role': 'Você não pode alterar o seu próprio perfil.',
  'group-in-use':
    'Este grupo ainda tem categorias (inclusive desativadas). Mova todas para outro grupo antes de apagar.',
}

function translate(error: unknown): string {
  if (isNetworkError(error)) return 'Sem conexão. Tente de novo.'
  if (isApiError(error)) {
    if (error.type && messages[error.type]) return messages[error.type]!
    const field = Object.values(error.errors)[0]?.[0]
    if (field) return field
    if (error.title) return error.title
  }
  return 'Não foi possível concluir. Tente de novo.'
}

export const categoryErrorMessage = translate
export const userErrorMessage = translate
