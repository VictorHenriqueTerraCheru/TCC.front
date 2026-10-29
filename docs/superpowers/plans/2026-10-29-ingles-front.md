# Front em inglês, sem comentários — plano de execução

Plano para um agente executar sozinho. Ele não depende de conversa anterior: tudo que você precisa está neste arquivo e na pasta `docs/superpowers/plans/2026-10-29-ingles-front/`. Leia o plano inteiro antes de começar. Leia também o `CLAUDE.md` da raiz, que descreve a arquitetura e as regras do projeto. Ele ficará desatualizado neste trabalho; você o atualiza na Task 7.

## 1. Contexto

- TCC "Sistema colaborativo de registro e validação de ocorrências urbanas". Este repo é o front: React 19 + TypeScript 5.9 + Vite 8, TanStack Query, Zustand, openapi-fetch/openapi-typescript, Tailwind v4, MapLibre, Vitest + Testing Library + MSW, Playwright (prints e e2e).
- A API (repo irmão `../TCC.back`) foi traduzida para o inglês no PR https://github.com/VictorHenriqueTerraCheru/TCC.back/pull/19 (branch `refactor/ingles`, ainda **não** mergeado). Rotas, campos JSON, valores de enum e `type` de erro mudaram. O contrato novo já está copiado em `docs/superpowers/plans/2026-10-29-ingles-front/contrato-novo/` (`openapi.json` e `API.md`, vindos do commit em `ORIGEM.txt`).
- **Objetivo:** os professores vão ler este código. Ele precisa ficar todo em inglês, sem comentários, fácil de navegar, falando o contrato novo, com a **tela idêntica** e os textos em português do Brasil.
- Este PR e o #19 do back vão para produção **juntos**, num horário combinado pelo dono do projeto. **Você não mergeia nada.**

## 2. Regras (todas valem em todas as tarefas)

1. **Nenhum texto visível muda.** JSX text, `aria-label`, `title`, `placeholder`, `alt`, toasts, mensagens de erro e qualquer string mostrada continuam exatamente iguais, em português.
2. **Dados continuam em português**, porque são valores que existem no banco de produção:
   - chaves de grupo: `viaPublica`, `eletrica`, `limpeza`, `seguranca`, `transito`, e qualquer chave criada em teste (ex.: `grupo123Obras`);
   - chaves de ícone: `buraco`, `calcada`, `poste`, `fio`, `descarte`, `lixo`, `roubo`, `acidente`, e os nomes Material Symbols, que já são inglês;
   - nomes de categoria e rótulos de grupo ("Buraco na via", "Via pública");
   - e-mails do seed: `admin@tcc.local`, `verificado@tcc.local`, `cidadao1@tcc.local`, `cidadao2@tcc.local`, `cidadao3@tcc.local`, senha `tcc12345`;
   - endereços e textos das fixtures do MSW.
3. **Tudo o resto que é código vai para inglês:** identificadores, nomes de arquivo e pasta, rotas de URL do app, chaves de `localStorage`/`sessionStorage`, nomes de query param do app, tokens CSS (`--primario`), classes utilitárias próprias (`vidro`), `@keyframes`, atributos `data-*` próprios, nomes de teste (`it('...')`/`test('...')`) e logs de script.
4. **Sem comentários** em `src/`, `scripts/`, CSS e arquivos de config (`*.config.*`, `eslint.config.js`). Ficam só as diretivas que fazem algo: `eslint-disable*`, `@ts-expect-error`, `@ts-ignore` (se houver), `/// <reference ...>` e `@vite-ignore`.
5. **Testes:** nenhuma asserção removida, afrouxada ou pulada (`skip`/`only`). Os testes são traduzidos, não reescritos. A contagem atual é **340** e no fim tem que ser ≥ 340.
6. **Edição mecânica só com ferramenta que entende a sintaxe:** compilador do TypeScript, `ts-morph` ou `postcss` para CSS. Nunca use `sed`/regex sobre o arquivo inteiro para renomear identificador ou string. Regex só dentro de um nó já isolado pela AST (ex.: segmentos de uma URL dentro de um literal).
7. **Arquitetura igual:** vertical slice, fronteiras do ESLint por `index.ts`, mesmas pastas internas (`api/ models/ validators/ components/ pages/ hooks/ lib/ stores/`). Nada de reorganizar, juntar componentes ou "melhorar" código fora do pedido. Juntar componentes é a Task 9, depois do deploy.
8. **Não mexa em:** `package-lock.json` (só pelo `npm install` quando adicionar/remover devDependency), `public/`, `src/assets/` (estilos do mapa e ícones são gerados), `docs/design/`, `docs/superpowers/` (histórico), exceto a pasta deste plano.
9. **Git:**
   - Trabalhe na branch `refactor/ingles`, que já existe e está no GitHub.
   - Um commit por passo de commit indicado, em Conventional Commits **em português** (ex.: `refactor: remove comentários do front`).
   - Faça `git push` ao fim de cada task.
   - Na Task 1, abra um **PR draft** contra `main` com o título `refactor: front em inglês, sem comentários (sobe junto com TCC.back #19)`, para o revisor acompanhar.
   - Nunca faça force-push, rebase da branch publicada, merge ou mudança na `main`.
