# Redesign visual: mapa vetorial escuro, interface de vidro e alertas estilo Waze

Data: 2026-10-17 · Branch: `victor/refact` (front) · Status: implementado (plano `docs/superpowers/plans/2026-10-17-redesign-mapa-vetorial.md`)

## Intenção

O app funciona, mas parece "Android antigo": segue à risca o Material 3 do protótipo do Claude Design e usa os tiles raster padrão do OpenStreetMap, cheios de detalhe e de cor misturada. O Victor quer um app de mapa **bonito e moderno**: **elegante como o Apple Maps**, com os **alertas da comunidade como no Waze**, que é a referência mais próxima do domínio, porque o Waze também mostra relatos dos usuários no mapa.

Sucesso: ao abrir o app, a primeira impressão é de um produto atual, e os alertas são a coisa mais visível da tela.

## Decidido com o Victor

Mockups em `.superpowers/brainstorm/` (fora do git), sequência: direção visual → cinza-azulado → sem prédios → meio-termo.

1. **Mapa vetorial** com MapLibre GL no lugar do Leaflet. Tiles do **OpenFreeMap** (gratuito, sem chave, dados do OpenStreetMap).
2. **Estilo do mapa "M2 · Equilíbrio":**
   - parte do estilo `fiord` do OpenFreeMap;
   - cada cor das camadas passa a ter **luminosidade × 0,66** e **saturação × 0,9**, mantendo o matiz (cinza-azulado escuro);
   - **sem prédios** e sem pontos de interesse: saem as camadas cujo id casa com `building|poi|housenumber|aeroway`;
   - **ruas mais grossas**: `line-width` × 1,7 nas camadas de via (`highway|road|tunnel|bridge|transportation`), como no Waze.
   - A receita está em `meio-termo.html`, nas funções `escurecer` e `waze`.
3. **Alertas (problemas) em balão estilo Waze:**
   - círculo na cor da categoria, ícone branco, borda branca de 2,5 px, ponta embaixo e sombra;
   - tamanho por faixa de confiança (alta 38 px, média 31 px, baixa 25 px e translúcida);
   - selo "Nova", contorno tracejado para `possivelmenteResolvida`;
   - **pulso suave** nos de faixa alta.
   - A regra 6 continua valendo, só muda a forma.
4. **Incidentes em mapa de calor nativo** do MapLibre (camada `heatmap`), com gradiente transparente → roxo `#5b2bff` → magenta `#c026d3` → vermelho `#ff3b30` → amarelo `#ffd60a`.
5. **Interface de vidro escuro com leve tom azul**, sobre o mapa:
   - material: `rgba(26,34,46,.62)`, `backdrop-filter: blur(20px) saturate(180%)`, borda `rgba(160,190,230,.12)` e texto `#eef3fa`;
   - onde vale: seletor Problemas | Incidentes | Ambos, chips, botões de localização e de legenda, barra de abas flutuante (celular) e "Registrar" em pílula acima da barra.
6. **Tocar num alerta** abre primeiro um card de vidro com categoria, endereço, tempo, confirmações e distância, e 👍/👎 rápidos. O detalhe completo continua existindo.
7. **Escopo:** o app inteiro sai do visual Material 3 (botões, folhas, chips, tipografia), não só o mapa.
8. **Só tema escuro:** sem modo claro e sem seguir a configuração do sistema.
9. **Cor principal azul** (mockup `cor-principal.html`, opção A). Ela vai em "Registrar", aba ativa, modo selecionado, botões de mapa, botões cheios, barra de confiança, chaves e links. A cor do mockup é mantida no que é texto ou ícone sobre o fundo escuro; nos botões cheios com texto branco, o azul fica um pouco mais fundo para passar no contraste AA *(minha decisão)*:
   - `--primario: #3b9eff`: texto, ícones, aba ativa, barra de confiança, chave e brilho dos botões (6,3:1 sobre `#121a24`);
   - `--primario-cheio: #1f74db`: fundo dos botões cheios com texto branco (4,6:1). O `#3b9eff` com texto branco daria 2,8:1;
   - `--primario-suave: rgba(59,158,255,.18)`: fundo dos botões secundários e do modo selecionado.
10. **Não muda:** regras do `CLAUDE.md`, contrato da API, rotas, telas e fluxos, textos da interface.

## Objetivos

