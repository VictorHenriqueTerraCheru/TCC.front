export interface AuthProvider {
  getToken(): string | null
  onSessionExpired(): void
}

let provider: AuthProvider = {
  getToken: () => null,
  onSessionExpired: () => {},
}

export function registerAuthProvider(newPoint: AuthProvider) {
  provider = newPoint
}

export function getAuthProvider(): AuthProvider {
  return provider
}