10. **Registro de decisões:** mantenha `docs/superpowers/plans/2026-10-29-ingles-front/RELATORIO.md`. Para cada task, anote:
    - o que foi feito;
    - os comandos de verificação com o resultado (contagem de testes);
    - cada decisão que este plano não cobria, no formato `Decisão: <o quê> — <por quê> — <custo se estiver errado>`;
    - tudo que ficou pendente.

    O revisor lê esse arquivo primeiro. Commite-o junto com cada task.
11. **Pare e pergunte** (deixe a pergunta no RELATORIO e no PR, e não avance a task) se:
    - precisar mudar o contrato da API ou o comportamento de uma tela;
    - um texto visível precisar mudar;
    - um teste só passar afrouxando a asserção;
    - os prints mudarem e você não souber explicar.

## 3. Comandos de verificação

O "**gate**" de cada task é rodar, nesta ordem, e todos passarem:

```bash
npm run typecheck
npm run lint
npm run format:check
npm test                                  # Vitest; anote "Tests N passed"
node scripts/ui-strings.mjs --check       # criado na Task 1
node scripts/compare-prints.mjs           # criado na Task 1 (roda npm run prints e compara)
```

`npm run prints` sobe um Vite com a API falsa (MSW, porta 5199) e grava PNGs em `prints/` (fora do git). Ele precisa do Chromium do Playwright: se faltar, rode `npx playwright install chromium`.

## 4. Glossário

O glossário normativo de domínio está em `contrato-novo/API.md` (nomes do contrato) e nos mapas desta pasta. Use os mesmos termos que o back: `Problema → Issue`, `Incidente → Incident`, `Voto → Vote`, `Categoria → Category`, `Grupo → Group`, `Usuário → User`, `Perfil → Role`, `Confiança → Trust` (o campo é `trustScore`), `Faixa → Band`, `Verificação → Verification`, `Geocodificação → Geocoding`, `Saúde → Health`, `Histórico → History`, `Recentes → Recent`, `Duplicatas → Duplicates`, `Calor → Heatmap`, `Registro (ato de registrar) → Report`.

**Mapas prontos nesta pasta** (separados por tab ou `=`):

| Arquivo | Conteúdo | Uso |
|---|---|---|
| `mapa-schemas.tsv` | 55 schemas antigos → novos (ex.: `ObterDetalheProblemaResponse → GetIssueDetailResponse`), todos conferidos | argumento de `Schema<'...'>` |
| `mapa-campos.tsv` | 191 `Schema.campo` antigos → novos (ex.: `ObterDetalheProblemaResponse.confianca → GetIssueDetailResponse.trustScore`) | campos de resposta/corpo, fixtures do MSW |
| `mapa-url.txt` | segmentos de rota e nomes de query param (`problemas=issues`, `tamanho=pageSize`, `voto=vote`...) | strings de URL da API |
| `mapa-valores.txt` | valores de enum (`sim=yes`, `possivelmenteResolvida=possiblyResolved`, `laranja=orange`...), `type` de erro (`autor-nao-vota=author-cannot-vote`...) e chaves de config | strings que são valores do contrato |
| `mapa-identificadores-back.tsv` | 1125 identificadores do back e a tradução revisada | referência de estilo e de termos |
| `dicionario-palavras.txt` | palavra PT → EN | primeira versão do mapa do front |

**Features e componentes compartilhados:**

