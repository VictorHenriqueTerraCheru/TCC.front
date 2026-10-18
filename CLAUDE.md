# CLAUDE.md — Front web de Ocorrências Urbanas (TCC)

Aplicação web em **React + TypeScript** do TCC "Sistema colaborativo de registro e validação de ocorrências urbanas" (Gustavo Brandão e Victor Henrique Terra Cherú — Unilasalle-RJ). É **mobile-first e responsiva**: no celular segue o protótipo; no computador, o mapa ocupa a tela e os detalhes viram um painel lateral. Consome a API .NET do repositório `TCC.back` (`../TCC.back`), **já implementada** (etapas 0–7 e a refatoração para o padrão MedComite.Core, tudo na `main`).

**O front não calcula confiança, não decide ciclo de vida e não geocodifica.** Isso é da API. O front exibe, coleta votos e envia a posição do navegador.

## Documentos deste repo (leia antes de codar)

- `docs/API.md` — contrato HTTP (normativo; idêntico ao do repo da API, incluindo limites de validação e regras de borda)
- `docs/openapi.json` — snapshot do OpenAPI da API (fonte dos tipos gerados; atualize com `npm run gen:api` quando a API mudar)
- `docs/TELAS.md` — as 29 telas do protótipo + a variação desktop, com rota, dados e comportamento
- `docs/PLAN.md` — plano por etapas com critérios de aceite
- `docs/design/*.jpg` — prints do protótipo feito no Claude Design. **São a referência de conteúdo e fluxo de cada tela (textos, campos, ordem).** O visual segue o redesign (`docs/superpowers/specs/2026-10-17-redesign-mapa-vetorial-design.md`), não o Material 3 dos prints.

Se a implementação exigir mudar o contrato da API, **pare e pergunte**.

## Stack

- **Vite 8 + React 19 + TypeScript 5.9** (`strict: true`, `noUncheckedIndexedAccess: true`). TS fica na 5.9 enquanto typescript-eslint e openapi-typescript não aceitarem a 6/7.
- Rotas: **React Router** (`createBrowserRouter`)
- Estado do servidor: **TanStack Query**. Estado do cliente: **Zustand** (sessão; rascunho do fluxo de registro com `persist` em `sessionStorage`)
- Cliente HTTP tipado: **openapi-typescript** (gera `src/infrastructure/api/schema.d.ts` a partir de `docs/openapi.json` ou da API rodando em `http://localhost:5080/openapi/v1.json`) + **openapi-fetch**, com middleware de JWT e conversão do ProblemDetails em `ApiError { type, status, title, errors }`. Não escreva tipos da API à mão: os schemas têm nomes estáveis (`ObterDetalheProblemaResponse`, `PaginadoListarProblemasRecentesItem`, `RegistrarProblemaRequest`…), enums como uniões de string e campos anuláveis como `T | null`.
- Formulários: **React Hook Form + Zod**
- UI: **Tailwind CSS v4** + **shadcn/ui** (Radix). Folha inferior no mobile: **vaul** (Drawer com _snap points_). Painel lateral no desktop: `Sheet` do shadcn ou um painel fixo.
- Ícones: **Material Symbols Rounded** (pacote `material-symbols`), os mesmos do protótipo. Fonte: Inter (`@fontsource-variable/inter`).
- Mapa: **MapLibre GL** (`maplibre-gl`) + **`@vis.gl/react-maplibre`** (o react-map-gl só para MapLibre), mapa vetorial com tiles do **OpenFreeMap** (gratuito, sem chave, dados do OpenStreetMap) e atribuição visível. Estilos versionados em `src/assets/mapa/estilo-claro.json` e `estilo-escuro.json` (`npm run gen:estilo-mapa`); o `MapaVetorial` troca conforme o tema. Mapa de calor: camada `heatmap` nativa. Marcadores: `<Marker>` com o componente React como filho.
- Datas: **date-fns** com `ptBR` ("há 2 dias", "ontem, 19:40")
- Testes: **Vitest + Testing Library + MSW**. Os handlers do MSW também servem de **API falsa** (`VITE_USE_MOCKS=true`) para trabalhar sem o back e para fixtures que imitam os prints; o desenvolvimento normal é contra a API real.
- Prints para o TCC: **Playwright** (só o script de captura; não é suíte de testes)
- Qualidade: ESLint (typescript-eslint, react-hooks) + Prettier

