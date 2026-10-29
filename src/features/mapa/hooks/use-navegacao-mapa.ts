import { useNavigate, useSearchParams } from 'react-router'

const PARAMETROS_DO_PAINEL = ['lat', 'lng']

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
