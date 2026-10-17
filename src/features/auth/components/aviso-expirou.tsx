import { Icone } from '@/common/components/icone'

/** Regra 13: o JWT vale 7 dias e não há refresh. */
export function AvisoExpirou() {
  return (
    <p className="mb-4 flex items-center gap-2 rounded-xl bg-destructive/15 p-3 text-sm text-destructive">
      <Icone nome="lock_reset" className="text-[20px]" />
      Sua sessão expirou. Entre de novo para continuar.
    </p>
  )
}
