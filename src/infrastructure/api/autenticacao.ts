/**
 * Ponte entre o cliente HTTP e a sessão, que mora na feature auth.
 * A infraestrutura não importa features: o app registra o provedor na inicialização
 * (mesma ideia da injeção de dependência do back).
 */
export interface ProvedorAutenticacao {
  obterToken(): string | null
  /** 401 numa chamada autenticada: token expirado ou usuário removido (regra 13 do CLAUDE.md). */
  aoExpirarSessao(): void
}

let provedor: ProvedorAutenticacao = {
  obterToken: () => null,
  aoExpirarSessao: () => {},
}

export function registrarAutenticacao(novo: ProvedorAutenticacao) {
  provedor = novo
}

export function obterProvedorAutenticacao(): ProvedorAutenticacao {
  return provedor
}