| PT | EN |
|---|---|
| `features/mapa`, `problemas`, `incidentes`, `registro`, `perfil`, `usuarios`, `categorias`, `localizacao`, `aparencia`, `verificacao`, `geocodificacao`, `auth`, `admin` | `features/map`, `issues`, `incidents`, `report`, `profile`, `users`, `categories`, `location`, `appearance`, `verification`, `geocoding`, `auth`, `admin` |
| `MapaVetorial`, `PainelResponsivo`, `FolhaResponsiva`, `TelaComVoltar`, `Pagina`, `Icone`, `IconeRemoto`, `CampoTexto`, `CampoBusca`, `ChipFiltro`, `Segmentado`, `ListaInfinita`, `NumeroAnimado`, `ItemAnimado`, `ProvedorMovimento`, `BotaoBussola`, `CampoSenha`, `CampoAreaTexto`, `CampoSelecao` | `VectorMap`, `ResponsivePanel`, `ResponsiveSheet`, `ScreenWithBack`, `Page`, `Icon`, `RemoteIcon`, `TextField`, `SearchField`, `FilterChip`, `SegmentedControl`, `InfiniteList`, `AnimatedNumber`, `AnimatedItem`, `MotionProvider`, `CompassButton`, `PasswordField`, `TextAreaField`, `SelectField` |
| layouts `RaizLayout`, `AppLayout`, `TelaCheiaLayout`, `MobileLayout`, `DesktopLayout`, `RegistroLayout`, `navegacao.ts`, `pagina-nao-encontrada.tsx` | `RootLayout`, `AppLayout`, `FullScreenLayout`, `MobileLayout`, `DesktopLayout`, `ReportLayout`, `navigation.ts`, `not-found-page.tsx` |
| `rascunho` / `pendencia` / `guarda` / `sessao` / `exigirConta` / `concluirLogin` | `draft` / `pendingAction` / `guard` / `session` / `requireAccount` / `completeLogin` |
| helpers do cliente `dados()` / `semConteudo()`; `ProvedorAutenticacao`, `registrarAutenticacao`, `obterProvedorAutenticacao` | `unwrapData()` / `unwrapEmpty()` (não use `data`: colide com o `data` do openapi-fetch); `AuthProvider`, `registerAuthProvider`, `getAuthProvider` |
| `ApiError`, `isApiError`, `isErroDeRede` | `ApiError`, `isApiError`, `isNetworkError` |
| `CENTRO_PADRAO`, `ZOOM_PADRAO`, `COR_TRACEJADO` | `DEFAULT_CENTER`, `DEFAULT_ZOOM`, `DASH_COLOR` |
| `Tema` (`claro`/`escuro`/`automatico`) | `Theme` (`light`/`dark`/`system`) |
| `Ponto`, `Retangulo` | `Point`, `Bounds` |

Se o nome em inglês colidir com algo de biblioteca ou do JS (`Map`, `Location`, `Point` do MapLibre, `Page` de alguma lib, `History`), escolha outro (`MapPage`, `GeoPoint`...) e registre a decisão.

**Rotas do app** (`src/app/router.tsx` e todos os `navigate`, `<Link to>`, `<NavLink to>`, `<Navigate to>`):

| Antes | Depois |
|---|---|
| `/mapa` | `/map` |
| `/problema/:id` | `/issue/:id` |
| `/area` | `/area` |
| `/recentes` | `/recent` |
| `/perfil`, `/perfil/verificacao`, `/perfil/historico`, `/perfil/configuracoes` | `/profile`, `/profile/verification`, `/profile/history`, `/profile/settings` |
| `/admin/verificacoes`, `/admin/categorias`, `/admin/usuarios` | `/admin/verifications`, `/admin/categories`, `/admin/users` |
| `/registrar` + `categoria`, `local`, `conferencia`, `revisao`, `sucesso`, `incidente/local`, `incidente/revisao`, `incidente/sucesso` | `/report` + `category`, `location`, `duplicate-check`, `review`, `success`, `incident/location`, `incident/review`, `incident/success` |
| `/login`, `/cadastro`, `/aparencia`, `/permissao-localizacao` | `/login`, `/register`, `/appearance`, `/location-permission` |

Query params do app (ex.: `?lat=&lng=` e os filtros do mapa na URL): os nomes em PT vão para inglês pelo `mapa-url.txt` e pelo glossário (`modo → mode`, `camadas → layers`, `grupos → groups`, `status` continua).

**Chaves de storage** (prefixo `ocorrencias.` → `urbanReports.`):