Antes de adicionar um pacote, confira a versão atual e a compatibilidade (ex.: @vis.gl/react-maplibre × React 19 e maplibre-gl) no npm; não fixe versões de memória.

## Arquitetura: vertical slice por feature (espelha o `TCC.back`)

Base: _bulletproof-react_, com os nomes alinhados às pastas do back para quem conhece um reconhecer o outro.

```
src/
  main.tsx                # composição (≈ Program.cs): registra a autenticação no cliente HTTP, liga o MSW, renderiza
  index.css               # Tailwind v4 + tokens do tema (amostrados de docs/design)
  app/                    # router (rotas de docs/TELAS.md), providers, layouts Mobile/Desktop
  infrastructure/         # ≈ Infrastructure/ do back
    api/                  # schema.d.ts (gerado), client.ts (openapi-fetch + JWT + dados()), api-error.ts, autenticacao.ts
    query/                # QueryClient
    mocks/                # MSW: handlers/<area>.ts (um por module do back) + fixtures/ (Botafogo/Niterói)
    env.ts
  common/                 # ≈ Common/ do back: ui/ (shadcn), components/ (Icone, Pagina…), hooks/, lib/
  features/<area>/        # ≈ Feature/<Area>/ do back
    api/                  # ≈ Services/: um hook TanStack Query por endpoint (use-categorias.ts → GET /categorias)
    models/               # ≈ Models/: aliases dos schemas gerados (Schema<'...'>) + tipos/constantes de UI
    validators/           # ≈ Validators/: schemas Zod dos formulários
    errors.ts             # ≈ Errors/: type da API → mensagem em português
    components/           # UI só desta feature
    pages/                # ≈ Modules/: entrada de rota (a borda da feature)
    hooks/                # hooks de UI que não chamam a API (ex.: filtros do mapa na URL)
    lib/                  # utilitários internos da feature (ex.: integração com uma biblioteca externa)
    stores/               # Zustand, quando houver
    index.ts              # API pública da feature (o que outras features e o app podem usar)
  test/                   # setup do Vitest (MSW, matchMedia) e helpers de render
```

Features (mesmas áreas do back, mais as de tela): `auth`, `usuarios` (dados de `/me` e do histórico), `categorias`, `problemas` (marcadores, detalhe, votos, recentes), `incidentes`, `registro`, `verificacao` (pedido e cartão do perfil; depende de `usuarios`), `admin` (fila; depende de `verificacao`), `geocodificacao`, `localizacao`, `aparencia` (escolha do tema na primeira abertura e o seletor de Configurações), e as de tela `mapa` (compõe problemas + incidentes, dona de `/mapa/*`) e `perfil` (compõe usuarios + verificacao: perfil, histórico, configurações).

Votos ficam em `problemas/` (são `/problemas/{id}/votos/*` e mexem no cache do detalhe): uma feature `votos` separada criaria dependência circular com `problemas`. Quando duas features precisariam uma da outra, quem compõe é a de tela (`mapa`) ou o `app/`.

Fluxo: **page** (borda) → **hook de `api/`** (o "service" do front) → cliente tipado `api` → API. O hook usa `api.GET('/rota', …).then(dados)`: `dados()` devolve o corpo ou lança `ApiError`; para respostas 204, `.then(semConteudo)`.

