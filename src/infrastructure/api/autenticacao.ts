export interface ProvedorAutenticacao {
  obterToken(): string | null
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
