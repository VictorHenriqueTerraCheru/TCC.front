import { Icone } from '@/common/components/icone'
import { Button } from '@/common/ui/button'

interface EstadoVazioProps {
  aoVerAreaMaior(): void
  aoFechar(): void
}

export function EstadoVazio({ aoVerAreaMaior, aoFechar }: EstadoVazioProps) {
  return (
    <div
      role="status"
      className="pointer-events-auto relative mx-auto w-full max-w-sm rounded-[28px] p-6 text-center shadow-3 vidro"
    >
      <button
        type="button"
        onClick={aoFechar}
        aria-label="Fechar aviso"
        className="absolute top-1.5 right-1.5 flex size-11 pressionavel items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 focus-visible:outline-2"
      >
        <Icone name="close" className="text-[20px]" />
      </button>
      <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primario-suave text-primario">
        <Icone name="travel_explore" />
      </span>
      <h2 className="mb-1 font-medium">Nenhuma ocorrência nesta área</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Ninguém registrou problemas por aqui. Afaste o mapa para ver bairros vizinhos.
      </p>
      <Button variant="tonal" onClick={aoVerAreaMaior}>
        <Icone name="zoom_out_map" className="text-[18px]" />
        Ver área maior
      </Button>
    </div>
  )
}
