# Redesign: mapa vetorial escuro, vidro e alertas estilo Waze — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Objetivo:** trocar o Leaflet com tiles raster por MapLibre com o estilo escuro M2 e aplicar o novo visual escuro (vidro, azul, alertas em balão) ao app inteiro, sem mudar regras, API, rotas ou textos.

**Arquitetura:** em duas etapas, com o app funcionando e os testes verdes ao fim de cada tarefa.
- **Etapa A — Mapa vetorial (T1–T5):** troca a biblioteca do mapa e mantém a interface atual. Leaflet e MapLibre convivem até a T5.
- **Etapa B — Sistema visual (T6–T12):** reescreve os tokens, os componentes base, o chrome do mapa, os marcadores e as telas.

O estilo do mapa é gerado por script e versionado, como a fonte de ícones. No Vitest o mapa é um falso, porque o jsdom não tem WebGL; a renderização real é conferida no `npm run prints`.

**Stack:** Vite 8, React 19, TS 5.9 strict, Tailwind 4, shadcn/Radix, vaul, TanStack Query, Vitest + Testing Library + MSW, Playwright (prints). Entram `maplibre-gl@^6.13.0` e `@vis.gl/react-maplibre@^8.1.3`, que é o pacote do react-map-gl só para MapLibre (peer `maplibre-gl >=4`, feito sobre a v6). Saem `leaflet`, `react-leaflet`, `leaflet.heat`, `@types/leaflet` e `@types/leaflet.heat`.

**Spec:** `docs/superpowers/specs/2026-10-17-redesign-mapa-vetorial-design.md` (leia antes; os mockups ficam em `.superpowers/brainstorm/*/content/`, fora do git).

## Restrições globais

- **Não commitar.** Branch `victor/refact`; o Victor diz quando commitar. Cada tarefa termina num *checkpoint*: `npm run lint`, `npm run format:check`, `npx tsc -b` e `npx vitest run` verdes.
- Regras do `CLAUDE.md` intactas, especialmente: 1 (guarda), 2 (localização opcional), 6 (marcadores), 7 (toque abre área), 9 (bbox com debounce de 400 ms), 15 (limite do retângulo), 11 (nunca logar token nem posição). Textos da interface não mudam.
- Fronteiras do ESLint (`no-restricted-imports`): uma feature só importa outra pelo `index.ts`; `common/` e `infrastructure/` não importam `features/`.
- Coordenadas no app continuam `[lat, lng]` (`CENTRO_PADRAO`, `Ponto { lat, lng }`). A conversão para `[lng, lat]` do MapLibre acontece **só** dentro de `MapaVetorial` e dos helpers de GeoJSON.
- Receita M2:
  - parte do estilo `https://tiles.openfreemap.org/styles/fiord`;
  - cores: **luminosidade × 0,66** e **saturação × 0,9**, mantendo o matiz;
  - remove as camadas cujo id casa com `/building|poi|housenumber|aeroway/`;
  - `line-width` × **1,7** nas camadas `line` cujo id casa com `/highway|road|tunnel|bridge|transportation/`.
- Atribuição visível: **"© OpenFreeMap © OpenStreetMap"**.
- Só tema escuro. Tokens fixos (spec, itens 5 e 9):
  - fundo `#121a24` e texto `#eef3fa`;
  - vidro `rgba(26,34,46,.62)` + `blur(20px) saturate(180%)` + borda `rgba(160,190,230,.12)`;
  - `--primario #3b9eff`, `--primario-cheio #1f74db` (fundo de botão com texto branco) e `--primario-suave rgba(59,158,255,.18)`.
- Cores das categorias: via `#ff7a1a`, elétrica `#f5b800`, limpeza `#c08552`, segurança `#ff3b30`, trânsito `#ff5e3a`.
- Gradiente do calor: 0 transparente, 0,2 `#5b2bff`, 0,45 `#c026d3`, 0,7 `#ff3b30`, 1 `#ffd60a`.
- Contraste AA: 4,5:1 para texto normal e 3:1 para texto grande e ícones. Animações respeitam `prefers-reduced-motion`.
- Antes de instalar um pacote, confirmar no npm a versão e o peer com React 19 (`npm view <pacote> peerDependencies`).

## Pontos de atenção na revisão

1. **Toque num marcador não pode abrir a área de incidentes** (regra 7). O MapLibre dispara `click` no mapa também ao clicar num marcador DOM, se o evento não for parado. Teste na T3.
2. **Afastar muito o zoom ou dar a volta no mundo:** `getBounds()` passa de ±180 e a API devolveria 400. `retanguloDaApi` continua sendo o único caminho para o retângulo. Teste na T3.
3. **Estilo do mapa com cor num formato inesperado** (nome de cor, `hsl` sem `%`) ou expressão `case`/`match` com cores dentro: o gerador não pode quebrar nem deixar uma cor clara sobrando. Teste na T1.
4. **Folha do detalhe aberta no menor snap:** os botões do card rápido precisam funcionar sem expandir, e o foco do teclado não pode ficar preso escondido. Teste na T10.
5. **Visitante tocando 👍/👎 no card rápido:** a folha "Entre para votar" abre, e depois do login o voto é retomado (regra 1). Teste na T10.

---

## Etapa A — Mapa vetorial

### Task 1: Dependências e estilo M2 versionado