| Antes | Depois |
|---|---|
| `ocorrencias.sessao` | `urbanReports.session` |
| `ocorrencias.tema` | `urbanReports.theme` |
| `ocorrencias.pendencia` | `urbanReports.pendingAction` |
| `ocorrencias.rascunhoRegistro` | `urbanReports.reportDraft` |
| `ocorrencias.localizacaoConcedida` | `urbanReports.locationGranted` |
| `ocorrencias.prePermissaoVista` | `urbanReports.prePermissionSeen` |
| `ocorrencias.legendaVista` | `urbanReports.legendSeen` |
| `ocorrencias.avisoVazioFechado` | `urbanReports.emptyNoticeDismissed` |
| `ocorrencias.categoriasRecentes` | `urbanReports.recentCategories` |
| `ocorrencias.iconesRemotos` | `urbanReports.remoteIcons` |

Os **valores** gravados também mudam junto com os enums (ex.: tema `claro` → `light`). Não escreva migração do valor antigo: o efeito aceito é cada pessoa escolher o tema de novo uma vez.

**CSS** (`src/index.css`, e todos os usos em strings de classe e em `var(--...)`):

| Antes | Depois |
|---|---|
| `--primario`, `--primario-cheio`, `--primario-suave` (e `--color-*` deles; classes `text-primario`, `bg-primario-suave`, `border-primario`...) | `--brand`, `--brand-solid`, `--brand-soft` (`text-brand`, `bg-brand-soft`, `border-brand`...) |
| `--superficie-1`, `--superficie-2` | `--surface-1`, `--surface-2` |
| `--sombra-1..3` | `--elevation-1..3` (não use `--shadow-*`, que já existe como token do Tailwind) |
| `--vidro`, `--vidro-borda`, `@utility vidro` | `--glass`, `--glass-border`, `@utility glass` |
| `@utility pressionavel` | `@utility pressable` |
| `--nova`, `--nova-foreground` | `--new-badge`, `--new-badge-foreground` |
| `--voto-sim`, `--voto-nao` | `--vote-yes`, `--vote-no` |
| `--calor` | `--heatmap` |
| `--realce` | `--highlight` |
| `--cat-<cor>` e `--cat-<cor>-claro` (`laranja`, `ocre`, `marrom`, `vermelho`, `terracota`, `azul`, `verde-agua`, `roxo`, `rosa`, `cinza`) | `--group-<color>` e `--group-<color>-light` com os valores **novos** do enum `GroupColor`: `orange`, `ochre`, `brown`, `red`, `terracotta`, `blue`, `teal`, `purple`, `pink`, `gray` (classes `text-group-orange`, `bg-group-orange-light`...) |
| `.brilho` + `@keyframes brilho`, `.pulso-alerta` + `@keyframes pulso-alerta`, `.mapa-principal` | `.shimmer`, `.alert-pulse`, `.main-map` |
| atributos `data-tema`, `data-layout-celular`, `data-estagio`, `data-estilo`, `data-faixa`, `data-mostrador`, `data-pontos`, `data-problema`, `data-rolagem-painel`, `data-tipo` | `data-theme`, `data-layout-mobile`, `data-stage`, `data-style`, `data-band`, `data-display`, `data-points`, `data-issue`, `data-panel-scroll`, `data-type` |

Não toque nos tokens do shadcn/Tailwind (`--primary`, `--background`, `--card`, `--radius*`, `--shadow-*`, `--tw-*`...) nem nas classes do MapLibre (`.maplibregl-*`). Confira as classes Tailwind que são montadas em objeto de mapeamento, por exemplo `src/features/categorias/models/categoria.ts` (`text-cat-laranja`). O Tailwind só gera classe que aparece inteira no código-fonte; nunca monte nome de classe por concatenação. Uma classe errada **não** dá erro de compilação, só tela quebrada, e é para isso que existe a comparação de prints.

## 5. Lições do back (evite os mesmos erros)

- **Tradução palavra por palavra inverte a ordem.** `ProblemaAtivo` não é `IssueActive`, é `ActiveIssue`; `StatusProblema` é `IssueStatus`; `FaixaConfianca` é `TrustBand`. Revise o mapa à mão.
- **Palavras reservadas e colisões:** `novo → new`, `padrao → default`, `excluir → delete` e `objeto → object` não podem ser nome de variável. Escolha outro nome.
- **Palavras ambíguas:** `a`, `o`, `e`, `no`, `em`, `de`, `media`, `area`, `cor`, `ponto`, `sim`, `nao` existem também em inglês ou em nomes de biblioteca. Só traduza identificadores **declarados no nosso código**, nunca nomes que vêm de pacotes.
- **Valor de enum escapou:** no back, `GroupColor.Laranja` ficou em português porque `laranja` não estava no dicionário, e os testes comparavam o enum tipado. Por isso a checagem do fim de cada task procura valores PT em strings.
- **Strings de teste com aspas escapadas** (`"\"ativa\""`) e templates passam despercebidos por ferramentas simples. Procure-os de propósito.
- **Campo "errado de propósito" num teste.** Um teste mandava `ativo` (errado) e esperava 400, enquanto o certo era `ativa`. Traduzidos, os dois viram `active`, e o teste deixa de testar. Quando um teste usa um nome inválido de propósito, mantenha-o inválido (`isActive`).
- **Mensagem que cita valor do contrato:** se algum texto citar um valor de enum ou rota (ex.: "Valores aceitos: ..."), o texto continua em português, mas o valor citado vai para o novo. Registre cada caso.

