import { useQueryClient } from '@tanstack/react-query'
import { point, type Map as MapaLeaflet } from 'leaflet'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Outlet, useMatch, useNavigate, useSearchParams } from 'react-router'
import { Circle } from 'react-leaflet'

import { Icone } from '@/common/components/icone'
import { useDesktop } from '@/common/hooks/use-media-query'
import { cn } from '@/common/lib/utils'
import { Button } from '@/common/ui/button'
import { useExigirConta } from '@/features/auth'
import { useCategorias } from '@/features/categorias'
import {
  areaIncidentesQuery,
  CamadaCalor,
  totalSeteDias,
  useCalorIncidentes,
} from '@/features/incidentes'
import { useAtivarLocalizacao, useLocalizacao } from '@/features/localizacao'
import { CamadaProblemas, useProblemasNaArea } from '@/features/problemas'

import { BannerLocalizacao } from '../components/banner-localizacao'
import { BotaoMapa } from '../components/botao-mapa'
import { ChipsFiltro } from '../components/chips-filtro'
import { EstadoVazio } from '../components/estado-vazio'
import { LegendaMapa } from '../components/legenda-mapa'
import { MapaBase } from '../components/mapa-base'
import { MarcadorUsuario } from '../components/marcador-usuario'
import { OuvinteToque } from '../components/ouvinte-toque'
import { SeletorModo } from '../components/seletor-modo'
import { useFiltrosMapa } from '../hooks/use-filtros-mapa'
import { useNavegacaoMapa } from '../hooks/use-navegacao-mapa'
import type { ContextoMapa } from '../models/contexto'
import { filtrosDasCamadas, mostraCalor } from '../models/filtros'
import { pontoDaUrl } from '../models/ponto'
import { CENTRO_PADRAO, ZOOM_PADRAO } from '@/common/lib/mapa'
import type { Retangulo } from '../models/retangulo'

const CHAVE_LEGENDA_VISTA = 'ocorrencias.legendaVista'
const LARGURA_PAINEL = 420

function legendaJaVista(): boolean {
  try {
    return localStorage.getItem(CHAVE_LEGENDA_VISTA) === '1'
  } catch {
    return true
  }
}

function marcarLegendaVista() {
  try {
    localStorage.setItem(CHAVE_LEGENDA_VISTA, '1')
  } catch {
    // Sem storage (aba privada): a legenda só reaparece na próxima visita.
  }
}