**Arquivos:**
- Criar: `scripts/estilo-mapa.mjs` (funções puras da receita)
- Criar: `scripts/gen-estilo-mapa.mjs` (baixa o fiord, aplica a receita, grava)
- Criar: `scripts/estilo-mapa.test.mjs`
- Criar (gerado): `src/assets/mapa/estilo.json`
- Modificar: `package.json` (deps + script `"gen:estilo-mapa": "node scripts/gen-estilo-mapa.mjs"`)

**Interfaces — produz:**
- `RECEITA_M2 = { escala: 0.66, saturacao: 0.9, fatorVias: 1.7, semCamadas: /building|poi|housenumber|aeroway/, vias: /highway|road|tunnel|bridge|transportation/ }`
- `escurecerCor(cor: string, { escala, saturacao }): string`:
  - aceita `#rgb`, `#rrggbb`, `rgb()`/`rgba()` e `hsl()`/`hsla()`, com ou sem `%`;
  - devolve `hsla(H, S%, L%, A)` com H inteiro e S, L em inteiros;
  - qualquer outra string volta como está.
- `escalarLargura(valor: unknown, fator: number): unknown`: número; `{ stops: [[z, w]] }`; `['interpolate', curva, ['zoom'], z, w, …]` (escala os valores, não os zooms); `['step', entrada, w0, z, w, …]`.
- `aplicarReceita(estilo: object, receita = RECEITA_M2): object`: devolve uma cópia. Percorre recursivamente toda propriedade `paint` cujo nome contém `color`, passando cada string por `escurecerCor`.
- `src/assets/mapa/estilo.json`: estilo MapLibre completo. Fontes, glyphs e sprite continuam apontando para o OpenFreeMap.

- [ ] **Passo 1: instalar** `maplibre-gl@^6.13.0` e `@vis.gl/react-maplibre@^8.1.3`, conferindo antes o peer no npm.
- [ ] **Passo 2: escrever os testes que falham** em `scripts/estilo-mapa.test.mjs`:

```js
test('escurecerCor mantém o matiz e aplica luminosidade e saturação', () => {
  expect(escurecerCor('hsl(210, 40%, 50%)', { escala: 0.66, saturacao: 0.9 })).toBe('hsla(210, 36%, 33%, 1)')
  expect(escurecerCor('#ffffff', { escala: 0.66, saturacao: 0.9 })).toBe('hsla(0, 0%, 66%, 1)')
  expect(escurecerCor('rgba(0,0,255,0.5)', { escala: 0.5, saturacao: 1 })).toBe('hsla(240, 100%, 25%, 0.5)')
  expect(escurecerCor('hsl(210,40,50)', { escala: 1, saturacao: 1 })).toBe('hsla(210, 40%, 50%, 1)')
  expect(escurecerCor('transparent', RECEITA_M2)).toBe('transparent')
})
test('escalarLargura escala números, stops, interpolate e step sem mexer nos zooms', () => {
  expect(escalarLargura(2, 1.5)).toBe(3)
  expect(escalarLargura({ stops: [[10, 1], [16, 4]] }, 2)).toEqual({ stops: [[10, 2], [16, 8]] })
  expect(escalarLargura(['interpolate', ['exponential', 1.2], ['zoom'], 10, 1, 16, 4], 2))
    .toEqual(['interpolate', ['exponential', 1.2], ['zoom'], 10, 2, 16, 8])
  expect(escalarLargura(['step', ['zoom'], 1, 14, 3], 2)).toEqual(['step', ['zoom'], 2, 14, 6])
})
test('aplicarReceita remove prédios e POIs, engrossa vias e escurece cores, inclusive dentro de expressões', () => {
  const estilo = { layers: [
    { id: 'building', type: 'fill', paint: { 'fill-color': '#888888' } },
    { id: 'poi_label', type: 'symbol' },
    { id: 'highway_minor', type: 'line', paint: { 'line-width': 2, 'line-color': ['match', ['get', 'x'], 'a', '#ffffff', '#000000'] } },
    { id: 'water', type: 'fill', paint: { 'fill-color': 'hsl(210, 40%, 50%)' } },
  ] }
  const r = aplicarReceita(estilo)
  expect(r.layers.map((c) => c.id)).toEqual(['highway_minor', 'water'])
  expect(r.layers[0].paint['line-width']).toBeCloseTo(3.4)
  expect(r.layers[0].paint['line-color']).toEqual(['match', ['get', 'x'], 'a', 'hsla(0, 0%, 66%, 1)', 'hsla(0, 0%, 0%, 1)'])
  expect(r.layers[1].paint['fill-color']).toBe('hsla(210, 36%, 33%, 1)')
  expect(estilo.layers).toHaveLength(4) // não muta a entrada
})
test('o estilo versionado não tem prédios nem cores fora do padrão hsla', async () => {
  const estilo = JSON.parse(await readFile('src/assets/mapa/estilo.json', 'utf8'))
  expect(estilo.layers.some((c) => /building|poi|housenumber|aeroway/.test(c.id))).toBe(false)
  const cores = JSON.stringify(estilo.layers.map((c) => c.paint ?? {})).match(/"(#[0-9a-f]{3,6}|rgba?\([^)]*\))"/gi)
  expect(cores, 'rode npm run gen:estilo-mapa').toBeNull()
})
```

- [ ] **Passo 3: rodar** `npx vitest run scripts/estilo-mapa.test.mjs`. Esperado: FALHA (módulo inexistente).
- [ ] **Passo 4: implementar** `scripts/estilo-mapa.mjs`:
  - conversão RGB↔HSL própria, sem dependência;
  - cada `string` que aparece em `paint[*color*]`, inclusive dentro de arrays, passa por `escurecerCor`;
  - os números passam intactos.
