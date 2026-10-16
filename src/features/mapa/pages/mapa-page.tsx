import type { Map as MapaLeaflet } from 'leaflet'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'

import { Icone } from '@/common/components/icone'
import { useDesktop } from '@/common/hooks/use-media-query'
import { Button } from '@/common/ui/button'
import { useCategorias } from '@/features/categorias'
import { CamadaCalor, useCalorIncidentes } from '@/features/incidentes'
import { AjudaLocalizacaoDialog, useLocalizacao } from '@/features/localizacao'
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
import { filtrosDasCamadas } from '../models/filtros'
import { CENTRO_PADRAO, ZOOM_PADRAO } from '../models/mapa'
import type { Retangulo } from '../models/retangulo'

const CHAVE_LEGENDA_VISTA = 'ocorrencias.legendaVista'

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

/** Telas 1, 2, 18, 24 e 25. */
export function MapaPage() {
  const desktop = useDesktop()
  const filtros = useFiltrosMapa()
  const camadas = filtrosDasCamadas(filtros)
  const localizacao = useLocalizacao()

  const [mapa, setMapa] = useState<MapaLeaflet | null>(null)
  const [retangulo, setRetangulo] = useState<Retangulo | null>(null)
  const [legendaAberta, setLegendaAberta] = useState(() => !legendaJaVista())
  const [ajudaAberta, setAjudaAberta] = useState(false)

  const { data: categorias } = useCategorias()
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
    if (!mapa || !localizacao.posicao || centralizouRef.current) return
    centralizouRef.current = true
    mapa.setView([localizacao.posicao.lat, localizacao.posicao.lng], ZOOM_PADRAO)
  }, [mapa, localizacao.posicao])

  async function aoClicarGps() {
    if (localizacao.estado === 'denied' || localizacao.estado === 'indisponivel') {
      setAjudaAberta(true)
      return
    }
    const posicao = localizacao.posicao ?? (await localizacao.solicitar())
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
  const carregou =
    consultas.length > 0 && consultas.every((c) => c.isSuccess && !c.isPlaceholderData)
  const vazio = carregou && consultas.every((c) => c.data?.length === 0)
  const falhou = consultas.some((c) => c.isError)
  const semLocalizacao = localizacao.estado === 'prompt' || localizacao.estado === 'denied'

  return (
    // isolate: os z-index do Leaflet (até 1000) ficam presos aqui e não cobrem diálogos e folhas.
    <div className="relative isolate size-full">
      <MapaBase
        ref={setMapa}
        centroInicial={centroInicial}
        mostrarZoom={desktop}
        aoMudarRetangulo={setRetangulo}
      >
        {camadas.calor && calor.data && <CamadaCalor celulas={calor.data} />}
        {camadas.problemas && problemas.data && (
          <CamadaProblemas problemas={problemas.data} categorias={categoriasPorId} />
        )}
        {localizacao.posicao && <MarcadorUsuario posicao={localizacao.posicao} />}
      </MapaBase>

      {/* Controles sobre o mapa: no desktop ficam à esquerda, onde o painel lateral vai abrir. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] space-y-2 p-3 lg:right-auto lg:w-[460px] lg:p-4">
        <SeletorModo modo={filtros.modo} aoMudar={filtros.alterarModo} />
        <ChipsFiltro
          {...filtros}
          aoAlternarGrupo={filtros.alternarGrupo}
          aoAlternarNovas={filtros.alternarNovas}
        />
        {semLocalizacao && (
          <BannerLocalizacao
            aoAtivar={() =>
              localizacao.estado === 'denied' ? setAjudaAberta(true) : void localizacao.solicitar()
            }
          />
        )}
        {falhou && (
          <div
            role="alert"
            className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-error-container py-2 pr-2 pl-4 text-[13px] text-error-container-foreground shadow-md"
          >
            <span className="flex-1">Não foi possível carregar o mapa.</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => consultas.forEach((c) => void c.refetch())}
            >
              Tentar novamente
            </Button>
          </div>
        )}
      </div>

      {vazio && !falhou && (
        <div className="pointer-events-none absolute inset-x-6 top-1/2 z-[1000] -translate-y-1/2">
          <EstadoVazio aoVerAreaMaior={() => mapa?.zoomOut(2)} />
        </div>
      )}

      {legendaAberta && (
        <div className="pointer-events-none absolute bottom-6 left-3 z-[1000] lg:left-4">
          <LegendaMapa modo={filtros.modo} aoFechar={alternarLegenda} />
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
            semLocalizacao || localizacao.estado === 'indisponivel'
              ? 'Ativar localização'
              : 'Centralizar na minha localização'
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
            className="pointer-events-auto flex h-14 items-center gap-2 rounded-2xl bg-mint px-5 font-medium text-mint-foreground shadow-md transition-shadow hover:shadow-lg focus-visible:outline-2"
          >
            <Icone nome="add_location_alt" />
            Registrar
          </Link>
        )}
      </div>

      <AjudaLocalizacaoDialog
        aberto={ajudaAberta}
        aoMudarAberto={setAjudaAberta}
        estado={localizacao.estado}
      />
    </div>
  )
}