Componentes de layout compartilhados (`common/components/`): `MapaVetorial` (MapLibre com o estilo M2 e a atribuição), `CampoTexto`/`CampoSenha`, `TelaComVoltar`, `Pagina` (páginas sem mapa), `PainelResponsivo` (detalhe/área sobre o mapa: vaul não modal no celular, painel de 420 px de vidro no desktop; com `alturaResumo` a folha abre só no card rápido — estágios `[Npx, 0.85]` com a folha em `h-dvh`, porque o vaul calcula px supondo a altura da tela — e o foco do teclado abaixo da borda a expande) e `FolhaResponsiva` (folhas modais como "Entre para votar": Drawer no celular, Dialog no desktop). A folha "Entre para…" é única, montada no `RaizLayout` e aberta por `useExigirConta()` da feature `auth`.

### Guarda e ação pendente (regras 1 e 13)

`exigirConta(motivo, acao, { pendente, retorno })` executa `acao` se há sessão; senão guarda `{ retorno, acao: pendente }` em `sessionStorage` (`ocorrencias.pendencia`) e abre a folha. Login/cadastro chamam `concluirLogin()` e navegam para `retorno`; **a tela de destino executa a ação** com `useConsumirAcaoPendente()` (ex.: `problemas/hooks/use-votos.ts`), porque só ela sabe como. "Agora não" e "← Voltar" no login descartam a pendência. Num `401`, o middleware limpa a sessão e marca `expirou`; o `onError` da chamada passa de novo pela guarda, que agora vê o visitante e guarda a ação. Ao entrar/sair, `useSincronizarCacheComSessao` invalida o cache do TanStack Query (meusVotos, souAutor, /me).

Layouts de rota: `RaizLayout` (monitor de localização, redirecionamento da pré-permissão, sincronização do cache, folha da guarda) → `AppLayout` (com navegação) ou `TelaCheiaLayout` (login, cadastro, pré-permissão; cartão centralizado no desktop).

Fronteiras (o ESLint barra com `no-restricted-imports`):

- uma feature (e o `app/`) só importa outra feature pelo `index.ts` dela: `@/features/categorias`, nunca `@/features/categorias/models/...`;
- dentro da própria feature, use imports relativos (`../api/use-x`);
- `common/` e `infrastructure/` não importam `features/` nem `app/`. Quando a infraestrutura precisa de algo de uma feature (ex.: o token da sessão), ela expõe um ponto de registro (`registrarAutenticacao`) e o `main.tsx` liga as duas, como a injeção de dependência do back.

Nomes de arquivo em kebab-case (`categoria-icone.tsx`); componentes e hooks em português quando são do domínio (`CategoriaIcone`, `useCategorias`).

### Fluxo de registro

- Rotas `/registrar/*` sob `RegistroLayout` (exige conta; visitante vai ao login e volta). Cada passo usa `PassoRegistro`: no celular é tela cheia (a barra inferior some) com o mapa em cima nos passos de local; no desktop, painel de 420 px + mapa à direita.
- O rascunho (`useRascunhoStore`, `sessionStorage`) é a fonte de verdade de categoria, local, descrição e horário. Ele **só é limpo na tela de sucesso** (ou no X do passo 1): limpar antes de navegar faz a guarda de passo (`useExigirPasso`) da página ainda montada redirecionar para trás.
- O centro do mapa é o local; o endereço é consultado com o valor estabilizado por 600 ms (`useEnderecoDoRascunho`).
- `GET /problemas/duplicatas` não traz coordenadas: a conferência pega o ponto do vizinho em `GET /problemas/{id}`.
- Envio: `useEnvio` → rede/timeout (20 s) abre a tela 26; `401` passa pela guarda; erro de regra vira mensagem. O QueryClient usa `networkMode: 'always'`: no modo padrão, offline, o TanStack Query **pausa** a mutação em vez de falhar, e a tela 26 nunca apareceria.

### Mapa (MapLibre)

