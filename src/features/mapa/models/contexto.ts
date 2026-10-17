/** Passado pela página do mapa às rotas filhas (detalhe, área) via <Outlet context>. */
export interface ContextoMapa {
  /** Traz o ponto para a parte visível do mapa (acima da folha / à direita do painel). */
  focar(ponto: { lat: number; lng: number }): void
}
