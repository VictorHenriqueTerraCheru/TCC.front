import { useSearchParams } from 'react-router'

import { useAparencia } from '@/features/categorias'

import { gruposDoModo, mostraProblemas, type FiltrosMapa, type ModoMapa } from '../models/filtros'

function lerModo(valor: string | null): ModoMapa {
  return valor === 'incidentes' || valor === 'ambos' ? valor : 'problemas'
}

export function useFiltrosMapa() {
  const [params, setParams] = useSearchParams()
  const { grupos: todos, carregado } = useAparencia()

  const modo = lerModo(params.get('modo'))
  const disponiveis = gruposDoModo(todos, modo).map((g) => g.chave)
  const filtros: FiltrosMapa = {
    modo,
    grupos: (params.get('grupos') ?? '')
      .split(',')
      .filter((g) => g !== '' && (!carregado || disponiveis.includes(g))),
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
      const disponiveis = gruposDoModo(todos, modo).map((g) => g.chave)
      gravar({
        modo,
        grupos: carregado ? filtros.grupos.filter((g) => disponiveis.includes(g)) : filtros.grupos,
        somenteNovas: filtros.somenteNovas && mostraProblemas(modo),
      })
    },
    alternarGrupo(grupo: string) {
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