- O app usa `[lat, lng]` (`CENTRO_PADRAO`, `Ponto`). A conversão para `[lng, lat]` do MapLibre fica só no `MapaVetorial` e nos helpers de GeoJSON de `common/lib/geo.ts` (`circuloGeoJson`: o MapLibre não tem círculo em metros; `linhaGeoJson`).
- Estilos: `scripts/gen-estilo-mapa.mjs` baixa do OpenFreeMap o `fiord` (escuro, receita M2: cores com luminosidade × 0,66 e saturação × 0,9) e o `liberty` (claro, estilo Apple Maps: vias com saturação × 0,7 e bordas quase brancas) e aplica `scripts/estilo-mapa.mjs` (sem prédios nem POIs, vias × 1,7). Os JSONs gerados ficam no repo; tiles, glyphs e sprite vêm do OpenFreeMap. Cores desenhadas sobre o mapa por paint do MapLibre não aceitam variável CSS: dependem de `useTema()` (ex.: `COR_TRACEJADO`).
- O worker do MapLibre é apontado no `main.tsx` (`setWorkerUrl` + `?url`): o MapLibre o acha com `new URL(variável, import.meta.url)`, que o Vite não resolve.
- Clique no marcador: `e.originalEvent.stopPropagation()` no `onClick` do `<Marker>`, senão o `click` do mapa também dispara e abre a área de incidentes (regra 7).
- A página do mapa usa `isolate`: os controles sobre o mapa (`z-[1000]`) ficam presos nela e não cobrem `Dialog`/Drawer (`z-50`).
- Testes: o jsdom não tem WebGL. O `src/test/setup.ts` troca `@vis.gl/react-maplibre` por `src/test/maplibre-falso.tsx`, que imita `<Map>` (ref, `useMap`, eventos), `<Marker>`, `<Source>` (`data-testid="fonte-{id}"`) e `<Layer>` (`camada-{id}`). Os testes mexem no mapa com `mapaFalso.tocar()` e `mapaFalso.mover()`. A renderização real é conferida no `npm run prints`.

### CSS dos ícones

A fonte é um **subset** com só os ícones usados (~12 KB; a do pacote tem ~5 MB): `npm run gen:icones` varre os literais de string de `src/`, pede o subset ao Google Fonts (`icon_names`) e grava `src/assets/material-symbols/` (woff2 + `icones.json`), que vai no repo; o app não depende do Google em tempo de execução. **Ao usar um ícone novo, rode `npm run gen:icones`** — o teste `scripts/icones.test.mjs` falha se faltar algum (sem ele, o ícone aparece como texto). O pacote `material-symbols` continua como fonte do tipo `MaterialSymbol` e da lista de nomes.

`src/assets/material-symbols/rounded.css` é importado com `layer(base)` em `src/index.css`. Fora de layer, o `font-size: 24px` vence qualquer utilitário do Tailwind (`text-[18px]` não teria efeito).

### Barra inferior (celular)

Barra de abas **flutuante de vidro** (`MobileLayout`): passa por cima do mapa; nas outras páginas o `main` ganha `pb-24` para o conteúdo terminar acima dela. Os controles do mapa ficam acima dela (Registrar em `bottom-[92px]`, GPS/legenda em `bottom-[168px]`). Some no fluxo de registro e nas subpáginas com "←" (`/perfil/*`, `/admin/*`), como nos prints 5–8, 11, 13, 28 e 29.

### shadcn

`npx shadcn add <componente>` gera `import { cn } from "cn"` e ícones do lucide: troque por `@/common/lib/utils` e `<Icone>` (Material Symbols), e traduza os textos ("Close" → "Fechar").

### Tipos gerados

`npm run gen:api` roda `scripts/gen-api.mjs`, que ajusta o OpenAPI antes de gerar (o contrato não muda):

