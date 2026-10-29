const CHAVE = 'ocorrencias.prePermissaoVista'

export function prePermissaoVista(): boolean {
  try {
    return localStorage.getItem(CHAVE) === '1'
  } catch {
    return true
  }
}

export function marcarPrePermissaoVista() {
  try {
    localStorage.setItem(CHAVE, '1')
  } catch {
    void 0
  }
}
