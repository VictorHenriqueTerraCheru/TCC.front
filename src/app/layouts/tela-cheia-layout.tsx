import { Outlet } from 'react-router'

export function FullScreenLayout() {
  return (
    <div className="min-h-dvh lg:flex lg:items-center lg:justify-center lg:bg-card lg:p-8">
      <main className="flex min-h-dvh flex-col bg-background lg:min-h-[720px] lg:w-full lg:max-w-md lg:rounded-[28px] lg:shadow-3">
        <Outlet />
      </main>
    </div>
  )
}