- tira o prefixo `/api/v1` dos paths (já está em `VITE_API_URL`), então as chamadas ficam iguais às do `docs/API.md`;
- datas: o conversor de `DateTimeOffset` da API faz o OpenAPI emitir só `{ format: date-time }`, sem `type` nem nulidade. O script as transforma em `string`; as anuláveis (`DateTimeOffset?` no back) ficam em `DATAS_ANULAVEIS` — **atualize a lista se surgir uma data anulável nova**.

## Regras

1. **Visitante vê, conta age.** Registrar ou votar sem token abre a folha "Entre para registrar/votar" (telas 14 e 27); após login ou cadastro, a ação pendente é retomada e o usuário volta para onde estava.
2. **Localização é opcional e exige HTTPS.** Sem permissão, tudo funciona; os votos vão sem `lat/lng` e a interface mostra os avisos das telas 18 e 19. O navegador **não** reabre o pedido depois de negado: nesse caso, "Ativar" abre a ajuda "Como liberar a localização no navegador" (cadeado na barra de endereço → Permissões → Localização). Em dev, `localhost` conta como contexto seguro.
3. **Distância "você está a X m"** é calculada no front (haversine) com a última posição conhecida.
4. **Endereços vêm da API** (`GET /geocodificacao/reversa`). Nunca chame o Nominatim direto do navegador. No passo "Onde fica?", consulte com _debounce_ de ~600 ms quando o mapa parar de mover.
5. **Falha de envio não perde dados** (tela 26): o rascunho do registro vive no store persistido; o diálogo oferece "Tentar novamente".
6. **Marcadores**: Alta = cheio, opaco, com sombra; Média = intermediário; Baixa = menor e translúcido; `nova` = selo "Nova"; `possivelmenteResolvida` = contorno tracejado com selo de check (tela 24). `resolvida` nunca aparece no mapa.
7. **Incidentes não têm marcador nem votos.** No modo Incidentes ou Ambos, um toque no mapa fora de marcadores consulta `GET /incidentes/area` naquele ponto e abre o resumo (tela 4) se houver ao menos um incidente no raio.
8. **Responsivo** com um único breakpoint principal, `lg` (≥ 1024 px): abaixo, barra inferior Mapa / Recentes / Perfil + folhas inferiores (vaul) + FAB "Registrar"; acima, trilho de navegação à esquerda, mapa em tela cheia e painel lateral de 420 px para detalhe, área e fluxo de registro. Recentes e Perfil no desktop são páginas centralizadas (`max-w-3xl`). Use um componente `PainelResponsivo` que renderiza Drawer ou painel conforme a largura; não duplique telas.
9. Recarregue os marcadores ao mover o mapa (`moveend`) com _debounce_ de ~400 ms, enviando o bbox visível; use a chave do bbox arredondado no TanStack Query.
10. Textos da interface em **português do Brasil**, iguais aos do protótipo. Identificadores do domínio em português sem acento (`Problema`, `votarExistencia`); termos técnicos do React em inglês.
11. Token JWT em `localStorage` (aceitável no escopo do TCC; registrado como limitação). Nunca logue token nem posição.
12. Acessibilidade básica: botões com `aria-label`, foco visível, Drawer/Dialog do Radix (foco preso), contraste AA.
13. **Sessão expirada:** o JWT vale 7 dias e não há refresh. `401` numa chamada autenticada → limpa a sessão, guarda a ação pendente e abre o login (mesma guarda da regra 1).
14. **Perfil atual vem de `GET /me`**, não da claim do token (que fica com o perfil do momento do login). Use `GET /me` para "Perfil verificado", item de admin etc.; após uma aprovação, invalide a query de `/me`.
15. **Limite o retângulo do mapa** antes de chamar `GET /problemas` e `GET /incidentes/calor`: `lat` em [−90, 90], `lng` em [−180, 180] e `min < max`. O `getBounds()` do mapa passa de ±180 ao afastar o zoom; a API responde `400` nesse caso.
16. **Horário do incidente:** a API recusa `ocorridoEm` no futuro, sem tolerância. "Agora" envia o instante atual menos 1 minuto; "Outro horário" vai até 23 h 45 atrás (não 24 h, porque a janela anda enquanto o usuário preenche).
17. **Geocodificação com `429 limite-requisicoes`** (30/min por IP): trate como endereço indisponível (mostre o fallback e permita continuar), nunca como erro bloqueante.