- Trocar Leaflet + leaflet.heat por MapLibre em todos os mapas: principal, área de incidentes, os quatro modos do mapa do registro (pino, área, conferência, estático) e marcador do usuário.
- Aplicar o estilo M2 de forma reprodutível e versionada.
- Novo sistema visual (tokens, componentes) aplicado a todas as telas de `docs/TELAS.md`, no celular e no desktop.
- Manter os testes do Vitest úteis mesmo sem WebGL no jsdom.

## Não objetivos

- Modo claro. **O app é só escuro** (decisão do Victor): um único tema e um único estilo de mapa, sem seguir a configuração do sistema.
- Prédios 3D, agrupamento (cluster) de marcadores, rotas e navegação.
- Hospedar os próprios tiles; funcionar offline.
- Mudar regras, endpoints ou textos.

## Anti-objetivos (falha mesmo que "funcione")

- Os alertas perderem destaque para o mapa ou para a interface. Por exemplo: vias em âmbar competindo com o laranja de "Via pública", que foi o problema do mockup C2+.
- Ficar com cara de "template dark genérico": tudo cinza, sem hierarquia, contraste ruim.
- Ficar visivelmente mais lento num celular intermediário: travar ao arrastar ou abrir em segundos a mais.
- Perder acessibilidade: contraste AA no vidro, foco visível, `aria-label`, foco preso nas folhas.
- Quebrar regras do produto: 1 (guarda), 2 (localização opcional), 6 (marcadores), 7 (toque na área), 9 (bbox com debounce), 15 (limite do retângulo).

## Restrições

- Stack atual: Vite 8, React 19, TS 5.9 strict, Tailwind 4, shadcn/Radix, vaul. Arquitetura vertical slice com as fronteiras do ESLint, conforme `CLAUDE.md`.
- **Sem orçamento:** só serviços gratuitos sem chave. O OpenFreeMap exige atribuição: "© OpenFreeMap © OpenStreetMap" visível.
- O jsdom não tem WebGL: o MapLibre não renderiza no Vitest.
- O Playwright (`npm run prints`) roda no Chrome de verdade, com WebGL, e precisa continuar funcionando.
- A regra 15 continua: o `getBounds()` do MapLibre também passa de ±180 com zoom afastado.
- Antes de adicionar pacote, conferir versão e compatibilidade com React 19 (regra do `CLAUDE.md`).

## Como fica (decisões técnicas, minhas)

**Biblioteca:** `maplibre-gl` + `react-map-gl` (entrada `react-map-gl/maplibre`), que é declarativo como o react-leaflet: `<Map>`, `<Marker>`, `<Source>`/`<Layer>` e `useMap()`. Saem `leaflet`, `react-leaflet`, `leaflet.heat` e os `@types`.

**Estilo versionado:** `scripts/gen-estilo-mapa.mjs` (`npm run gen:estilo-mapa`) baixa o `fiord`, aplica a receita M2 e grava `src/assets/mapa/estilo.json` no repo, no mesmo modelo do `gen:icones`. Tiles, glyphs e sprites continuam vindo do OpenFreeMap. Assim o visual não muda sozinho se o OpenFreeMap mexer no `fiord`, e a receita fica revisável.

**Componentes:**
- `common/components/mapa-osm.tsx` vira `mapa-vetorial.tsx` (`MapaVetorial`): `<Map>` com o estilo, atribuição compacta, `minZoom` 3, girar e inclinar ligados. O 3D fica desligado porque o estilo não tem prédios.
- `MapaBase` mantém o `moveend` com debounce de 400 ms e `retanguloDaApi` (regras 9 e 15).
- `CamadaProblemas` passa a usar `<Marker>` do react-map-gl com o balão como componente React. O `L.divIcon` + `renderToStaticMarkup` + cache por (categoria, status, faixa) deixa de existir. Os selecionados ficam por cima.
- `CamadaCalor` vira `<Source type="geojson">` + `<Layer type="heatmap">` alimentados por `GET /incidentes/calor`. O peso é `quantidade`; o raio e a intensidade são interpolados por zoom. Saem `leaflet-heat.ts` e `leaflet-global.ts`.
- `OuvinteToque` passa a usar o evento `click` do mapa, ignorando cliques em marcadores (regra 7).
- O `Circle` da área (400 m) e o raio do registro (150 m) viram polígono GeoJSON gerado por um helper em `common/lib`. Não entra dependência nova.
- `MapaRegistro`: pino fixo no centro (como hoje), área no centro, conferência com `line` tracejada + rótulo da distância, e estático.
- O `isolate` da página do mapa continua. O z-index dos controles é revisado (o canvas do MapLibre não usa os z-index do Leaflet).

