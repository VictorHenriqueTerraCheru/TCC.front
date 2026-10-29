import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { CampoBusca } from '@/common/components/campo-busca'
import { Icone } from '@/common/components/icone'
import { IconeDinamico } from '@/common/components/icone-remoto'
import { useDebouncedValue } from '@/common/hooks/use-debounced-value'
import { buscarIcones } from '@/common/lib/iconify'
import { cn } from '@/common/lib/utils'
import { iconeDe } from '@/features/categorias'

const MINIMO_LETRAS = 2
const MAXIMO_RESULTADOS = 48

interface SeletorIconeProps {
  valor: string
  aoMudar(nome: string): void
  erro?: string
}

export function SeletorIcone({ valor, aoMudar, erro }: SeletorIconeProps) {
  const [busca, setBusca] = useState('')
  const termo = useDebouncedValue(busca.trim().toLowerCase(), 350)
  const resultado = useQuery({
    queryKey: ['iconify', 'busca', termo],
    queryFn: ({ signal }) => buscarIcones(termo, signal),
    enabled: termo.length >= MINIMO_LETRAS,
    staleTime: Infinity,
    retry: false,
  })
  const nomes = resultado.data?.slice(0, MAXIMO_RESULTADOS) ?? []

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-sm">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted text-[26px]">
          {valor ? <IconeDinamico nome={iconeDe({ icone: valor })} /> : <Icone nome="category" />}
        </span>
        <span className={cn(!valor && 'text-muted-foreground')}>
          {valor ? (
            <>
              Ícone: <span className="font-mono">{valor}</span>
            </>
          ) : (
            'Nenhum ícone escolhido'
          )}
        </span>
      </div>

      <CampoBusca
        valor={busca}
        aoMudar={setBusca}
        rotulo="Buscar ícone"
        placeholder="Buscar ícone (em inglês: flood, tree, fire…)"
      />

      {termo.length >= MINIMO_LETRAS && resultado.isPending && (
        <p className="text-sm text-muted-foreground">Buscando…</p>
      )}
      {resultado.isError && (
        <p role="alert" className="text-sm text-destructive">
          Não foi possível buscar ícones agora. Tente de novo.
        </p>
      )}
      {resultado.isSuccess && nomes.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhum ícone encontrado. A busca é em inglês.
        </p>
      )}
      {nomes.length > 0 && (
        <div role="group" aria-label="Resultados da busca" className="grid grid-cols-6 gap-2">
          {nomes.map((nome) => (
            <button
              key={nome}
              type="button"
              aria-label={nome}
              aria-pressed={nome === valor}
              title={nome}
              onClick={() => aoMudar(nome)}
              className={cn(
                'flex aspect-square pressionavel items-center justify-center rounded-xl border-2 text-[26px] focus-visible:outline-2',
                nome === valor
                  ? 'border-primario bg-primario-suave text-primario'
                  : 'border-border bg-card hover:bg-superficie-2',
              )}
            >
              <IconeDinamico nome={nome} />
            </button>
          ))}
        </div>
      )}
      {erro && (
        <p role="alert" className="text-xs text-destructive">
          {erro}
        </p>
      )}
    </div>
  )
}
