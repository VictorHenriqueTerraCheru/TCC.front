import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Outlet, useMatch, useNavigate, useSearchParams } from 'react-router'
import { Layer, Source, type MapRef } from '@vis.gl/react-maplibre'

import { BotaoBussola } from '@/common/components/botao-bussola'
import { Icone } from '@/common/components/icone'
import { useDesktop } from '@/common/hooks/use-media-query'
import { useTema } from '@/common/hooks/use-tema'
import { circuloGeoJson } from '@/common/lib/geo'
import { cn } from '@/common/lib/utils'
import { Button } from '@/common/ui/button'
import { useExigirConta } from '@/features/auth'
import { useAparencia, useCategorias, useGrupos } from '@/features/categorias'
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
import { SeletorModo } from '../components/seletor-modo'
import { useFiltrosMapa } from '../hooks/use-filtros-mapa'
import { useNavegacaoMapa } from '../hooks/use-navegacao-mapa'
import type { ContextoMapa } from '../models/contexto'
import { filtrosDasCamadas, mostraCalor } from '../models/filtros'
import { pontoDaUrl } from '../models/ponto'
import { CENTRO_PADRAO, COR_TRACEJADO, ZOOM_PADRAO } from '@/common/lib/mapa'
import type { Retangulo } from '../models/retangulo'

const CHAVE_LEGENDA_VISTA = 'ocorrencias.legendaVista'
const CHAVE_AVISO_VAZIO_FECHADO = 'ocorrencias.avisoVazioFechado'
const LARGURA_PAINEL = 420

function marcado(chave: string): boolean {
  try {
    return localStorage.getItem(chave) === '1'
  } catch {
    return true
  }
}

function marcar(chave: string) {
  try {
    localStorage.setItem(chave, '1')
  } catch {
    void 0
  }
}