## Tema

**Claro, escuro ou automático** (segue o `prefers-color-scheme` do celular/computador, inclusive a troca por horário do iPhone). Na primeira abertura do mapa, `/aparencia` pede a escolha (Automático vem marcado), antes da pré-permissão de localização; depois, Configurações > Aparência. A preferência fica em `useTemaStore` (`common/hooks/use-tema.ts`, `localStorage` `ocorrencias.tema`); `useAplicarTema` (no `RaizLayout`) põe `data-tema` no `<html>` e a cor da barra (`meta theme-color`); um script no `index.html` faz o mesmo antes da primeira pintura, para não piscar. Nos testes, o `setup.ts` marca o tema como já escolhido.

Tokens em `src/index.css`: o claro no `:root`, o escuro em `:root[data-tema='escuro']` (só sobrescreve), + `@theme inline`. O teste `scripts/contraste.test.mjs` garante contraste AA nos pares principais dos dois temas, incluindo o rótulo de cada categoria sobre o cartão.

- Claro (estilo Apple Maps): fundo `#f2f2f7`, cartões brancos, texto `#111827`, secundário `#5c6878`, azul de texto `#0b67c6`, vidro branco `rgba(255,255,255,.74)`; categorias mais fechadas (via `#c24e00`, elétrica `#946300`, limpeza `#8b5a2b`, segurança `#d70015`, trânsito `#c2380f`) para o rótulo passar no AA.

Escuro:

- Fundo `#121a24`, cartões `--card`/`--superficie-1` `#1a2431`, `--superficie-2` `#223041`, texto `#eef3fa`, secundário `#9fb0c3`.
- **Azul em dois tons:** `--primario` `#3b9eff` para texto, ícones, aba ativa, barra de confiança e chaves (`text-primario`, `bg-primario-suave`); `--primary`/`--primario-cheio` `#1f74db` só como **fundo** de botão cheio com texto branco. O `#3b9eff` com texto branco daria 2,8:1, e o `#1f74db` como texto fica abaixo de 4,5:1 — por isso nunca use `text-primary`.
- **Vidro** só sobre o mapa: utilitário `vidro` (`rgba(26,34,46,.62)` + `blur(20px) saturate(180%)` + borda `--vidro-borda`). Telas sem mapa usam cartões sólidos (`bg-card`, raio 20 px).
- Categorias vivas para o fundo escuro: via `#ff7a1a`, elétrica `#f5b800`, limpeza `#c08552`, segurança `#ff4d42`, trânsito `#ff5e3a`; a versão `-claro` é a mesma cor com alfa ~0,18.
- Alertas em balão estilo Waze (`MarcadorProblema`): alta 38 px e pulsa (`.pulso-alerta`, desligado com `prefers-reduced-motion`), média 31, baixa 25 e translúcida; selo "Nova" e check de "possivelmente resolvida" em `--primario-cheio`.
- Calor: roxo `#5b2bff` → magenta `#c026d3` → vermelho `#ff3b30` → amarelo `#ffd60a` (`gradienteCalor`, usado no heatmap e na legenda).
- Controles nativos do MapLibre (zoom, atribuição) estilizados em vidro no `index.css`.

## API local (repo `../TCC.back`)

```bash
cd ../TCC.back
docker compose up -d db                    # PostGIS
dotnet run --project src/Ocorrencias.Api   # http://localhost:5080 (Scalar em /scalar); aplica migrations e o seed
```

Usuários do seed (senha `tcc12345`): `admin@tcc.local` (administrador), `verificado@tcc.local`, `cidadao1@tcc.local`, `cidadao2@tcc.local`, `cidadao3@tcc.local`. A API já libera CORS para `http://localhost:5173`.