- [ ] **Passo 5: implementar** `scripts/gen-estilo-mapa.mjs` no modelo do `scripts/gen-icones.mjs`:
  - `fetch` do fiord, `aplicarReceita` e gravação de `src/assets/mapa/estilo.json` com 2 espaços e `\n` no fim;
  - log `N camadas → src/assets/mapa/estilo.json`.
- [ ] **Passo 6: rodar** `npm run gen:estilo-mapa` e depois `npx vitest run scripts/estilo-mapa.test.mjs`. Esperado: PASSA.
- [ ] **Passo 7: checkpoint.**

### Task 2: `MapaVetorial`, falso do MapLibre nos testes e círculo em GeoJSON

**Arquivos:**
- Criar: `src/common/components/mapa-vetorial.tsx`
- Criar: `src/common/lib/geo.ts` + `src/common/lib/geo.test.ts`
- Criar: `src/test/maplibre-falso.tsx`
- Modificar: `src/test/setup.ts` (adicionar `vi.mock('@vis.gl/react-maplibre', () => import('./maplibre-falso'))`)
- Modificar: `src/main.tsx` ou `src/index.css` (importar `maplibre-gl/dist/maplibre-gl.css` uma vez)

**Interfaces — produz:**
- `MapaVetorial` (em `common/components/mapa-vetorial.tsx`):

```ts
interface MapaVetorialProps {
  centro: [number, number]          // [lat, lng]; só vale na criação
  zoom?: number                     // padrão ZOOM_PADRAO
  interativo?: boolean              // false = sem arrastar/zoom/girar (conferência, estático)
  mostrarZoom?: boolean             // NavigationControl no canto superior direito (desktop)
  ref?: Ref<MapRef>                 // MapRef de @vis.gl/react-maplibre
  aoMover?(): void                  // evento move
  aoParar?(): void                  // evento moveend
  aoTocar?(ponto: { lat: number; lng: number }): void  // evento click
  className?: string                // padrão 'size-full'
  children?: ReactNode
}
```

  - `<Map>` com `mapStyle` = `src/assets/mapa/estilo.json` (import JSON), `minZoom` 3, `maxZoom` 19, `dragRotate` e `pitchWithRotate` ligados quando `interativo`;
  - `attributionControl={{ compact: true, customAttribution: '© OpenFreeMap' }}`;
  - `reuseMaps`.
- `circuloGeoJson(centro: { lat: number; lng: number }, raioMetros: number, passos = 64): GeoJSON.Feature<GeoJSON.Polygon>`: anel fechado (o primeiro ponto é igual ao último), coordenadas `[lng, lat]`, aproximação esférica com R = 6 371 008,8 m.
- `linhaGeoJson(a: Ponto, b: Ponto): GeoJSON.Feature<GeoJSON.LineString>`.
- Falso (`src/test/maplibre-falso.tsx`) exporta os mesmos nomes usados no app: `Map`, `Marker`, `Source`, `Layer`, `NavigationControl`, `useMap`, `type MapRef`.
  - `Map` renderiza `<div data-testid="mapa" className="maplibregl-map">` com os filhos e expõe pelo `ref` uma instância falsa:
    - `getCenter()`, `getZoom()`, `getBounds()` (centro ± 0,01°), `getContainer()`, `getCanvas()`;
    - `easeTo`/`flyTo`/`jumpTo`, que atualizam o centro e emitem `move` + `moveend`;
    - `on`/`off`, `getMap()` (devolve a própria instância), `zoomOut()` e `project`/`unproject` triviais.
  - `Marker` renderiza `<div data-testid="marcador">` com os filhos e repassa `onClick` com `{ originalEvent }`.
  - `Source` e `Layer` renderizam `<div data-testid="camada-{id}" data-tipo={type} />` e guardam `data` num atributo `data-pontos` com a quantidade de features.
  - Exporta também `mapaFalso`, para os testes: `{ atual(): InstanciaFalsa | null, tocar(lat, lng): void, mover(centro): void }`.

- [ ] **Passo 1: escrever o teste que falha** em `src/common/lib/geo.test.ts`:

```ts
test('circuloGeoJson fecha o anel e tem o raio pedido', () => {
  const c = circuloGeoJson({ lat: -22.9519, lng: -43.1866 }, 400, 32)
  const anel = c.geometry.coordinates[0]!
  expect(anel).toHaveLength(33)
  expect(anel[0]).toEqual(anel[32])
  for (const [lng, lat] of anel) expect(distanciaMetros({ lat: -22.9519, lng: -43.1866 }, { lat, lng })).toBeCloseTo(400, -1)
})
test('linhaGeoJson usa [lng, lat]', () => {
  expect(linhaGeoJson({ lat: 1, lng: 2 }, { lat: 3, lng: 4 }).geometry.coordinates).toEqual([[2, 1], [4, 3]])
})
```

  (`distanciaMetros` mora em `src/features/localizacao/lib/distancia.ts`. Mova-a para `src/common/lib/geo.ts` e deixe `features/localizacao/index.ts` reexportando de lá, para não mudar os consumidores. O `common/` não pode importar `features/`.)