export function MapaPage() {
  const desktop = useDesktop()
  const tema = useTema()
  const filtros = useFiltrosMapa()
  const { grupos: todosOsGrupos } = useAparencia()
  const camadas = filtrosDasCamadas(filtros, todosOsGrupos)
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

  const [mapa, setMapa] = useState<MapRef | null>(null)
  const [retangulo, setRetangulo] = useState<Retangulo | null>(null)
  const [legendaAberta, setLegendaAberta] = useState(() => !marcado(CHAVE_LEGENDA_VISTA))
  const [aviso, setAviso] = useState<string | null>(null)
  const [vazioDispensado, setVazioDispensado] = useState(false)
  const [vazioFechado, setVazioFechado] = useState(() => marcado(CHAVE_AVISO_VAZIO_FECHADO))

  const categoriasQuery = useCategorias()
  const categorias = categoriasQuery.data
  const gruposQuery = useGrupos()
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

  const [centroInicial] = useState<[number, number]>(() =>
    localizacao.posicao ? [localizacao.posicao.lat, localizacao.posicao.lng] : CENTRO_PADRAO,
  )
  const centralizouRef = useRef(localizacao.posicao !== null)
  useEffect(() => {
    if (!mapa || !localizacao.posicao || centralizouRef.current || painelAberto) return
    centralizouRef.current = true
    mapa.jumpTo({ center: [localizacao.posicao.lng, localizacao.posicao.lat], zoom: ZOOM_PADRAO })
  }, [mapa, localizacao.posicao, painelAberto])

  useEffect(() => {
    if (!mapa) return
    const container = mapa.getContainer()
    const dispensar = () => setVazioDispensado(true)
    container.addEventListener('pointerdown', dispensar)
    container.addEventListener('wheel', dispensar, { passive: true })
    return () => {
      container.removeEventListener('pointerdown', dispensar)
      container.removeEventListener('wheel', dispensar)
    }
  }, [mapa])

  useEffect(() => {
    if (!aviso) return
    const timer = setTimeout(() => setAviso(null), 3500)
    return () => clearTimeout(timer)
  }, [aviso])

  const focar = useCallback<ContextoMapa['focar']>(
    ({ lat, lng }) => {
      if (!mapa) return
      centralizouRef.current = true
      const offset: [number, number] = desktop
        ? [LARGURA_PAINEL / 2, 0]
        : [0, -mapa.getContainer().clientHeight * 0.05]
      mapa.easeTo({ center: [lng, lat], offset })
    },
    [mapa, desktop],
  )
  const contexto = useMemo<ContextoMapa>(() => ({ focar }), [focar])

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
    if (posicao) {
      mapa?.flyTo({
        center: [posicao.lng, posicao.lat],
        zoom: Math.max(mapa.getZoom(), ZOOM_PADRAO),
      })
    }
  }

  function alternarLegenda() {
    marcar(CHAVE_LEGENDA_VISTA)
    setLegendaAberta((aberta) => !aberta)
  }

  const consultas = [camadas.problemas && problemas, camadas.calor && calor].filter(
    (consulta) => !!consulta,
  )
  const falhouCategorias = camadas.problemas !== null && categoriasQuery.isError
  const falhouGrupos = gruposQuery.isError
  const carregou =
    consultas.length > 0 && consultas.every((c) => c.isSuccess && !c.isPlaceholderData)
  const vazio = carregou && consultas.every((c) => c.data?.length === 0)
  if (vazioDispensado && carregou && !vazio) setVazioDispensado(false)
  const falhou = falhouCategorias || falhouGrupos || consultas.some((c) => c.isError)
  const semLocalizacao = localizacao.estado === 'prompt' || localizacao.estado === 'denied'
  const pontoArea = rotaArea ? pontoDaUrl(params) : null
  const latArea = pontoArea?.lat
  const lngArea = pontoArea?.lng
  const circuloArea = useMemo(
    () =>
      latArea !== undefined && lngArea !== undefined
        ? circuloGeoJson({ lat: latArea, lng: lngArea }, 400)
        : null,
    [latArea, lngArea],
  )

  return (
    <div className="mapa-principal relative isolate size-full">
      <h1 className="sr-only">Mapa de ocorrências</h1>
      <MapaBase
        ref={setMapa}
        centroInicial={centroInicial}
        mostrarZoom={desktop}
        aoMudarRetangulo={setRetangulo}
        aoTocar={
          mostraCalor(filtros.modo) ? ({ lat, lng }) => void aoTocarMapa(lat, lng) : undefined
        }
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
        {circuloArea && (
          <Source id="area-incidentes" type="geojson" data={circuloArea}>
            <Layer
              id="area-incidentes"
              type="line"
              paint={{
                'line-color': COR_TRACEJADO[tema],
                'line-width': 1.5,
                'line-dasharray': [2, 2.5],
              }}
            />
          </Source>
        )}
        {localizacao.posicao && <MarcadorUsuario posicao={localizacao.posicao} />}

        <BotaoBussola className="right-3 bottom-[267px] lg:right-4 lg:bottom-[155px]" />
      </MapaBase>

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
            className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-destructive/15 py-2 pr-2 pl-4 text-[13px] text-destructive shadow-2"
          >
            <span className="flex-1">Não foi possível carregar o mapa.</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (falhouCategorias) void categoriasQuery.refetch()
                if (falhouGrupos) void gruposQuery.refetch()
                consultas.forEach((c) => void c.refetch())
              }}
            >
              Tentar novamente
            </Button>
          </div>
        )}
      </div>

      {vazio && !vazioFechado && !vazioDispensado && !falhou && !painelAberto && (
        <div className="pointer-events-none absolute inset-x-6 top-1/2 z-[1000] -translate-y-1/2">
          <EstadoVazio
            aoVerAreaMaior={() => mapa?.zoomTo(mapa.getZoom() - 2)}
            aoFechar={() => {
              marcar(CHAVE_AVISO_VAZIO_FECHADO)
              setVazioFechado(true)
            }}
          />
        </div>
      )}

      {legendaAberta && (
        <div
          className={cn(
            'pointer-events-none absolute bottom-[152px] left-3 z-[1000] lg:bottom-6 lg:left-4',
            painelAberto && 'lg:left-[436px]',
          )}
        >
          <LegendaMapa modo={filtros.modo} aoFechar={alternarLegenda} />
        </div>
      )}

      {aviso && (
        <div
          role="status"
          className="pointer-events-none absolute inset-x-0 bottom-[168px] z-[1000] mx-auto w-fit max-w-[90%] rounded-2xl px-4 py-2.5 text-sm shadow-3 vidro lg:bottom-8"
        >
          {aviso}
        </div>
      )}

      <div className="pointer-events-auto absolute right-3 bottom-[168px] z-[1000] flex flex-col divide-y divide-vidro-borda overflow-hidden rounded-[14px] shadow-2 vidro lg:right-4 lg:bottom-14">
        <BotaoMapa
          aria-label={legendaAberta ? 'Fechar legenda' : 'Abrir legenda'}
          aria-pressed={legendaAberta}
          onClick={alternarLegenda}
        >
          <Icone name="info" />
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
            name={
              localizacao.estado === 'denied' || localizacao.estado === 'indisponivel'
                ? 'location_disabled'
                : 'near_me'
            }
            preenchido
          />
        </BotaoMapa>
      </div>

      {!desktop && (
        <Link
          to="/registrar"
          onClick={(evento) => {
            evento.preventDefault()
            exigirConta('registrar', () => navigate('/registrar'), { retorno: '/registrar' })
          }}
          className="absolute bottom-[92px] left-1/2 z-[1000] flex h-12 -translate-x-1/2 pressionavel items-center gap-2 rounded-full bg-primary bg-linear-to-b from-black/0 to-black/12 px-5 font-semibold text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.22),0_8px_22px_color-mix(in_srgb,var(--primary)_45%,transparent)] hover:brightness-110 focus-visible:outline-2"
        >
          <Icone name="add_location_alt" />
          Registrar
        </Link>
      )}

      {ativarLocalizacao.dialogo}
      <Outlet context={contexto} />
    </div>
  )
}
