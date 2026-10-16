# CLAUDE.md — Front web de Ocorrências Urbanas (TCC)

Aplicação web em **React + TypeScript** do TCC "Sistema colaborativo de registro e validação de ocorrências urbanas" (Gustavo Brandão e Victor Henrique Terra Cherú — Unilasalle-RJ). É **mobile-first e responsiva**: no celular segue o protótipo; no computador, o mapa ocupa a tela e os detalhes viram um painel lateral. Consome a API .NET do repositório `TCC.back` (`../TCC.back`), **já implementada** (etapas 0–7; até o merge dos PRs, o código mais recente está na branch `etapa-7`).

**O front não calcula confiança, não decide ciclo de vida e não geocodifica.** Isso é da API. O front exibe, coleta votos e envia a posição do navegador.

## Documentos deste repo (leia antes de codar)

- `docs/API.md` — contrato HTTP (normativo; idêntico ao do repo da API, incluindo limites de validação e regras de borda)
- `docs/openapi.json` — snapshot do OpenAPI da API (fonte dos tipos gerados; atualize com `npm run gen:api` quando a API mudar)
- `docs/TELAS.md` — as 29 telas do protótipo + a variação desktop, com rota, dados e comportamento
- `docs/PLAN.md` — plano por etapas com critérios de aceite
- `docs/design/*.jpg` — prints do protótipo feito no Claude Design. **São a referência visual da versão mobile. Abra a imagem correspondente antes de implementar cada tela.**

Se a implementação exigir mudar o contrato da API, **pare e pergunte**.

## Stack

- **Vite 8 + React 19 + TypeScript 5.9** (`strict: true`, `noUncheckedIndexedAccess: true`). TS fica na 5.9 enquanto typescript-eslint e openapi-typescript não aceitarem a 6/7.
- Rotas: **React Router** (`createBrowserRouter`)
- Estado do servidor: **TanStack Query**. Estado do cliente: **Zustand** (sessão; rascunho do fluxo de registro com `persist` em `sessionStorage`)
- Cliente HTTP tipado: **openapi-typescript** (gera `src/infrastructure/api/schema.d.ts` a partir de `docs/openapi.json` ou da API rodando em `http://localhost:5080/openapi/v1.json`) + **openapi-fetch**, com middleware de JWT e conversão do ProblemDetails em `ApiError { type, status, title, errors }`. Não escreva tipos da API à mão: os schemas têm nomes estáveis (`ObterDetalheProblemaResponse`, `PaginadoListarProblemasRecentesItem`, `RegistrarProblemaRequest`…), enums como uniões de string e campos anuláveis como `T | null`.
- Formulários: **React Hook Form + Zod**
- UI: **Tailwind CSS v4** + **shadcn/ui** (Radix). Folha inferior no mobile: **vaul** (Drawer com _snap points_). Painel lateral no desktop: `Sheet` do shadcn ou um painel fixo.
- Ícones: **Material Symbols Rounded** (pacote `material-symbols`), os mesmos do protótipo. Fonte: Roboto.
- Mapa: **Leaflet + react-leaflet**, tiles do OpenStreetMap com atribuição visível. Mapa de calor: **leaflet.heat** envolvido num componente que usa `useMap()`. Marcadores: `L.divIcon` com HTML gerado a partir de um componente (`renderToStaticMarkup`).
- Datas: **date-fns** com `ptBR` ("há 2 dias", "ontem, 19:40")
- Testes: **Vitest + Testing Library + MSW**. Os handlers do MSW também servem de **API falsa** (`VITE_USE_MOCKS=true`) para trabalhar sem o back e para fixtures que imitam os prints; o desenvolvimento normal é contra a API real.
- Prints para o TCC: **Playwright** (só o script de captura; não é suíte de testes)
- Qualidade: ESLint (typescript-eslint, react-hooks) + Prettier

Antes de adicionar um pacote, confira a versão atual e a compatibilidade (ex.: react-leaflet × React 19) no npm; não fixe versões de memória.

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
    lib/                  # utilitários internos da feature (ex.: integração com plugin do Leaflet)
    stores/               # Zustand, quando houver
    index.ts              # API pública da feature (o que outras features e o app podem usar)
  test/                   # setup do Vitest (MSW, matchMedia) e helpers de render