**Card rápido do alerta** *(minha decisão)*:
- é o primeiro estágio do `PainelResponsivo` que já existe: o snap baixo do Drawer no celular e o topo do painel no desktop, não um componente paralelo;
- arrastar para cima ou tocar no card abre o detalhe completo;
- 👍/👎 votam o que o status pede, com a mesma guarda de conta e as mesmas regras do detalhe:
  - **existência** em `nova`;
  - **persistência** ("Ainda está lá?") em `ativa` e `possivelmenteResolvida`;
- o autor não vê 👍/👎 de existência;
- em `resolvida`, o card não tem votos.

**Testes:**
- Um mock do `react-map-gl/maplibre` no setup do Vitest renderiza `<Map>` como `<div data-testid="mapa">` com os filhos, e `<Marker>` como um `<div>` com o conteúdo. Ele expõe uma API mínima: `getBounds`, `getCenter`, `flyTo`, `on`/`off` e disparo de `moveend`/`click` para os testes.
- Os testes de fluxo existentes continuam valendo, ajustando só os seletores que dependiam de `.leaflet-container`.
- A renderização real é conferida no `npm run prints`.

**Desempenho:** o MapLibre pesa uns 230 KB gzip a mais que o Leaflet. Por ser a primeira tela, ele não é carregado sob demanda. O número fica medido no build e registrado.

**Sistema visual (app inteiro):**
- Tema escuro azulado único. Os tokens de `src/index.css` são reescritos:
  - fundo `#121a24`;
  - superfícies em camadas de vidro e de cor sólida;
  - texto `#eef3fa` e `#9fb0c3`;
  - bordas sutis.
- Cores de categoria **mais vivas para o fundo escuro**: laranja `#ff7a1a`, âmbar `#f5b800`, marrom `#c08552`, vermelho `#ff3b30` e laranja-avermelhado `#ff5e3a`. Cada uma ganha uma versão "clara", que é o fundo translúcido do ícone.
- Fonte **Inter**, no lugar da Roboto *(minha decisão)*.
- Cantos de 16 a 22 px, folhas com 28 px no topo, sombras suaves. Botões cheios em pílula.
- Folhas (vaul) e diálogos em vidro escuro.
- Telas sem mapa (Recentes, Perfil, Login/Cadastro, Configurações, Fila do admin) usam o mesmo tema, com cards em superfície sólida. O vidro só existe sobre o mapa, para manter a leitura fácil.
- Desktop: o trilho lateral vira uma barra de vidro, o painel de 420 px vira vidro escuro, e o mapa continua em tela cheia.

**Documentação:**
- `CLAUDE.md`: Leaflet → MapLibre, novo tema, `gen:estilo-mapa`.
- `docs/TELAS.md` registra que `docs/design/*.jpg` continua sendo a referência de **conteúdo e fluxo**, mas não mais do visual.

## Fica com quem for construir

- Composição exata de cada tela no novo tema, dentro das decisões acima e dos mockups.
- Ordem das etapas do plano, mantendo o app funcionando ao fim de cada uma. Sugestão: mapa vetorial primeiro, depois o tema, depois as telas.
- Detalhes da animação do pulso, da sombra e do desfoque, respeitando `prefers-reduced-motion`.
- Ajuste fino do raio e da intensidade do heatmap para os dados reais.

## Resultado

- JS inicial: 521,6 KB gzip (antes, com Leaflet: 328 KB; +194 KB do MapLibre). O worker do mapa (`maplibre-gl-worker-*.mjs`, 508 KB) carrega em paralelo. CSS 20,6 KB gzip.
- Zoom: o MapLibre usa tiles de 512 px, então todos os níveis caíram um em relação ao Leaflet (`ZOOM_PADRAO` 15) para manter a escala.
- Acessibilidade: axe-core sem violações em `/mapa`, `/recentes`, `/perfil` e `/login` (390 e 1440 px); contraste AA dos tokens testado em `scripts/contraste.test.mjs`.
