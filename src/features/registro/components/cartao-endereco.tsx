import { Icone } from '@/common/components/icone'
import { Skeleton } from '@/common/ui/skeleton'
import { distanciaMetros, useLocalizacao } from '@/features/localizacao'

import { useEnderecoDoRascunho } from '../hooks/use-rascunho'
import { useRascunhoStore } from '../stores/rascunho-store'

function usePrecisao(): number | null {
  const local = useRascunhoStore((s) => s.local)
  const { estado, posicao } = useLocalizacao()
  if (estado !== 'granted' || !posicao || !local) return null
  const perto = distanciaMetros(local, posicao) <= Math.max(posicao.precisao, 30)
  return perto && posicao.precisao >= 1 ? posicao.precisao : null
}

export function CartaoEndereco() {
  const { data, atualizando } = useEnderecoDoRascunho()
  const precisao = usePrecisao()
  const detalhes = [data?.city, precisao !== null && `precisão de ±${Math.round(precisao)} m`]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="flex gap-3" aria-live="polite">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Icone name="location_on" preenchido className="text-[22px]" />
      </span>

      <div className="min-h-[84px] min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">Endereço aproximado</p>
        {atualizando || !data ? (
          <div aria-label="Buscando endereço" className="mt-1 space-y-1.5">
            <Skeleton className="h-5 w-4/5 bg-muted" />
            <Skeleton className="h-3 w-1/2 bg-muted" />
          </div>
        ) : (
          <>
            <p className="text-lg leading-6 font-medium">{data.address}</p>
            {!data.available && (
              <p className="text-xs text-muted-foreground">
                Endereço indisponível agora; o registro segue com o ponto do mapa.
              </p>
            )}
            {detalhes && <p className="text-xs text-muted-foreground">{detalhes}</p>}
          </>
        )}
      </div>
    </div>
  )
}