```

Features (mesmas áreas do back, mais as de tela): `auth`, `usuarios` (perfil, histórico, configurações), `categorias`, `problemas` (marcadores, detalhe, votos, recentes), `incidentes`, `registro`, `verificacao`, `admin`, `geocodificacao`, `localizacao`, `mapa` (compõe problemas + incidentes e é dono das rotas `/mapa/*`).

Votos ficam em `problemas/` (são `/problemas/{id}/votos/*` e mexem no cache do detalhe): uma feature `votos` separada criaria dependência circular com `problemas`. Quando duas features precisariam uma da outra, quem compõe é a de tela (`mapa`) ou o `app/`.

Fluxo: **page** (borda) → **hook de `api/`** (o "service" do front) → cliente tipado `api` → API. O hook usa `api.GET('/rota', …).then(dados)`: `dados()` devolve o corpo ou lança `ApiError`; para respostas 204, `.then(semConteudo)`.

Componentes de layout compartilhados (`common/components/`): `Pagina` (páginas sem mapa), `PainelResponsivo` (detalhe/área sobre o mapa: vaul não modal no celular, painel de 420 px no desktop) e `FolhaResponsiva` (folhas modais como "Entre para votar": Drawer no celular, Dialog no desktop). A folha "Entre para…" é única, montada no `RaizLayout` e aberta por `useExigirConta()` da feature `auth`.

### Guarda e ação pendente (regras 1 e 13)

`exigirConta(motivo, acao, { pendente, retorno })` executa `acao` se há sessão; senão guarda `{ retorno, acao: pendente }` em `sessionStorage` (`ocorrencias.pendencia`) e abre a folha. Login/cadastro chamam `concluirLogin()` e navegam para `retorno`; **a tela de destino executa a ação** com `useConsumirAcaoPendente()` (ex.: `problemas/hooks/use-votos.ts`), porque só ela sabe como. "Agora não" e "← Voltar" no login descartam a pendência. Num `401`, o middleware limpa a sessão e marca `expirou`; o `onError` da chamada passa de novo pela guarda, que agora vê o visitante e guarda a ação. Ao entrar/sair, `useSincronizarCacheComSessao` invalida o cache do TanStack Query (meusVotos, souAutor, /me).

Layouts de rota: `RaizLayout` (monitor de localização, redirecionamento da pré-permissão, sincronização do cache, folha da guarda) → `AppLayout` (com navegação) ou `TelaCheiaLayout` (login, cadastro, pré-permissão; cartão centralizado no desktop).

Fronteiras (o ESLint barra com `no-restricted-imports`):

- uma feature (e o `app/`) só importa outra feature pelo `index.ts` dela: `@/features/categorias`, nunca `@/features/categorias/models/...`;
- dentro da própria feature, use imports relativos (`../api/use-x`);
- `common/` e `infrastructure/` não importam `features/` nem `app/`. Quando a infraestrutura precisa de algo de uma feature (ex.: o token da sessão), ela expõe um ponto de registro (`registrarAutenticacao`) e o `main.tsx` liga as duas, como a injeção de dependência do back.

Nomes de arquivo em kebab-case (`categoria-icone.tsx`); componentes e hooks em português quando são do domínio (`CategoriaIcone`, `useCategorias`).

### Mapa (Leaflet)

- A página do mapa usa `isolate`: os z-index do Leaflet (até 1000) ficam presos nela e não cobrem `Dialog`/Drawer, que usam `z-50`. Controles sobre o mapa usam `z-[1000]`.
- `leaflet.heat` procura `L` no escopo global: importe-o só por `features/incidentes/lib/leaflet-heat.ts`. A camada protege o `_redraw` (o plugin redesenha num `requestAnimationFrame` mesmo depois de removido) e usa `maxZoom: 12` (o plugin corta a intensidade pela metade a cada nível abaixo dele).
- Marcadores: `L.divIcon` com `renderToStaticMarkup(<MarcadorProblema/>)`, cacheado por (categoria, status, faixa); só estilos inline e tokens CSS (`var(--cat-*)`).

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
15. **Limite o retângulo do mapa** antes de chamar `GET /problemas` e `GET /incidentes/calor`: `lat` em [−90, 90], `lng` em [−180, 180] e `min < max`. O `getBounds()` do Leaflet passa de ±180 ao afastar o zoom; a API responde `400` nesse caso.
16. **Horário do incidente:** a API recusa `ocorridoEm` no futuro, sem tolerância. "Agora" envia o instante atual menos 1 minuto; "Outro horário" vai até 23 h 45 atrás (não 24 h, porque a janela anda enquanto o usuário preenche).
17. **Geocodificação com `429 limite-requisicoes`** (30/min por IP): trate como endereço indisponível (mostre o fallback e permita continuar), nunca como erro bloqueante.

## Tema

Inspirado no Material 3 do protótipo. Defina os tokens como CSS variables no tema do Tailwind e amostre as cores exatas nos prints de `docs/design/`:

- primário (botões cheios, barra de confiança): verde-escuro ≈ `#046D4E`; superfície clara esverdeada
- FAB "Registrar": verde-menta claro com ícone e texto escuros
- Categorias: Via pública = laranja-tijolo; Elétrica = oliva/amarelo; Limpeza = marrom; Segurança = vermelho; Trânsito = vermelho-alaranjado. Cada categoria tem uma cor forte (pino/ícone) e uma clara (fundo do ícone circular).
- Selo "Nova": azul-ardósia escuro com texto branco; chip "Possivelmente resolvida": azul-claro.
- Cantos bem arredondados (cards ~16 px, botões em pílula), como no protótipo.

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
npm run prints             # Playwright: capturas mobile (390×844) e desktop (1440×900) para o TCC
```

Para testar a localização no celular durante o desenvolvimento é preciso HTTPS: use o deploy de preview (Vercel/Netlify) ou um túnel HTTPS para o `npm run dev` (com o proxy do Vite, o túnel cobre também a API). Se o túnel usar outro host, adicione-o em `server.allowedHosts` do Vite.