- [ ] **Passo 2: rodar** `npx vitest run src/common/lib/geo.test.ts`. Esperado: FALHA.
- [ ] **Passo 3: implementar** `src/common/lib/geo.ts`.
- [ ] **Passo 4: rodar** de novo. Esperado: PASSA.
- [ ] **Passo 5: implementar** `MapaVetorial` e o falso, e registrar o `vi.mock` no setup. Nada ainda usa o `MapaVetorial`; os mapas Leaflet continuam.
- [ ] **Passo 6: checkpoint.** Todos os testes continuam verdes; o falso ainda não tem consumidor.

### Task 3: Mapa principal no MapLibre

**Arquivos:**
- Modificar: `src/features/mapa/components/mapa-base.tsx` (usa `MapaVetorial`; `aoParar` com debounce de 400 ms chama `retanguloDaApi`; o primeiro retângulo sai no `onLoad`)
- Modificar: `src/features/mapa/pages/mapa-page.tsx`
- Modificar: `src/features/mapa/components/ouvinte-toque.tsx` (removido; o toque vira `aoTocar` do `MapaBase`)
- Modificar: `src/features/mapa/components/marcador-usuario.tsx` (`<Source>` com `circuloGeoJson` da precisão + `<Marker>` com o ponto)
- Modificar: `src/features/problemas/components/camada-problemas.tsx` (`<Marker>` do react-maplibre com `<MarcadorProblema>` como filho)
- Modificar: `src/features/incidentes/components/camada-calor.tsx` (`<Source type="geojson">` + `<Layer type="heatmap">`)
- Modificar: `src/features/incidentes/models/calor.ts` (+ `expressaoGradienteCalor()`)
- Modificar: `src/features/mapa/pages/mapa-page.test.tsx`
- Testes novos: `src/features/incidentes/components/camada-calor.test.tsx`, `src/features/problemas/components/camada-problemas.test.tsx`

**Interfaces:**
- Consome: `MapaVetorial`, `circuloGeoJson`, `mapaFalso` (T2).
- Produz:
  - `MapaBase` com as props atuais mais `aoTocar?(ponto)` e `ref?: Ref<MapRef>`;
  - `expressaoGradienteCalor(): ExpressionSpecification`, que monta `['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(0,0,0,0)', ...paradas]` a partir de `gradienteCalor`;
  - `pesosCalor(celulas: CelulaCalor[]): GeoJSON.FeatureCollection<Point, { peso: number }>`, com peso = `quantidade / max(4, maior quantidade)`, a mesma normalização de hoje.

**Decisões:**
- Clique no marcador: `onClick={(e) => { e.originalEvent.stopPropagation(); aoSelecionar(id) }}`, para o toque não chegar ao `click` do mapa (regra 7).
- Ordem dos marcadores: o elemento ganha `style.zIndex` com a regra atual (selecionado 1000; nova 0; alta 300, média 200, baixa 100).
- Heatmap:
  - `heatmap-weight ['get','peso']`;
  - `heatmap-radius` interpolado por zoom: 10→18, 14→30, 17→60;
  - `heatmap-intensity`: 10→0,6, 15→1,2;
  - `heatmap-opacity` 0,75;
  - `heatmap-color` = `expressaoGradienteCalor()`.
- `focar({lat,lng})` vira `mapa.easeTo({ center: [lng, lat], offset })`:
  - celular: `offset = [0, -altura * 0.25]`;
  - desktop: `offset = [LARGURA_PAINEL / 2, 0]`.
- O círculo da área (400 m) vira `<Source type="geojson" data={circuloGeoJson(pontoArea, 400)}>` + `<Layer type="line">` tracejada (`line-dasharray [2, 2.5]`, `line-color '#eef3fa'`, `line-width 1.5`).
- O aviso de área vazia continua sendo dispensado por `pointerdown`/`wheel` no `getContainer()`.
- A centralização inicial na primeira posição usa `jumpTo`.

- [ ] **Passo 1: escrever os testes que falham** (com o falso):

```ts
// camada-problemas.test.tsx
test('clicar no marcador seleciona o problema e não propaga para o mapa', async () => { /* renderiza dentro de <MapaVetorial>, clica no marcador, espera aoSelecionar(id) e que aoTocar do mapa não seja chamado */ })
test('marcador selecionado fica por cima', () => { /* zIndex 1000 no selecionado, 300 no alta */ })

// camada-calor.test.tsx
test('pesosCalor normaliza pela maior célula com piso 4', () => {
  expect(pesosCalor([{ lat: 0, lng: 0, quantidade: 2 }, { lat: 1, lng: 1, quantidade: 8 }]).features.map((f) => f.properties.peso)).toEqual([0.25, 1])
  expect(pesosCalor([{ lat: 0, lng: 0, quantidade: 1 }]).features[0]!.properties.peso).toBe(0.25)
})
test('expressaoGradienteCalor começa transparente e segue as paradas em ordem', () => {
  const e = expressaoGradienteCalor()
  expect(e.slice(0, 5)).toEqual(['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(0,0,0,0)'])
  expect(e[5]).toBe(0.2)
})

// mapa-page.test.tsx (ajustar o teste do aviso vazio para [data-testid="mapa"])
test('toque no mapa no modo Ambos sem incidentes mostra o aviso e não navega', async () => { /* mapaFalso.tocar(); espera 'Sem incidentes por aqui nos últimos 7 dias' */ })
test('retângulo enviado à API fica dentro de ±180 mesmo com o mapa afastado', async () => { /* mapaFalso.mover com getBounds largo (-200..200): a requisição GET /problemas recebe minLng=-180 e maxLng=180 */ })
```

