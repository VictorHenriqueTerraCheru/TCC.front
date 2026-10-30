import { Icon } from '@/common/components/icon'

export function ExpiredNotice() {
  return (
    <p className="mb-4 flex items-center gap-2 rounded-xl bg-destructive/15 p-3 text-sm text-destructive">
      <Icon name="lock_reset" className="text-[20px]" />
      Sua sessão expirou. Entre de novo para continuar.
    </p>
  )
}
