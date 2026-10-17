import { Icone } from '@/common/components/icone'
import { Button } from '@/common/ui/button'

/** Tela 25: nada na área visível. */
export function EstadoVazio({ aoVerAreaMaior }: { aoVerAreaMaior(): void }) {
  return (
    <div
      role="status"
      className="pointer-events-auto mx-auto w-full max-w-sm rounded-[28px] bg-surface-container-high p-6 text-center shadow-lg"
    >
      <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        <Icone nome="travel_explore" />
      </span>
      <h2 className="mb-1 font-medium">Nenhuma ocorrência nesta área</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Ninguém registrou problemas por aqui. Afaste o mapa para ver bairros vizinhos.
      </p>
      <Button variant="tonal" onClick={aoVerAreaMaior}>
        <Icone nome="zoom_out_map" className="text-[18px]" />
        Ver área maior
      </Button>
    </div>
  )
}