**Use o proxy do Vite em dev:** `server.proxy` com `'/api' → 'http://localhost:5080'` e `VITE_API_URL=/api/v1`. Assim front e API ficam na mesma origem (sem CORS) e o teste no celular por túnel HTTPS precisa expor só a porta do Vite: o celular não alcança `localhost:5080`. Em produção, `VITE_API_URL` aponta para a URL pública da API.

## Comandos

```bash
npm install
npm run gen:api            # docs/openapi.json → src/infrastructure/api/schema.d.ts
npm run gen:api:live       # idem, a partir da API rodando em :5080
npm run dev                # http://localhost:5173  (VITE_API_URL=/api/v1, proxy para :5080)
VITE_USE_MOCKS=true npm run dev   # sem API, com MSW
npm test                   # Vitest
npm run build && npm run preview
npm run gen:icones         # subset da fonte de ícones (rode ao usar um ícone novo)
npm run gen:estilo-mapa    # estilos claro (liberty) e escuro (fiord, M2) do mapa a partir do OpenFreeMap
npm run prints             # Playwright: capturas mobile (390×844) e desktop (1440×900) para o TCC
npm run e2e                # Playwright: roteiro de usuário contra a API real e o banco (front e API rodando)
```

`npm run e2e` (`scripts/e2e.mjs`) usa o app no Chrome como um usuário — visitante, cadastro pela folha "Entre para votar" com o voto retomado, registro de problema (com a falha offline da tela 26) e de incidente, área de incidentes, perfil, edição do nome, pedido de verificação aprovado pelo admin, voto de outro cidadão, recentes, bússola, token inválido, sair e o painel do desktop — e confere cada escrita no PostgreSQL (`docker exec tccback-db-1 psql`). Cria dados reais no banco local (uma conta `e2e-<horário>@tcc.local` por execução). `E2E_VISIVEL=1` abre o navegador na tela para acompanhar.

`npm run prints` (`scripts/prints.mjs`) sobe sozinho um Vite com a API falsa (MSW, porta 5199) e grava em `prints/` (fora do git): as fixtures imitam os prints do protótipo e não dependem do banco local. Para o ambiente publicado: `PRINTS_URL=https://… PRINTS_API=<VITE_API_URL> npm run prints` (usa os usuários do seed; a fila do admin só aparece cheia se houver pedidos pendentes). Usa o Google Chrome instalado (`PRINTS_NAVEGADOR=chromium` depois de `npx playwright install chromium`). No modo com mocks, chamadas feitas pelo script só funcionam depois de o app renderizar: antes disso o MSW não subiu e o fetch cai no proxy (API real).

Deploy (Railway): `Dockerfile` na raiz compila com Node e serve o `dist/` com o Caddy (`Caddyfile`: porta `$PORT` ou 8080, _fallback_ de SPA para `index.html`, cache longo em `/assets/*`). O HTTPS fica com o Railway. `VITE_API_URL` (URL pública da API + `/api/v1`) é **argumento de build**: o Vite grava o valor no JavaScript, então mudar a variável exige novo deploy. O domínio do front precisa estar em `Cors__Origens__0` da API. Teste local: `docker build -t ocorrencias-front --build-arg VITE_API_URL=http://localhost:5080/api/v1 .` e `docker run --rm -p 8081:8080 ocorrencias-front`.

PWA: `public/manifest.webmanifest` + ícones (`icon-192/512`, `icon-maskable-512`, `apple-touch-icon`) para "Adicionar à tela inicial"; sem service worker (offline fora do escopo).

Para testar a localização no celular durante o desenvolvimento é preciso HTTPS: use o deploy no Railway ou um túnel HTTPS para o `npm run dev` (com o proxy do Vite, o túnel cobre também a API). Se o túnel usar outro host, adicione-o em `server.allowedHosts` do Vite.
