import { isApiError, isErroDeRede } from '@/infrastructure/api'

const mensagens: Record<string, string> = {
  'nome-duplicado': 'Já existe uma categoria com este nome.',
  'grupo-tipo-incompativel': 'O grupo escolhido é de outro tipo (problema ou incidente).',
  'grupo-rotulo-duplicado': 'Já existe um grupo com este nome.',
  'grupo-em-uso': 'Este grupo ainda tem categorias. Mova ou desative-as antes de apagar.',
}

export function mensagemErroCategorias(erro: unknown): string {
  if (isErroDeRede(erro)) return 'Sem conexão. Tente de novo.'
  if (isApiError(erro)) {
    if (erro.type && mensagens[erro.type]) return mensagens[erro.type]!
    const campo = Object.values(erro.errors)[0]?.[0]
    if (campo) return campo
    if (erro.title) return erro.title
  }
  return 'Não foi possível concluir. Tente de novo.'
}
