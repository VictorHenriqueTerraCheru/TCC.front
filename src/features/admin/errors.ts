import { isApiError, isErroDeRede } from '@/infrastructure/api'

const mensagens: Record<string, string> = {
  'nome-duplicado': 'Já existe uma categoria com este nome.',
  'grupo-tipo-incompativel': 'O grupo escolhido é de outro tipo (Estado ou Evento).',
  'grupo-rotulo-duplicado': 'Já existe um grupo com este nome.',
  'proprio-perfil': 'Você não pode alterar o seu próprio perfil.',
  'grupo-em-uso':
    'Este grupo ainda tem categorias (inclusive desativadas). Mova todas para outro grupo antes de apagar.',
}

function traduzir(erro: unknown): string {
  if (isErroDeRede(erro)) return 'Sem conexão. Tente de novo.'
  if (isApiError(erro)) {
    if (erro.type && mensagens[erro.type]) return mensagens[erro.type]!
    const campo = Object.values(erro.errors)[0]?.[0]
    if (campo) return campo
    if (erro.title) return erro.title
  }
  return 'Não foi possível concluir. Tente de novo.'
}

export const mensagemErroCategorias = traduzir
export const mensagemErroUsuarios = traduzir
