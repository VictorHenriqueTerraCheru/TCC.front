import { useSearchParams } from 'react-router'

import { isGrupoCategoria, type GrupoCategoria } from '@/features/categorias'

import { gruposDoModo, mostraProblemas, type FiltrosMapa, type ModoMapa } from '../models/filtros'

function lerModo(valor: string | null): ModoMapa {
  return valor === 'incidentes' || valor === 'ambos' ? valor : 'problemas'
}

/** Modo e chips ficam na URL (`/mapa?modo=ambos&grupos=eletrica&nova=1`), como em docs/TELAS.md. */
export function useFiltrosMapa() {
  const [params, setParams] = useSearchParams()

  const filtros: FiltrosMapa = {
    modo: lerModo(params.get('modo')),
    grupos: (params.get('grupos') ?? '').split(',').filter(isGrupoCategoria),
    somenteNovas: params.get('nova') === '1',
  }

  function gravar({ modo, grupos, somenteNovas }: FiltrosMapa) {
    setParams(
      (anteriores) => {
        const proximos = new URLSearchParams(anteriores)
        if (modo === 'problemas') proximos.delete('modo')
        else proximos.set('modo', modo)
        if (grupos.length) proximos.set('grupos', grupos.join(','))
        else proximos.delete('grupos')
        if (somenteNovas) proximos.set('nova', '1')
        else proximos.delete('nova')
        return proximos
      },
      { replace: true },
    )
  }

  return {
    ...filtros,
    alterarModo(modo: ModoMapa) {
      // Chips que não existem no novo modo saem do filtro.
      const disponiveis = gruposDoModo(modo)
      gravar({
        modo,
        grupos: filtros.grupos.filter((g) => disponiveis.includes(g)),
        somenteNovas: filtros.somenteNovas && mostraProblemas(modo),
      })
    },
    alternarGrupo(grupo: GrupoCategoria) {
      const grupos = filtros.grupos.includes(grupo)
        ? filtros.grupos.filter((g) => g !== grupo)
        : [...filtros.grupos, grupo]
      gravar({ ...filtros, grupos })
    },
    alternarNovas() {
      gravar({ ...filtros, somenteNovas: !filtros.somenteNovas })
    },
  }
}