---

## 6. Tarefas

### Task 1: Redes de proteção e PR draft

1. Crie `scripts/ui-strings.mjs` (ESM, só `typescript` e `node:` como dependências).
   - Percorra `src/**/*.{ts,tsx}`, excluindo `**/*.test.*`, `src/test/**`, `src/infrastructure/api/schema.d.ts` e `src/infrastructure/mocks/**`.
   - Use `ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)` e uma visita recursiva aos nós. Colete:
     - todo `JsxText` com `text.trim() !== ''`, normalizado com espaços colapsados;
     - o valor de todo `StringLiteral`, `NoSubstitutionTemplateLiteral` e pedaço de `TemplateExpression` (head/middle/tail) que contenha espaço, letra acentuada (`/[À-ÿ]/`) ou que comece com maiúscula seguida de minúscula. A ideia é pegar texto para gente, não identificador;
     - o valor de atributos JSX `aria-label`, `title`, `placeholder` e `alt` quando forem literais.
   - Saída: as strings ordenadas (`localeCompare` com `'pt-BR'`) e sem repetição, uma por linha, em `docs/superpowers/plans/2026-10-29-ingles-front/ui-strings.txt`.
   - Com `--check`, compare com esse arquivo, imprima as linhas `+`/`-` e saia com código 1 se houver diferença.
   - Rode sem `--check` para gravar a referência e depois com `--check`. Esperado: sai 0.
2. Crie `scripts/compare-prints.mjs`. Na primeira execução (`--baseline`), ele roda `npm run prints` e copia `prints/` para `prints-baseline/`. Nas seguintes, roda `npm run prints` e compara cada PNG com o da baseline. Use `pixelmatch` + `pngjs` como devDependencies, com tolerância 0 de pixels diferentes. Saia com código 1 e liste os arquivos diferentes, gravando os diffs em `prints-diff/`. Adicione `prints-baseline/` e `prints-diff/` ao `.gitignore`. Se os prints não forem determinísticos (rode a comparação duas vezes sem mudar nada), ache a causa (animação, relógio, ordem de requisições) e estabilize **dentro do `scripts/prints.mjs`**, não no app. Registre no RELATORIO.
3. Rode `node scripts/compare-prints.mjs --baseline` e depois `node scripts/compare-prints.mjs`. Esperado: sai 0.
4. Rode o gate completo e anote no RELATORIO: Tests 340 passed.
5. Commit `test: redes de proteção (textos da UI e prints) antes do refactor`. Push. Abra o PR draft (regra 9). No corpo, ponha um link para este plano e "Sobe junto com https://github.com/VictorHenriqueTerraCheru/TCC.back/pull/19 — não mergear".

### Task 2: Remover comentários

1. Crie `scripts/strip-comments.mjs` com o scanner do TypeScript (`ts.createScanner(ts.ScriptTarget.Latest, /*skipTrivia*/ false, ts.LanguageVariant.JSX, text)`) ou com `ts.getLeadingCommentRanges`/`getTrailingCommentRanges` sobre cada token da AST.
   - Remova `SingleLineCommentTrivia` e `MultiLineCommentTrivia`, inclusive JSDoc e comentários dentro de JSX (`{/* ... */}`: remova a expressão vazia inteira).
   - Preserve os comentários cujo texto comece com as diretivas da regra 4.
   - Ao remover um comentário que ocupava a linha inteira, remova a linha. Comentário no fim de uma linha: remova o comentário e os espaços antes dele.
   - Nunca altere nada dentro de literais de string, template ou regex. É por isso que se usa o scanner.
   - Depois, rode `npm run format`.
