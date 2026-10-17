import { useNavigate, useSearchParams } from 'react-router'

// Parâmetros que pertencem a uma rota filha e não devem vazar para as outras.
const PARAMETROS_DO_PAINEL = ['lat', 'lng']

/** Abre/fecha os painéis do mapa preservando modo e filtros da URL. */
export function useNavegacaoMapa() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  function filtros(extra?: Record<string, string>) {
    const proximos = new URLSearchParams(params)
    PARAMETROS_DO_PAINEL.forEach((p) => proximos.delete(p))
    Object.entries(extra ?? {}).forEach(([chave, valor]) => proximos.set(chave, valor))
    const texto = proximos.toString()
    return texto ? `?${texto}` : ''
  }

  return {
    abrirProblema: (id: string) =>
      navigate({ pathname: `/mapa/problema/${id}`, search: filtros() }),
    abrirArea: (lat: number, lng: number) =>
      navigate({
        pathname: '/mapa/area',
        search: filtros({ lat: lat.toFixed(5), lng: lng.toFixed(5) }),
      }),
    fechar: () => navigate({ pathname: '/mapa', search: filtros() }),
  }
}
