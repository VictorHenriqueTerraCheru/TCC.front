import { useSearchParams } from 'react-router'

import { useAparencia } from '@/features/categorias'

import { gruposDoModo, mostraProblemas, type FiltrosMapa, type ModoMapa } from '../models/filtros'

function lerModo(valor: string | null): ModoMapa {
  return valor === 'incidentes' || valor === 'ambos' ? valor : 'problemas'
}

/** Modo e chips ficam na URL (`/mapa?modo=ambos&grupos=eletrica&nova=1`), como em docs/TELAS.md. */
export function useFiltrosMapa() {
  const [params, setParams] = useSearchParams()
  const { grupos: todos, carregado } = useAparencia()

  const modo = lerModo(params.get('modo'))
  // Link com chip de outro modo (`?grupos=seguranca` sem modo): ignorado. Sem isso, as duas
  // camadas desligariam e o mapa ficaria vazio sem nenhum chip marcado para desfazer.
  // Também descarta chave de grupo que não existe (mais). Com os grupos ainda carregando não dá
  // para saber: a lista da URL passa como está (e sobrevive a um gravar() nesse intervalo).
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
      // Chips que não existem no novo modo saem do filtro, mas só com os grupos carregados: antes disso
      // não dá para saber quais existem, e a lista da URL (deep link) é mantida.
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