2. CSS (`src/**/*.css`): remova os `/* ... */` com `postcss` (`root.walkComments(c => c.remove())`), que entende CSS. Não use regex.
3. Rode em `src/`, `scripts/`, `eslint.config.js`, `vite.config.ts`, `index.html` (só comentários `<!-- -->`, à mão) e `Dockerfile`/`Caddyfile` (à mão, linhas `#`).
4. Verificação extra: `npx tsc --noEmit -p tsconfig.app.json` e uma busca por `//` e `/*` restantes. Só podem aparecer em URLs dentro de strings e nas diretivas permitidas. Liste as que ficaram no RELATORIO.
5. Gate completo: textos e prints idênticos.
6. Commit `refactor: remove comentários do front`. Push.

### Task 3: Contrato novo da API

1. Copie `contrato-novo/openapi.json` para `docs/openapi.json` e `contrato-novo/API.md` para `docs/API.md`.
   - Em `scripts/gen-api.mjs`, troque `DATAS_ANULAVEIS` (que será renomeada depois) para `['GetMeResponse.verifiedAt', 'ListUsersItem.verifiedAt']`.
   - Rode `npm run gen:api`. `npm run typecheck` vai falhar: essa é a sua lista de trabalho.
2. Crie `scripts/migrate-contract.mjs` com `ts-morph` (devDependency temporária, que sai na Task 7). Ele aplica os mapas **só onde a AST mostra que é contrato**:
   - **Schemas:** o literal de string que é argumento de tipo de `Schema<'...'>` (e de qualquer outro helper que receba nome de schema) → `mapa-schemas.tsv`.
   - **Rotas da API:** o primeiro argumento literal de `api.GET/POST/PUT/PATCH/DELETE(...)`, de `rota(...)` e de `http.get/post/put/patch/delete(...)` nos handlers do MSW, e os pedaços literais de templates de URL. Nos handlers, os nomes de query param lidos com `url.searchParams.get('pagina' | 'tamanho' | 'busca' | 'filtro' | 'perfil' | ...)` também mudam pelo `mapa-url.txt`. Troque segmento por segmento com `mapa-url.txt`, preservando `{id}`. Para parâmetros de path com nome (`{chave}`), use o nome novo (`{key}`).
   - **Campos:** nomes de propriedade em objetos literais e acessos (`x.confianca`) que o compilador acusou como inexistentes no tipo novo → `mapa-campos.tsv`. Nos fixtures e handlers do MSW, que são objetos soltos sem tipo forte, aplique o mapa nas propriedades dos objetos tipados com `Schema<...>` e confira um por um os que não forem tipados.
   - **Valores:** literais de string iguais a uma entrada de `mapa-valores.txt`, **só** quando o tipo contextual (`checker.getContextualType`) ou o tipo comparado (`===`, `switch`, chave de `Record<Enum, ...>`) for um enum do contrato ou o `type` de erro. Se o tipo for `string` puro, **não troque**: liste no RELATORIO para revisão manual.
   - Rode o script e depois `npm run typecheck`. Corrija à mão o que sobrar até zerar. Os ~60 lugares do código que comparam com valores de enum (`=== 'ativa'`) aparecem como erro de tipo ("no overlap"), o que ajuda.
3. Em cada `errors.ts` de feature, as chaves dos `Record` de mensagens passam a ser os `type` novos (`mapa-valores.txt`, entradas com `-`). As mensagens não mudam.
4. **MSW:** handlers e fixtures (`src/infrastructure/mocks/**`) passam a responder exatamente o contrato novo (rotas, campos, valores de enum como `color: 'orange'`, `status: 'active'`, `type` de erro). Os dados (endereços, nomes, chaves de grupo) continuam em português.
5. Procure strings que o compilador não vê: `rg -n "'(nova|ativa|resolvida|possivelmenteResolvida|alta|media|baixa|sim|nao|cidadao|cidadaoVerificado|administrador|problema|incidente|pendente|aprovada|recusada|moradorRegiao|trabalhaRegiao|servidorPublico|outro|laranja|ocre|marrom|vermelho|terracota|azul|verdeAgua|roxo|rosa|cinza|tudo|registros|votos|registroProblema|registroIncidente|voto)'" src scripts`. Cada resultado restante precisa ser texto de UI ou dado (regra 2). Justifique os que ficarem no RELATORIO.
6. Gate completo. `ui-strings` precisa continuar idêntico: valor de contrato nunca aparece cru na tela. Se aparecer, é um bug a mapear para texto em português; pergunte antes (regra 11). Os prints também precisam continuar idênticos.
7. Commit `refactor(api): front fala o contrato novo da API em inglês`. Push.

