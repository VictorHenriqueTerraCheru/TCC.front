import { Icone } from '@/common/components/icone'
import { distanciaTexto } from '@/common/lib/formatacao'
import { Button } from '@/common/ui/button'
import { useAtivarLocalizacao, useLocalizacao } from '@/features/localizacao'

import { DISTANCIA_MAXIMA_RODAPE_M, useDistanciaAte } from '../../hooks/use-distancia-ate'

/**
 * Rodapé do detalhe: "Você está a X m — seu voto pesa mais por estar perto" (até 2 km) ou,
 * sem permissão, o aviso da tela 19.
 */
export function RodapeLocalizacao({
  ponto,
  mostrarDistancia = true,
}: {
  ponto: { lat: number; lng: number }
  mostrarDistancia?: boolean
}) {
  const { estado } = useLocalizacao()
  const distancia = useDistanciaAte(ponto)
  const { ativar, dialogo } = useAtivarLocalizacao()

  if (estado === 'prompt' || estado === 'denied') {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-superficie-2 py-2 pr-2 pl-4">
        <Icone nome="location_disabled" className="text-[20px] text-muted-foreground" />
        <p className="flex-1 text-sm">
          Ative a localização para seu voto pesar mais quando estiver perto
        </p>
        <Button variant="ghost" size="sm" onClick={() => void ativar()}>
          Ativar
        </Button>
        {dialogo}
      </div>
    )
  }

  if (!mostrarDistancia || distancia === null || distancia > DISTANCIA_MAXIMA_RODAPE_M) return null

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-primario-suave p-3 text-primario">
      <Icone nome="navigation" preenchido className="text-[20px] text-primario" />
      <p className="text-sm">
        Você está a {distanciaTexto(distancia)} — seu voto pesa mais por estar perto
      </p>
    </div>
  )
}