/** Telas 1, 2, 18, 24 e 25; as rotas filhas (detalhe, área) abrem no painel por cima. */
export function MapaPage() {
  const desktop = useDesktop()
  const filtros = useFiltrosMapa()
  const camadas = filtrosDasCamadas(filtros)
  const localizacao = useLocalizacao()
  const ativarLocalizacao = useAtivarLocalizacao()
  const navegacao = useNavegacaoMapa()
  const exigirConta = useExigirConta()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const rotaProblema = useMatch('/mapa/problema/:id')
  const rotaArea = useMatch('/mapa/area')
  const [params] = useSearchParams()
  const painelAberto = rotaProblema !== null || rotaArea !== null

  const [mapa, setMapa] = useState<MapaLeaflet | null>(null)
  const [retangulo, setRetangulo] = useState<Retangulo | null>(null)
  const [legendaAberta, setLegendaAberta] = useState(() => !legendaJaVista())
  const [aviso, setAviso] = useState<string | null>(null)

  const categoriasQuery = useCategorias()
  const categorias = categoriasQuery.data
  const categoriasPorId = useMemo(
    () => new Map((categorias ?? []).map((c) => [c.id, c])),
    [categorias],
  )

  const problemas = useProblemasNaArea(
    retangulo && camadas.problemas ? { ...retangulo, ...camadas.problemas } : null,
  )
  const calor = useCalorIncidentes(
    retangulo && camadas.calor ? { ...retangulo, ...camadas.calor, dias: 7 } : null,
  )

  // Centro inicial: a posição já conhecida ou Botafogo. Depois, centraliza uma vez quando a
  // primeira posição chegar (permissão já concedida em visita anterior).
  const [centroInicial] = useState<[number, number]>(() =>
    localizacao.posicao ? [localizacao.posicao.lat, localizacao.posicao.lng] : CENTRO_PADRAO,
  )
  const centralizouRef = useRef(localizacao.posicao !== null)
  useEffect(() => {
    if (!mapa || !localizacao.posicao || centralizouRef.current || painelAberto) return
    centralizouRef.current = true
    mapa.setView([localizacao.posicao.lat, localizacao.posicao.lng], ZOOM_PADRAO)
  }, [mapa, localizacao.posicao, painelAberto])

  useEffect(() => {
    if (!aviso) return
    const timer = setTimeout(() => setAviso(null), 3500)
    return () => clearTimeout(timer)
  }, [aviso])

  const focar = useCallback<ContextoMapa['focar']>(
    ({ lat, lng }) => {
      if (!mapa) return
      centralizouRef.current = true
      const tamanho = mapa.getSize()
      // Celular: o ponto fica no quarto de cima, acima da folha. Desktop: no centro da área livre.
      const alvo = desktop
        ? point(LARGURA_PAINEL + (tamanho.x - LARGURA_PAINEL) / 2, tamanho.y / 2)
        : point(tamanho.x / 2, tamanho.y * 0.25)
      mapa.panBy(mapa.latLngToContainerPoint([lat, lng]).subtract(alvo))
    },
    [mapa, desktop],
  )
  const contexto = useMemo<ContextoMapa>(() => ({ focar }), [focar])

  /** Regra 7: toque fora dos marcadores, nos modos com calor, abre a área se houver incidentes. */
  async function aoTocarMapa(lat: number, lng: number) {
    try {
      const area = await queryClient.fetchQuery(areaIncidentesQuery(lat, lng))
      if (totalSeteDias(area) > 0) navegacao.abrirArea(lat, lng)
      else setAviso('Sem incidentes por aqui nos últimos 7 dias')
    } catch {
      setAviso('Não foi possível consultar os incidentes desta área')
    }
  }

  async function aoClicarGps() {
    const posicao = localizacao.posicao ?? (await ativarLocalizacao.ativar())
    centralizouRef.current = true
    if (posicao) mapa?.flyTo([posicao.lat, posicao.lng], Math.max(mapa.getZoom(), ZOOM_PADRAO))
  }

  function alternarLegenda() {
    marcarLegendaVista()
    setLegendaAberta((aberta) => !aberta)
  }

  const consultas = [camadas.problemas && problemas, camadas.calor && calor].filter(
    (consulta) => !!consulta,
  )
  // Sem categorias os marcadores não têm ícone nem cor (e não aparecem): conta como falha do mapa.
  const falhouCategorias = camadas.problemas !== null && categoriasQuery.isError
  const carregou =
    consultas.length > 0 && consultas.every((c) => c.isSuccess && !c.isPlaceholderData)
  const vazio = carregou && consultas.every((c) => c.data?.length === 0)
  const falhou = falhouCategorias || consultas.some((c) => c.isError)
  const semLocalizacao = localizacao.estado === 'prompt' || localizacao.estado === 'denied'
  const pontoArea = rotaArea ? pontoDaUrl(params) : null

  return (
    // isolate: os z-index do Leaflet (até 1000) ficam presos aqui e não cobrem diálogos e folhas.
    <div className="relative isolate size-full">
      <h1 className="sr-only">Mapa de ocorrências</h1>
      <MapaBase
        ref={setMapa}
        centroInicial={centroInicial}
        mostrarZoom={desktop}
        aoMudarRetangulo={setRetangulo}
      >
        {camadas.calor && calor.data && <CamadaCalor celulas={calor.data} />}
        {camadas.problemas && problemas.data && (
          <CamadaProblemas
            problemas={problemas.data}
            categorias={categoriasPorId}
            selecionadoId={rotaProblema?.params.id}
            aoSelecionar={navegacao.abrirProblema}
          />
        )}
        {pontoArea && (
          <Circle
            center={[pontoArea.lat, pontoArea.lng]}
            radius={400}
            interactive={false}
            pathOptions={{ color: '#171d1a', weight: 1.5, dashArray: '4 5', fillOpacity: 0 }}
          />
        )}
        {localizacao.posicao && <MarcadorUsuario posicao={localizacao.posicao} />}
        {mostraCalor(filtros.modo) && (
          <OuvinteToque aoTocar={(lat, lng) => void aoTocarMapa(lat, lng)} />
        )}
      </MapaBase>

      {/* Controles sobre o mapa: no desktop ficam à direita do painel lateral. */}
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 z-[1000] space-y-2 p-3 lg:right-auto lg:w-[620px] lg:p-4',
          painelAberto && 'lg:left-[420px]',
        )}
      >
        <SeletorModo modo={filtros.modo} aoMudar={filtros.alterarModo} />
        <ChipsFiltro
          {...filtros}
          aoAlternarGrupo={filtros.alternarGrupo}
          aoAlternarNovas={filtros.alternarNovas}
        />
        {semLocalizacao && <BannerLocalizacao aoAtivar={() => void ativarLocalizacao.ativar()} />}
        {falhou && (
          <div
            role="alert"
            className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-error-container py-2 pr-2 pl-4 text-[13px] text-error-container-foreground shadow-md"
          >
            <span className="flex-1">Não foi possível carregar o mapa.</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (falhouCategorias) void categoriasQuery.refetch()
                consultas.forEach((c) => void c.refetch())
              }}
            >
              Tentar novamente
            </Button>
          </div>
        )}
      </div>

      {vazio && !falhou && !painelAberto && (
        <div className="pointer-events-none absolute inset-x-6 top-1/2 z-[1000] -translate-y-1/2">
          <EstadoVazio aoVerAreaMaior={() => mapa?.zoomOut(2)} />
        </div>
      )}

      {legendaAberta && (
        <div
          className={cn(
            'pointer-events-none absolute bottom-6 left-3 z-[1000] lg:left-4',
            painelAberto && 'lg:left-[436px]',
          )}
        >
          <LegendaMapa modo={filtros.modo} aoFechar={alternarLegenda} />
        </div>
      )}

      {aviso && (
        <div
          role="status"
          className="pointer-events-none absolute inset-x-0 bottom-28 z-[1000] mx-auto w-fit max-w-[90%] rounded-lg bg-foreground px-4 py-2.5 text-sm text-background shadow-lg lg:bottom-8"
        >
          {aviso}
        </div>
      )}

      <div className="pointer-events-none absolute right-3 bottom-6 z-[1000] flex flex-col items-end gap-3 lg:right-4">
        <BotaoMapa
          aria-label={legendaAberta ? 'Fechar legenda' : 'Abrir legenda'}
          aria-pressed={legendaAberta}
          onClick={alternarLegenda}
        >
          <Icone nome="info" />
        </BotaoMapa>
        <BotaoMapa
          aria-label={
            localizacao.estado === 'granted'
              ? 'Centralizar na minha localização'
              : 'Ativar localização'
          }
          onClick={() => void aoClicarGps()}
        >
          <Icone
            nome={
              localizacao.estado === 'denied' || localizacao.estado === 'indisponivel'
                ? 'location_disabled'
                : 'my_location'
            }
          />
        </BotaoMapa>
        {!desktop && (
          <Link
            to="/registrar"
            onClick={(evento) => {
              // Regra 1: visitante vê a folha "Entre para registrar" em vez do fluxo.
              evento.preventDefault()
              exigirConta('registrar', () => navigate('/registrar'), { retorno: '/registrar' })
            }}
            className="pointer-events-auto flex h-14 items-center gap-2 rounded-2xl bg-mint px-5 font-medium text-mint-foreground shadow-md transition-shadow hover:shadow-lg focus-visible:outline-2"
          >
            <Icone nome="add_location_alt" />
            Registrar
          </Link>
        )}
      </div>

      {ativarLocalizacao.dialogo}
      <Outlet context={contexto} />
    </div>
  )
}