- [ ] **Passo 2: rodar** os quatro arquivos. Esperado: FALHA.
- [ ] **Passo 3: implementar** as mudanças listadas, com as decisões acima.
- [ ] **Passo 4: rodar** `npx vitest run src/features`. Esperado: PASSA.
- [ ] **Passo 5: conferir no Chrome** (`npm run dev` + API, ou `VITE_USE_MOCKS=true npm run dev`):
  - marcadores visíveis;
  - calor no modo Ambos;
  - toque fora do marcador abre a área e toque no marcador abre o detalhe;
  - o detalhe centraliza o ponto acima da folha.
- [ ] **Passo 6: checkpoint.**

### Task 4: Mapa do registro no MapLibre

**Arquivos:**
- Modificar: `src/features/registro/components/mapa-registro.tsx`
- Modificar: `src/test/fluxos/registro.test.tsx` (apenas seletores, se algum depender do DOM do Leaflet)

**Interfaces:**
- Consome: `MapaVetorial`, `circuloGeoJson`, `linhaGeoJson`, `CamadaProblemas`/`MarcadorProblema` (export da feature `problemas`).
- Produz: `MapaRegistro` com as mesmas props de hoje (`modo: 'pino' | 'area' | 'conferencia' | 'estatico'`).

**Decisões:**
- **pino:** o pino continua fixo no centro, por cima do mapa. `aoParar` grava `definirLocal(centro)`.
- **área:** `<Source>` com `circuloGeoJson(centro, 150)`, atualizado em `aoMover` (estado local), com preenchimento e linha tracejada.
- **conferência:**
  - `interativo={false}`;
  - `fitBounds` nos dois pontos com `padding 90` e `maxZoom 19`;
  - `<Layer type="line">` tracejada com `linhaGeoJson`;
  - rótulo da distância como `<Marker>` no ponto médio, com `distanciaTexto`;
  - dois `<Marker>` com `MarcadorProblema` (o novo `selecionado`).
- **estático:** `interativo={false}` + `<Marker>` com o ponto.
- `CentrarNaPrimeiraPosicao`: escuta `dragstart` pela instância (`useMap().current.on('dragstart')`) e faz `jumpTo` uma única vez.
- `BotaoGps`: `flyTo({ center: [lng, lat], zoom: max(zoom, 17) })`.

- [ ] **Passo 1: escrever o teste que falha** em `src/features/registro/components/mapa-registro.test.tsx`:

```ts
test('modo pino grava o centro do mapa como local ao parar de mover', async () => { /* mapaFalso.mover({lat:-22.95,lng:-43.18}) → useRascunhoStore.getState().local ≈ { lat: -22.95, lng: -43.18 } */ })
test('modo área desenha o raio de 150 m', () => { /* camada-registro-area com data-pontos=1 */ })
test('conferência mostra a distância entre os pinos', () => { /* texto de distanciaTexto(30) visível */ })
```

- [ ] **Passo 2: rodar.** Esperado: FALHA.
- [ ] **Passo 3: implementar.**
- [ ] **Passo 4: rodar** `npx vitest run src/features/registro src/test/fluxos/registro.test.tsx`. Esperado: PASSA.
- [ ] **Passo 5: conferir no Chrome** os quatro passos de local do registro (problema e incidente).
- [ ] **Passo 6: checkpoint.**

### Task 5: Remover o Leaflet

**Arquivos:**
- Remover: `src/common/components/mapa-osm.tsx`, `src/features/incidentes/lib/leaflet-heat.ts`, `src/features/incidentes/lib/leaflet-global.ts` e `src/features/problemas/lib/icone-marcador.tsx`, junto com o export dele no `index.ts` da feature.
- Modificar: `package.json` (desinstalar `leaflet`, `react-leaflet`, `leaflet.heat`, `@types/leaflet` e `@types/leaflet.heat`)
- Modificar: `src/index.css` (apagar o bloco "Mapa (Leaflet)" e `.tooltip-distancia`)
- Modificar: `CLAUDE.md`:
  - "Stack": mapa = MapLibre GL + `@vis.gl/react-maplibre` e OpenFreeMap com estilo M2 versionado;
  - "Mapa (Leaflet)" vira "Mapa (MapLibre)": `[lat,lng]` no app, `MapaVetorial`, falso nos testes, `stopPropagation` no marcador e heatmap nativo;
  - Comandos: `npm run gen:estilo-mapa`.

- [ ] **Passo 1:** `rtk proxy grep -rn "leaflet" src scripts` não encontra nada, só comentários históricos (que devem ser apagados).
- [ ] **Passo 2:** `npm run build` passa. Anotar o tamanho do JS em gzip antes (328 KB) e depois.
- [ ] **Passo 3:** `npm run prints` gera os 12 PNGs com o mapa vetorial visível. Se algum print sair com o mapa em branco, aumentar a espera após `networkidle` em `scripts/prints.mjs` de 1 200 para 2 500 ms.
- [ ] **Passo 4: checkpoint.**

## Etapa B — Sistema visual escuro

### Task 6: Tokens do tema escuro, Inter e contraste testado

**Arquivos:**
- Modificar: `src/index.css` (`:root` inteiro e `@theme inline`)
- Modificar: `index.html` (fonte Inter via Google Fonts: `wght@400;500;600;700`, `display=swap`) ou pacote `@fontsource-variable/inter`, se preferir não depender do Google em tempo de execução, como na fonte de ícones *(recomendado: `@fontsource-variable/inter`)*
- Criar: `scripts/contraste.test.mjs`

