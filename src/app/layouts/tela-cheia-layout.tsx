import { Outlet } from 'react-router'

/**
 * Telas sem navegação (login, cadastro, pré-permissão). No celular ocupam a tela; no desktop
 * viram um cartão centralizado.
 */
export function TelaCheiaLayout() {
  return (
    <div className="min-h-dvh lg:flex lg:items-center lg:justify-center lg:bg-card lg:p-8">
      <main className="flex min-h-dvh flex-col bg-background lg:min-h-[720px] lg:w-full lg:max-w-md lg:rounded-[28px] lg:shadow-lg">
        <Outlet />
      </main>
    </div>
  )
}
