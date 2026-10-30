const KEY = 'ocorrencias.prePermissaoVista'

export function prePermissionSeen(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return true
  }
}

export function markPrePermissionSeen() {
  try {
    localStorage.setItem(KEY, '1')
  } catch {
    void 0
  }
}