**Interfaces — produz (tokens que as tarefas seguintes usam):**
- Mantém os nomes do shadcn: `--background #121a24`, `--foreground #eef3fa`, `--card #1a2431`, `--muted #223041`, `--muted-foreground #9fb0c3`, `--border rgba(160,190,230,.14)`, `--input #33445a`, `--ring #3b9eff`, `--destructive #ff5a52`.
- `--primary` = `#1f74db` (botão cheio) e `--primary-foreground #ffffff`.
- Novos:
  - `--primario #3b9eff` e `--primario-suave rgba(59,158,255,.18)`;
  - `--vidro rgba(26,34,46,.62)`, `--vidro-borda rgba(160,190,230,.12)`;
  - `--superficie-1 #1a2431`, `--superficie-2 #223041`.
- Categorias: `--cat-*` com as cores vivas da restrição global, e `--cat-*-claro` = mesma cor com alfa 0,18.
- `--nova #3b9eff` com `--nova-foreground #ffffff`. Para manter o contraste do texto do selo, o selo usa `--primario-cheio`.
- `--font-sans: 'Inter Variable', 'Inter', ui-sans-serif, system-ui, sans-serif`.
- Utilitário Tailwind 4 em `index.css`: `@utility vidro { background: var(--vidro); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); border: 1px solid var(--vidro-borda); }`.
- Tokens que somem: `--mint`, `--mint-foreground`, `--surface-container*`, `--nav-indicator`, `--secondary*`, `--info*` e `--calor`. Cada uso no código é trocado pelo equivalente novo; o `tsc`/ESLint não pegam isso, então use `rtk proxy grep -rn "mint\|surface-container\|nav-indicator\|secondary\|bg-info\|calor" src`.

- [ ] **Passo 1: escrever o teste que falha** em `scripts/contraste.test.mjs`. Ele lê `src/index.css`, extrai as variáveis de `:root` e calcula o contraste WCAG:

```js
test.each([
  ['--foreground', '--background', 4.5],
  ['--muted-foreground', '--background', 4.5],
  ['--muted-foreground', '--card', 4.5],
  ['--primary-foreground', '--primary', 4.5],
  ['--primario', '--background', 4.5],
  ['--destructive', '--background', 4.5],
  ['--foreground', '--superficie-2', 4.5],
])('%s sobre %s tem contraste ≥ %s', async (texto, fundo, minimo) => {
  expect(contraste(await token(texto), await token(fundo))).toBeGreaterThanOrEqual(minimo)
})
```

- [ ] **Passo 2: rodar.** Esperado: FALHA (tokens antigos).
- [ ] **Passo 3: implementar** os tokens, a fonte e o utilitário `vidro`, e trocar os usos dos tokens que somem.
- [ ] **Passo 4: rodar** `npx vitest run`. Esperado: PASSA.
- [ ] **Passo 5: checkpoint** + olhar `/mapa`, `/recentes` e `/perfil` no Chrome. Nada pode ficar ilegível (texto escuro em fundo escuro).

### Task 7: Componentes base no novo visual

**Arquivos:**
- Modificar: `src/common/ui/button.tsx`:
  - variantes: `default` = `bg-primary` em pílula; `tonal` = `bg-[--primario-suave] text-[--primario]`; `outline` = borda `--border`; `ghost`;
  - altura 44 px, `font-semibold`.
- Modificar: `src/common/ui/drawer.tsx` e `src/common/ui/dialog.tsx` (conteúdo em `bg-card`, topo da folha com 28 px de raio, alça `bg-muted-foreground/40`, overlay `bg-black/50`)
- Modificar: `src/common/components/chip-filtro.tsx` (pílula `vidro`; marcado = `bg-[--primario-suave] text-[--primario]` com borda `--primario`)
- Modificar: `src/common/components/segmentado.tsx` (contêiner `vidro`, raio 14 px; opção ativa = `bg-[--primario-suave] text-[--primario]`)
- Modificar: `src/common/components/campo-texto.tsx` (fundo `--superficie-2`, borda `--input`, foco com anel `--ring`)
- Modificar: `src/common/components/folha-responsiva.tsx`, `tela-com-voltar.tsx` e `pagina.tsx` (apenas classes)

**Interfaces:** os nomes de props e variantes continuam os mesmos; os consumidores não mudam.

- [ ] **Passo 1:** rodar `npx vitest run`. Os testes atuais, que consultam por papel e nome, continuam valendo. Não há teste visual novo.
- [ ] **Passo 2: implementar** as classes.
- [ ] **Passo 3: conferir no Chrome**:
  - folha "Entre para votar";
  - diálogo de falha de envio (tela 26);
  - login;
  - chips e segmentado do mapa;
  - foco visível com Tab em todos.
- [ ] **Passo 4: checkpoint.**

### Task 8: Chrome do mapa e navegação em vidro

**Arquivos:**
- Modificar: `src/app/layouts/mobile-layout.tsx`:
  - a barra inferior vira flutuante: `absolute inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] h-[58px] rounded-[22px] vidro`;
  - o `main` ganha `pb-24` fora de `/mapa`, para o conteúdo não ficar sob a barra;
  - aba ativa = ícone preenchido + texto `text-[--primario]`, sem indicador de fundo.