### Task 4: Identificadores, arquivos e pastas

1. **Inventário:** escreva `scripts/inventory.mjs` (`ts-morph`).
   - Liste todo identificador **declarado** em `src/` e `scripts/`: variáveis, funções, parâmetros, classes, interfaces, type aliases, membros de interface/type, propriedades de objeto que declaram forma própria (não as do contrato, já tratadas), enums, componentes, hooks, exports e nomes de `describe`/`it`/`test` (strings).
   - Liste também os nomes de arquivo e pasta em `src/` e `scripts/`.
   - Gere uma primeira tradução com `dicionario-palavras.txt` e grave `mapa-identificadores-front.tsv` (antigo⇥novo).
2. **Revise o mapa à mão, linha por linha** (seção 5 e glossário). Nomes de teste viram frases em inglês legíveis (`'lista os problemas perto de Icaraí'` → `'lists issues near Icaraí'`). Commite o mapa revisado antes de aplicar (`docs: mapa de identificadores do front`), para o revisor poder conferir.
3. **Aplique com `ts-morph`:**
   - `identifier.rename(novo)` para cada símbolo declarado. O rename é semântico: atualiza usos, imports, exports e shorthand `{ nome }`.
   - `sourceFile.move(...)` e `directory.move(...)` para arquivos e pastas, o que atualiza os imports.
   - Em seguida, `project.save()`.
   - Identificadores de biblioteca nunca entram no mapa.
4. Atualize os caminhos de feature nas regras `no-restricted-imports` do `eslint.config.js` (se houver nome de pasta nelas) e no `components.json` (aliases do shadcn).
5. **CSS e classes** (tabela da seção 4): renomeie tokens, utilities, keyframes e `data-*` em `src/index.css` com `postcss`, e nos `.ts`/`.tsx` só dentro de literais de string e de atributos JSX (via AST). Confira com `rg -n "primario|superficie|sombra|vidro|pressionavel|cat-|brilho|pulso-alerta|mapa-principal|data-(tema|layout-celular|estagio|estilo|faixa|mostrador|pontos|problema|rolagem-painel|tipo)" src scripts`, que precisa voltar vazio.
6. Gate completo. Rode também o inventário de novo e liste no RELATORIO os identificadores declarados que ainda contêm palavra do dicionário. Só podem sobrar dados (regra 2).
7. Commits separados, nesta ordem, cada um passando no gate:
   - `refactor: identificadores em inglês`
   - `refactor: arquivos e pastas em inglês`
   - `refactor(css): tokens e classes em inglês`

   Push.

### Task 5: Rotas do app e chaves de storage

1. **Escreva primeiro os testes que vão falhar:**
   - `src/app/router.test.tsx`: para cada rota da tabela "Rotas do app", renderiza o router naquela URL (com sessão de admin onde for preciso) e confere que **não** aparece a página de não encontrado.
   - Para cada store/hook persistido (sessão, tema, pendência, rascunho, localização, pré-permissão, legenda, aviso vazio, categorias recentes, ícones remotos): um teste que usa o store e confere `localStorage`/`sessionStorage.getItem('urbanReports.<nome>')`. Os testes que já leem `ocorrencias.*` passam a ler a chave nova.

   Rode os testes: eles devem falhar. Anote no RELATORIO.
2. Troque as rotas e as chaves pelas tabelas da seção 4.
3. Verificação: `rg -n "['\"\`]/(mapa|problema|recentes|perfil|registrar|cadastro|aparencia|permissao-localizacao)\b|ocorrencias\." src scripts` precisa voltar vazio. O `scripts/prints.mjs` e o `scripts/e2e.mjs` também navegam por essas URLs: atualize-os.
4. Gate completo (os testes novos passam; textos e prints idênticos).
5. Commit `refactor(app): rotas e chaves de storage em inglês`. Push.

### Task 6: Scripts em inglês

1. `scripts/*.mjs`: nomes de arquivo (`gen-icones.mjs → gen-icons.mjs`, `icones-usados.mjs → used-icons.mjs`, `gen-estilo-mapa.mjs → gen-map-style.mjs`, `estilo-mapa.mjs → map-style.mjs`, `contraste.test.mjs → contrast.test.mjs`...), identificadores, logs e os `scripts` do `package.json` (`gen:icones → gen:icons`, `gen:estilo-mapa → gen:map-style`). `npm run gen:icones` lê os literais de `src/` para montar o subset da fonte; rode `npm run gen:icons` e confira que `src/assets/material-symbols/` **não muda** (`git status`).
2. Remova `ts-morph` e qualquer dependência só da migração (`migrate-contract.mjs`, `inventory.mjs` e `strip-comments.mjs` podem ficar fora do repo; registre onde ficaram). `ui-strings.mjs` e `compare-prints.mjs` ficam: são ferramentas úteis.
3. Gate completo. Commit `refactor(scripts): scripts em inglês`. Push.

