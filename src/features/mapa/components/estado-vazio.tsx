import { Icon } from '@/common/components/icone'
import { Button } from '@/common/ui/button'

interface EmptyStateProps {
  onViewLargerArea(): void
  onClose(): void
}

export function EmptyState({ onViewLargerArea, onClose }: EmptyStateProps) {
  return (
    <div
      role="status"
      className="pointer-events-auto relative mx-auto w-full max-w-sm rounded-[28px] p-6 text-center shadow-3 vidro"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar aviso"
        className="absolute top-1.5 right-1.5 flex size-11 pressionavel items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 focus-visible:outline-2"
      >
        <Icon name="close" className="text-[20px]" />
      </button>
      <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primario-suave text-primario">
        <Icon name="travel_explore" />
      </span>
      <h2 className="mb-1 font-medium">Nenhuma ocorrência nesta área</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Ninguém registrou problemas por aqui. Afaste o mapa para ver bairros vizinhos.
      </p>
      <Button variant="tonal" onClick={onViewLargerArea}>
        <Icon name="zoom_out_map" className="text-[18px]" />
        Ver área maior
      </Button>
    </div>
  )
}