- Modificar: `src/app/layouts/desktop-layout.tsx` (trilho lateral em `vidro`; ativo em `--primario`)
- Modificar: `src/features/mapa/pages/mapa-page.tsx`:
  - "Registrar" em pílula `bg-primary text-primary-foreground`, com sombra `0 8px 22px rgba(59,158,255,.45)`, centralizado acima da barra (`bottom-[96px]`) no celular;
  - legenda e GPS num grupo vertical de `vidro` (raio 14 px) à direita;
  - toast do aviso em `vidro`.
- Modificar: `src/features/mapa/components/botao-mapa.tsx`, `banner-localizacao.tsx`, `legenda-mapa.tsx` e `estado-vazio.tsx` (`vidro`; ícones em `--primario`)
- Modificar: `src/common/components/painel-responsivo.tsx` (painel desktop em `vidro`, com borda direita `--vidro-borda`)

- [ ] **Passo 1:** os testes de `mapa-page.test.tsx` e dos fluxos continuam verdes (os seletores são por papel e nome).
- [ ] **Passo 2: implementar.**
- [ ] **Passo 3: conferir no Chrome**, em 390 × 844 e em 1440 × 900, contra o mockup `cor-principal.html`, opção A:
  - nada fica sob a barra flutuante em `/recentes` e `/perfil`;
  - o FAB não cobre a atribuição.
- [ ] **Passo 4: checkpoint.**

### Task 9: Alertas em balão, pulso, calor novo e marcador do usuário

**Arquivos:**
- Modificar: `src/features/problemas/models/marcador.ts`:
  - `variantes`: alta `{ diametro: 38, opacidade: 1 }`, média `{ diametro: 31, opacidade: 1 }`, baixa `{ diametro: 25, opacidade: 0.55 }`, nova `{ diametro: 28, opacidade: 0.9 }`;
  - `dimensoesMarcador` devolve `{ largura: diametro, altura: diametro + 7 }` (a ponta);
  - sai `PINO`.
- Modificar: `src/features/problemas/components/marcador-problema.tsx`:
  - balão = círculo na cor da categoria, ícone branco a 56 % do diâmetro, borda branca de 2,5 px, ponta triangular branca de 7 px, `box-shadow 0 4px 10px rgba(0,0,0,.28)`;
  - `possivelmenteResolvida` = borda tracejada + selo de check;
  - `nova` = selo "Nova" (`--primario-cheio`, texto branco, 8,5–11 px, borda branca);
  - `selecionado` = escala 1,15 + sombra no chão;
  - pulso: `<span class="pulso-alerta">` só quando `faixa === 'alta'` e o status não é `nova`.
- Modificar: `src/index.css` (`@keyframes pulso-alerta { from { transform: scale(.6); opacity: .5 } to { transform: scale(1.6); opacity: 0 } }`, 1,8 s infinito, e `@media (prefers-reduced-motion: reduce) { .pulso-alerta { animation: none; display: none } }`)
- Modificar: `src/features/incidentes/models/calor.ts` (`gradienteCalor` = `{ 0.2: '#5b2bff', 0.45: '#c026d3', 0.7: '#ff3b30', 1: '#ffd60a' }`; a legenda e o heatmap atualizam juntos)
- Modificar: `src/features/mapa/components/marcador-usuario.tsx` (ponto `--primario` com borda branca + halo `rgba(59,158,255,.18)`)
- Modificar: `src/features/problemas/components/marcador-problema.test.tsx` e `src/features/incidentes/models/calor.test.ts`

- [ ] **Passo 1: escrever os testes que falham**:

```ts
test('alta pulsa; nova e baixa não', () => { /* render alta → .pulso-alerta presente; nova e baixa → ausente */ })
test('tamanhos por faixa', () => { expect(dimensoesMarcador('ativa', 'alta')).toEqual({ largura: 38, altura: 45 }); expect(dimensoesMarcador('ativa', 'baixa').largura).toBe(25) })
test('possivelmenteResolvida tem borda tracejada e selo de check', () => { /* style borderStyle dashed; texto 'check' */ })
test('gradiente do calor nas cores novas', () => { expect(gradienteCalorCss).toBe('linear-gradient(to right, #5b2bff 20%, #c026d3 45%, #ff3b30 70%, #ffd60a 100%)') })
```

- [ ] **Passo 2: rodar.** Esperado: FALHA.
- [ ] **Passo 3: implementar.**
- [ ] **Passo 4: rodar.** Esperado: PASSA.
- [ ] **Passo 5: conferir no Chrome** contra o mockup:
  - os alertas são o elemento mais visível sobre o M2;
  - com "reduzir movimento" ligado no sistema, nada pulsa.
- [ ] **Passo 6: checkpoint.**

### Task 10: Card rápido do alerta (primeiro estágio da folha)

**Arquivos:**
- Modificar: `src/common/components/painel-responsivo.tsx` (prop opcional `alturaResumo?: number`. No celular, quando definida, o Drawer usa `snapPoints={[`${alturaResumo}px`, 1]}` com `activeSnapPoint` controlado e começa no primeiro; no desktop é ignorada)
- Criar: `src/features/problemas/components/detalhe/resumo-alerta.tsx`
- Modificar: `src/features/problemas/components/detalhe/detalhe-problema.tsx` (o `ResumoAlerta` fica no topo; o resto do conteúdo vem abaixo)
- Modificar: `src/features/mapa/pages/detalhe-problema-page.tsx` (passa `alturaResumo={ALTURA_RESUMO}`, com `ALTURA_RESUMO = 184` exportado de `resumo-alerta.tsx` pela feature `problemas`)
- Teste: `src/features/problemas/components/detalhe/resumo-alerta.test.tsx`