### Task 7: Documentação

1. `CLAUDE.md`: árvore de pastas, nomes de componentes citados, regras.
   - A regra 10 passa a ser: "Textos da interface em português do Brasil. Código, identificadores, rotas, chaves de storage e CSS em inglês. Sem comentários."
   - Atualize também as rotas citadas nas regras, as chaves de storage, os comandos (`dotnet run --project src/UrbanReports.Api` no back) e os scripts renomeados.
2. `docs/TELAS.md` e `docs/PLAN.md`: rotas e nomes de código em inglês. A prosa continua em português.
3. `README.md`: comandos.
4. Gate completo. Commit `docs: front em inglês`. Push.

### Task 8: Verificação final com a API real

1. Gate completo e `npm run build`. Anote a contagem de testes: tem que ser ≥ 340, mais os novos da Task 5.
2. Suba o back do PR #19:

   ```bash
   cd ../TCC.back && git fetch && git checkout refactor/ingles && docker compose up -d db && dotnet run --project src/UrbanReports.Api
   ```

   Ele aplica a migration e o seed em Development, na porta 5080. Rode `npm run e2e` (o roteiro usa o app no Chrome contra a API real). Esperado: o roteiro inteiro passa. Se falhar por diferença de contrato entre o MSW e a API real, corrija o lado do front e anote no RELATORIO.
3. Rode `npm run dev` e, com a API real, abra o app no navegador. Confira à mão:
   - mapa com marcadores;
   - detalhe de um problema e um voto;
   - registro de problema;
   - área de incidentes;
   - perfil e histórico;
   - admin (verificações, categorias e grupos com as cores certas, usuários) com `admin@tcc.local`.

   Registre o resultado no RELATORIO.
4. Atualize o corpo do PR com:
   - o resumo do que mudou;
   - as provas (textos idênticos, prints idênticos, contagem de testes, e2e);
   - o efeito no usuário: escolher o tema de novo, ver a pré-permissão de novo, entrar de novo, links antigos (`/problema/{id}`) quebram;
   - o roteiro de deploy: renomear as variáveis do Railway conforme a tabela do back #19 → mergear #19 e este PR juntos → `GET /api/v1/health/database` → login, mapa, detalhe, voto, registro e admin no celular.
5. Tire o PR do modo draft (**ready for review**) e **não mergeie**. Escreva no RELATORIO "Pronto para revisão" e pare.

### Task 9 (só depois do deploy e com aprovação do dono): reaproveitamento de componentes

Não faça agora. Quando for pedido:

1. Faça o inventário de componentes parecidos: cartões (`cartao-solicitacao`, `cartao-usuario`, `cartao-verificacao`, `cartao-endereco` e os nomes novos deles), listas e formulários do admin (categorias × grupos), botões sobre o mapa (`botao-mapa`, `botao-bussola`), estados vazios, folhas e painéis.
2. Para cada grupo, registre em `docs/superpowers/plans/2026-10-29-ingles-front/componentes.md`: os arquivos, o que se repete, a proposta e quantas linhas sai.
3. Entregue a lista ao dono e implemente **só os itens aprovados**. Critério: a junção só vale se o resultado fica mais simples de ler. Componente genérico cheio de props não conta.
4. Cada item aprovado é um commit, com o gate completo (textos e prints idênticos).

## 7. Definição de pronto

- [ ] Gate completo verde, `npm run build` ok, testes ≥ 340 + novos, nenhum `skip`/`only`.
- [ ] `node scripts/ui-strings.mjs --check` idêntico à referência da Task 1.
- [ ] `node scripts/compare-prints.mjs` sem diferenças.
- [ ] `npm run e2e` verde contra o back `refactor/ingles`.
- [ ] Nenhum comentário fora das diretivas permitidas; nenhum identificador, rota, chave de storage ou token CSS em português (o inventário final está no RELATORIO).
- [ ] `docs/openapi.json` e `docs/API.md` idênticos aos de `contrato-novo/`.
- [ ] RELATORIO completo, com as decisões e as pendências; PR pronto para revisão e **não mergeado**.
