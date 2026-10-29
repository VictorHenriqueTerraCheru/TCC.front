import { Icone } from '@/common/components/icone'
import { Button } from '@/common/ui/button'

export function BannerLocalizacao({ aoAtivar }: { aoAtivar(): void }) {
  return (
    <div
      role="status"
      className="pointer-events-auto flex items-center gap-3 rounded-2xl py-2 pr-2 pl-4 shadow-2 vidro"
    >
      <Icone nome="location_disabled" className="text-[20px] text-muted-foreground" />
      <p className="flex-1 text-[13px] leading-tight">
        Localização desativada — seus votos contam com peso base
      </p>
      <Button variant="ghost" size="sm" onClick={aoAtivar}>
        Ativar
      </Button>
    </div>
  )
}