**Interfaces:**
- `ResumoAlerta({ problema }: { problema: DetalheProblema })`. Mostra:
  - ícone da categoria num círculo cheio na cor forte;
  - nome da categoria e endereço;
  - "há X" (date-fns);
  - "N confirmaram";
  - distância (`useDistanciaAte`);
  - dois botões redondos de 44 px com `aria-label`.
- Usa `useVotos(problema)` sem lógica nova de voto. Os valores vêm do OpenAPI: `ValorExistencia = 'confirma' | 'naoVi'` e `ValorPersistencia = 'continua' | 'resolvido'`.
  - `nova`: 👍 = `votarExistencia('confirma')` e 👎 = `votarExistencia('naoVi')`. O autor não vê os botões.
  - `ativa` e `possivelmenteResolvida`: 👍 = `votarPersistencia('continua')` e 👎 = `votarPersistencia('resolvido')`.
  - `resolvida`: sem botões.
  - `aria-label` = "Voto rápido: " + o texto do botão equivalente no detalhe ("Confirmar que existe", "Não vi", "Sim, continua", "Não, foi resolvido"). O prefixo evita dois botões com o mesmo nome acessível na mesma tela, o que quebraria os testes atuais do detalhe.
- Selecionado = `aria-pressed` conforme `meus.existencia` / `meus.persistencia`. Desabilitado enquanto `votando`.

- [ ] **Passo 1: escrever os testes que falham**:

```ts
test('nova: polegares votam existência', async () => { /* clica 'Voto rápido: Confirmar que existe' → POST /problemas/{id}/votos/existencia com valor confirma */ })
test('ativa: polegares votam persistência', async () => { /* clica 'Voto rápido: Sim, continua' → POST .../votos/persistencia com valor continua */ })
test('autor não vê os botões de existência em nova', () => {})
test('resolvida não tem botões', () => {})
test('visitante tocando no polegar abre "Entre para votar" e o voto é retomado após o login', async () => { /* no fluxo: src/test/fluxos/guarda.test.tsx */ })
test('no celular a folha abre no resumo e os botões funcionam sem expandir', async () => { /* definirLargura(390); os botões do resumo ficam acessíveis e clicáveis */ })
```

- [ ] **Passo 2: rodar.** Esperado: FALHA.
- [ ] **Passo 3: implementar.** O `CartoesAtiva` etc. continuam no detalhe completo; o resumo não os substitui.
- [ ] **Passo 4: rodar** `npx vitest run src/features/problemas src/test/fluxos`. Esperado: PASSA.
- [ ] **Passo 5: conferir no Chrome** (390 px):
  - tocar num alerta abre o card baixo;
  - arrastar para cima mostra o detalhe completo;
  - o Tab percorre os botões do card sem cair em elementos escondidos.
- [ ] **Passo 6: checkpoint.**

### Task 11: Telas sem mapa no tema escuro

**Arquivos (só classes e estrutura visual; textos e lógica intactos):**
- `src/features/problemas/pages/recentes-page.tsx` (ou onde estiver a tela de Recentes): cards `bg-card` com raio 20 px e ícone da categoria em círculo `--cat-*-claro`.
- `src/features/perfil/pages/*`: cartão do usuário e cartão de verificação; lista de configurações em grupos `bg-card` com raio 20 px, no estilo dos Ajustes do iOS.
- `src/features/auth/pages/*` e a pré-permissão: cartão centralizado em `bg-card` no desktop; no celular, tela cheia sobre `--background`.
- `src/features/admin/pages/fila-verificacao-page.tsx`: cards de pedido.
- Passos do registro (`PassoRegistro` e páginas de `/registrar/*`): barra de progresso em `--primario`, botões de categoria em grade com `bg-card`.
- Achar cada tela pelo `docs/TELAS.md`: rota → page.

- [ ] **Passo 1:** `npx vitest run` verde antes de começar.
- [ ] **Passo 2: implementar** tela por tela.
- [ ] **Passo 3:** `npm run prints` e revisar os 12 PNGs:
  - sem texto ilegível;
  - sem resto de verde do tema antigo (`rtk proxy grep -rn "046d4e\|8ff6c5\|mint" src` vazio);
  - hierarquia clara.
- [ ] **Passo 4: auditoria axe** (como na Etapa 6) em `/mapa`, `/recentes`, `/perfil` e `/login`, no celular e no desktop. Zero violações de contraste.
- [ ] **Passo 5: checkpoint.**

### Task 12: Documentação e fechamento

**Arquivos:**
- Modificar: `CLAUDE.md`:
  - "Tema": substitui o texto do Material 3 pelo tema escuro (tokens da T6, `vidro`, azul com dois tons e o motivo do contraste);
  - "Barra inferior": flutuante, de vidro;
  - remove a frase "cores exatas nos prints de docs/design".
- Modificar: `docs/TELAS.md` (nota no topo: os prints de `docs/design/` continuam sendo a referência de conteúdo e fluxo; o visual segue a spec do redesign)
- Modificar: `docs/superpowers/specs/2026-10-17-redesign-mapa-vetorial-design.md` (status: implementado; JS gzip antes e depois)

- [ ] **Passo 1:** `npm run build` e anotar o tamanho em gzip.
- [ ] **Passo 2:** `npm run prints` final; mandar os PNGs ao Victor.
- [ ] **Passo 3: checkpoint final.** Avisar o Victor que está pronto para ele testar e decidir o commit.
