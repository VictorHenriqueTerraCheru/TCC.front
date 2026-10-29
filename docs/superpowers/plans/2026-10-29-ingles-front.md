# Inglês e simplificação — front — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** O front fica todo em inglês (código, pastas, arquivos, rotas de URL, chaves de storage, mocks e testes), sem comentários e falando o contrato novo da API. A tela continua **idêntica**, com o texto em português.

**Architecture:** Uma branch `refactor/ingles` (já criada a partir da `main`) e um PR. Ele sobe **junto** com o PR #19 do back (https://github.com/VictorHenriqueTerraCheru/TCC.back/pull/19), num horário combinado com o usuário. A tradução é mecânica, feita por scripts que entendem a sintaxe (compilador do TypeScript), nunca por regex solta. Duas redes de proteção são criadas **antes** de qualquer mudança: a impressão digital dos textos da UI e os prints do Playwright com a API falsa.

**Tech Stack:** Vite 8, React 19, TypeScript 5.9, Vitest + Testing Library + MSW, openapi-typescript, Playwright (prints/e2e), ESLint + Prettier.

**Spec:** `../TCC.back/docs/superpowers/specs/2026-10-29-ingles-e-simplificacao-design.md` (§7 é o front; §4 glossário; §5 contrato). O plano do back, já executado, está em `../TCC.back/docs/superpowers/plans/2026-10-29-ingles-e-simplificacao-back.md`. Leia os dois.

**Dados de tradução (já prontos, nesta pasta):** `docs/superpowers/plans/2026-10-29-ingles-front/`
- `mapa-schemas.tsv`: schema antigo → novo (55 pares, todos conferidos contra os dois OpenAPI).
- `mapa-campos.tsv`: `Schema.campo` antigo → novo (191 pares, conferidos).
- `mapa-url.txt`: segmento de rota/query antigo → novo (`problemas=issues`, `tamanho=pageSize`...).
- `mapa-valores.txt`: valores de enum, `type` de erro e chaves de config (`sim=yes`, `possivelmenteResolvida=possiblyResolved`, `nome-duplicado=duplicate-name`...).
- `mapa-identificadores-back.tsv`: os 1125 identificadores do back e a tradução revisada. Serve de referência de estilo; não é aplicável direto ao front.
- `dicionario-palavras.txt`: palavra PT → EN para gerar a primeira versão do mapa do front.

## Global Constraints

- **Nenhum texto visível muda.** JSX text, `aria-label`, `title`, `placeholder`, mensagens, toasts e textos de erro continuam em português do Brasil.
- **Dados continuam em português:** chaves de grupo (`viaPublica`, `seguranca`...), chaves de ícone (`buraco`), nomes de categoria e e-mails do seed.
- Contrato: exatamente o do `docs/openapi.json` novo (cópia de `../TCC.back/tests/UrbanReports.Api.Tests/Skeleton/openapi.snapshot.json`) e do `docs/API.md` novo (cópia de `../TCC.back/docs/API.md`). O front não pode mudar a API.
- Sem comentários em `src/`, `scripts/` e CSS. Ficam só as diretivas funcionais: `eslint-disable*`, `@ts-expect-error`, `/// <reference ...>` e `@vite-ignore`.
- Nenhuma asserção de teste removida ou afrouxada. Os testes são traduzidos, não reescritos.
- Cada commit passa por `npm run typecheck`, `npm run lint`, `npm run format:check` e `npm test`.
- A arquitetura continua a mesma (vertical slice, fronteiras do ESLint por `index.ts`), só com nomes em inglês.
- Commits em Conventional Commits, em português.

## Glossário do front (além do spec §4)

| PT | EN |
|---|---|
| features: `mapa`, `problemas`, `incidentes`, `registro`, `perfil`, `usuarios`, `categorias`, `localizacao`, `aparencia`, `verificacao`, `geocodificacao`, `auth`, `admin` | `map`, `issues`, `incidents`, `report`, `profile`, `users`, `categories`, `location`, `appearance`, `verification`, `geocoding`, `auth`, `admin` |
| pastas por feature `api/ models/ validators/ components/ pages/ hooks/ lib/ stores/` | iguais (já são inglês) |
| `rascunho` / `pendencia` / `guarda` / `sessao` | `draft` / `pendingAction` / `guard` / `session` |
| `MapaVetorial`, `PainelResponsivo`, `FolhaResponsiva`, `TelaComVoltar`, `Pagina`, `Icone` | `VectorMap`, `ResponsivePanel`, `ResponsiveSheet`, `ScreenWithBack`, `Page`, `Icon` |
| `dados()` (helper do cliente) | `data()` → prefira `unwrap()` para não colidir com o `data` do openapi-fetch |
| `CENTRO_PADRAO`, `ZOOM_PADRAO`, `COR_TRACEJADO` | `DEFAULT_CENTER`, `DEFAULT_ZOOM`, `DASH_COLOR` |
| `Tema` (`claro`/`escuro`/`automatico`), `data-tema` | `Theme` (`light`/`dark`/`system`), `data-theme` |
| rotas: `/mapa`, `/problema/:id`, `/area`, `/recentes`, `/perfil`, `/perfil/verificacao`, `/perfil/historico`, `/perfil/configuracoes`, `/admin/verificacoes`, `/admin/categorias`, `/admin/usuarios`, `/registrar` (`categoria`, `local`, `conferencia`, `revisao`, `sucesso`, `incidente/local`, `incidente/revisao`, `incidente/sucesso`), `/login`, `/cadastro`, `/aparencia`, `/permissao-localizacao` | `/map`, `/issue/:id`, `/area`, `/recent`, `/profile`, `/profile/verification`, `/profile/history`, `/profile/settings`, `/admin/verifications`, `/admin/categories`, `/admin/users`, `/report` (`category`, `location`, `duplicate-check`, `review`, `success`, `incident/location`, `incident/review`, `incident/success`), `/login`, `/register`, `/appearance`, `/location-permission` |
| chaves de storage `ocorrencias.*` (`sessao`, `tema`, `pendencia`, `rascunhoRegistro`, `localizacaoConcedida`, `prePermissaoVista`, `legendaVista`, `avisoVazioFechado`, `categoriasRecentes`, `iconesRemotos`) | `urbanReports.*` (`session`, `theme`, `pendingAction`, `reportDraft`, `locationGranted`, `prePermissionSeen`, `legendSeen`, `emptyNoticeClosed`, `recentCategories`, `remoteIcons`) |
| query params do app (`?lat=&lng=`, filtros do mapa na URL) | nomes em inglês pelo mesmo mapa |

Nomes de arquivo continuam em kebab-case (`category-icon.tsx`). O nome de um componente ou hook bate com o arquivo.

**Efeito aceito das chaves novas** (spec §10 e decisão do usuário de subir tudo junto): no primeiro acesso depois do deploy, cada pessoa escolhe o tema e vê a pré-permissão de localização de novo, e precisa entrar de novo (isso já aconteceria pelo `Jwt__Key` novo no back). Links antigos salvos (`/problema/{id}`) deixam de abrir.

## Review Focus

1. **Texto da UI alterado sem querer** (um literal em português que parecia identificador, ou um `aria-label`). É pinado pela impressão digital de textos da Task 1. Qualquer diferença precisa ser explicada.
2. **Valor do contrato que o TypeScript não vê:** strings soltas comparadas com enum (`status === 'ativa'`), chaves de query montadas à mão e `type` de erro em `errors.ts`. O tipo gerado pega a maioria, mas não `string` solto. Pinado pelo grep final da Task 6 e pelo e2e contra a API real (Task 7).
3. **Fixture do MSW divergindo da API real:** os mocks passam, mas a API real responde outro nome. Pinado pelo `npm run e2e` contra o back da branch `refactor/ingles` (Task 7).
4. **Chave de storage renomeada só na escrita ou só na leitura:** um lado com a chave nova e o outro com a velha faz o rascunho, o tema ou a sessão "sumirem". Pinado por um teste por store que grava e relê (Task 5).
5. **Rota interna esquecida:** um `navigate('/perfil')` ou `<Link to="/registrar/...">` em string deixa a tela num 404. Pinado pelo teste de rotas da Task 5 e pelo grep de `to=`/`navigate(` com segmentos PT.

---

### Task 1: Redes de proteção

**Files:**
- Create: `scripts/textos-ui.mjs` (depois `scripts/ui-strings.mjs`), `docs/superpowers/plans/2026-10-29-ingles-front/ui-strings.txt`
- Create: `prints-referencia/` (fora do git, só local: adicionar ao `.gitignore`)

- [ ] **Step 1:** escrever `scripts/textos-ui.mjs` com a API do compilador do TypeScript (`ts.createSourceFile`, que já é dependência). Ele percorre `src/**/*.{ts,tsx}` (sem testes, sem `schema.d.ts`, sem `infrastructure/mocks`) e coleta, ordenados e sem repetição:
  - todo `JsxText` não vazio;
  - todo literal de string (incluindo os pedaços de template) que tenha espaço, acento ou letra maiúscula seguida de minúscula (texto de gente);
  - os valores dos atributos JSX `aria-label`, `title`, `placeholder` e `alt`.

  Grava uma linha por texto em `ui-strings.txt`. Com `--check`, compara com o arquivo e sai com código 1 se houver diferença, mostrando as linhas a mais e a menos.
- [ ] **Step 2:** rodar sem `--check` (grava a referência) e depois com `--check`. Esperado: sai 0.
- [ ] **Step 3:** `npm run prints` e copiar `prints/` para `prints-referencia/`. Essas são as telas de antes, com a API falsa.
- [ ] **Step 4:** commit `test: impressão digital dos textos da UI antes do refactor`.

### Task 2: Remover comentários

- [ ] **Step 1:** escrever `scripts/remover-comentarios.mjs` com o scanner do TypeScript (`ts.forEachLeadingCommentRange`/`forEachTrailingCommentRange` sobre o texto, ou `ts.createScanner` com `skipTrivia=false`). Ele remove os comentários `//` e `/* */`, inclusive JSDoc, e os `{/* */}` de JSX, preservando as diretivas listadas nas Global Constraints. Nunca toca em literais de string, template ou regex. Depois do script, rodar `npm run format`. Para CSS (`src/**/*.css`), usar um regex que entende só `/* */`, conferindo antes que nenhum valor de CSS contém `/*`.
- [ ] **Step 2:** rodar em `src/`, `scripts/` e `*.config.*`. Conferir: `rg -n '//|/\*' src --type ts --type tsx` mostra só URLs dentro de strings e as diretivas permitidas.
- [ ] **Step 3:** `npm run typecheck && npm run lint && npm test && node scripts/textos-ui.mjs --check`. Esperado: tudo verde e textos idênticos.
- [ ] **Step 4:** commit `refactor: remove comentários do front`.

### Task 3: Contrato novo

**Files:**
- Modify: `docs/openapi.json` (copiar de `../TCC.back/tests/UrbanReports.Api.Tests/Skeleton/openapi.snapshot.json`), `docs/API.md` (copiar de `../TCC.back/docs/API.md`), `scripts/gen-api.mjs` (`DATAS_ANULAVEIS` → `GetMeResponse.verifiedAt`, `ListUsersItem.verifiedAt`)
- Modify: tudo que usa `Schema<'...'>`, `api.GET/POST/PUT/PATCH/DELETE('...')`, valores de enum, `type` de erro, campos de resposta e corpo de requisição, inclusive `src/infrastructure/mocks/**` e os testes.

- [ ] **Step 1:** copiar os dois arquivos e rodar `npm run gen:api`. `npm run typecheck` deve falhar com muitos erros, e essa é a lista de trabalho.
- [ ] **Step 2:** escrever `scripts/contrato-novo.mjs` (compilador do TS, troca por token, nunca por regex no texto). Ele aplica os mapas desta pasta:
  - literais de string que são **o argumento de `Schema<...>`** → `mapa-schemas.tsv`;
  - literais de string que são o **primeiro argumento de `api.GET/POST/...`** (e de `http.get/post...` nos handlers do MSW) e templates de URL → por segmento, com `mapa-url.txt`;
  - literais de string iguais a um valor de `mapa-valores.txt` → o valor novo, **só** onde o tipo esperado é um enum do contrato ou um `type` de erro. Na dúvida, liste para revisão manual em vez de trocar;
  - nomes de propriedade (identificador ou chave de objeto) que são campos do contrato → `mapa-campos.tsv`, só onde o TypeScript acusou erro ou dentro de `infrastructure/mocks/`.

  Rodar o script, depois `npm run typecheck`, e corrigir à mão o que sobrar até zerar.
- [ ] **Step 3:** `errors.ts` de cada feature: as chaves passam a ser os `type` novos (`mapa-valores.txt`). As mensagens em português continuam.
- [ ] **Step 4:** `npm test`. Os testes que conferem URL ou corpo enviado ao MSW precisam bater com o contrato novo. `node scripts/textos-ui.mjs --check` tem que continuar igual: o contrato não aparece na tela. Se aparecer (ex.: um valor de enum exibido cru), é bug: a UI tem que mapear o valor para texto em português.
- [ ] **Step 5:** `npm run prints` e comparar com `prints-referencia/` (script simples com `pixelmatch` ou comparação de bytes dos PNG). Esperado: idênticos.
- [ ] **Step 6:** commit `refactor(api): contrato novo da API em inglês`.

### Task 4: Identificadores, arquivos e pastas

- [ ] **Step 1:** gerar o inventário. Script com o compilador do TS que lista todo identificador **declarado** em `src/` e `scripts/` (variáveis, funções, parâmetros, tipos, interfaces, membros de tipo, propriedades de objeto declaradas por nós, componentes, hooks, `export`s) e os nomes de arquivo e pasta. Gerar a primeira tradução com `dicionario-palavras.txt` e revisar à mão. A ordem das palavras muda (`ProblemaAtivo` → `ActiveIssue`), e é preciso evitar palavras reservadas (`new`, `default`, `delete`, `function`...) e colisão com nomes do React, do DOM ou de bibliotecas (`Map` do JS × componente de mapa: use `VectorMap`/`MapPage`). Salvar o mapa revisado em `docs/superpowers/plans/2026-10-29-ingles-front/mapa-identificadores-front.tsv`.
- [ ] **Step 2:** aplicar com `ts-morph`: instalar como devDependency temporária, remover no fim da task. Use `rename()` por símbolo para os declarados, porque o rename semântico trata shorthand `{ nome }`, imports e exports, e `sourceFile.move()` / `directory.move()` para arquivos e pastas, porque atualiza os imports. Identificadores que vêm de bibliotecas nunca entram no mapa.
- [ ] **Step 3:** atualizar as regras do ESLint que citam caminhos de feature (`no-restricted-imports`) e o `tsconfig`/`vite.config` se tiverem alias com nome antigo.
- [ ] **Step 4:** `npm run typecheck && npm run lint && npm run format && npm test && node scripts/textos-ui.mjs --check`, depois `npm run prints` comparado com a referência. Esperado: tudo verde, textos e telas idênticos.
- [ ] **Step 5:** sobra de português em identificador: rodar de novo o inventário e listar os que ainda têm palavra do dicionário. Só podem sobrar dados (chaves de grupo e ícone). Commits separados: `refactor: arquivos e pastas em inglês` e `refactor: identificadores em inglês`.

### Task 5: Rotas de URL e chaves de storage

**Files:**
- Modify: `src/app/router.tsx`, todo `navigate(...)`, `<Link to>`, `<NavLink to>`, `Navigate`, `useSearchParams` com nomes PT, `app/layouts/navegacao.ts` (já renomeado na Task 4) e os stores/hooks com `localStorage`/`sessionStorage`
- Test: `src/test/fluxos/*` (já existentes) + um teste novo por chave de storage

- [ ] **Step 1:** escrever os testes que falham primeiro.
  - Para cada store persistido (sessão, rascunho, tema, pendência, localização, recentes): `grava e relê pela chave urbanReports.<nome>`. Os testes atuais de store que leem `sessionStorage.getItem('ocorrencias.rascunhoRegistro')` passam a ler a chave nova.
  - Um teste de rotas que renderiza cada caminho novo da tabela do glossário e não cai na página de não encontrado.

  Rodar: FAIL.
- [ ] **Step 2:** trocar rotas e chaves pelo glossário. Grep final: `rg -n "['\"\`]/(mapa|problema|recentes|perfil|registrar|cadastro|aparencia|permissao-localizacao)\b|ocorrencias\." src scripts` precisa sair vazio.
- [ ] **Step 3:** `npm test`, `node scripts/textos-ui.mjs --check` e prints. Esperado: verde e idêntico (a URL não aparece na tela).
- [ ] **Step 4:** commit `refactor(app): rotas e chaves de storage em inglês`.

### Task 6: Scripts, documentação e limpeza

- [ ] **Step 1:**
  - Scripts (`gen-api`, `gen-icones`, `gen-estilo-mapa`, `prints`, `e2e`, `contraste.test`): nomes de arquivo, variáveis e mensagens de log em inglês, e as rotas novas no `e2e.mjs` e no `prints.mjs`.
  - Renomear os scripts da Task 1 para inglês (`ui-strings.mjs` etc.) e remover o `contrato-novo.mjs` e o `ts-morph`, que eram descartáveis.
- [ ] **Step 2:** docs.
  - `CLAUDE.md`: árvore, regra 10 (identificadores em inglês; textos em português), sem comentários, nomes de componentes citados, rotas, chaves de storage e comandos (`dotnet run --project src/UrbanReports.Api`).
  - `docs/TELAS.md` e `docs/PLAN.md`: rotas e nomes de código. Prosa em português.
- [ ] **Step 3:** grep geral de restos de contrato antigo em strings: `rg -n "'(ativa|nova|resolvida|possivelmenteResolvida|cidadao|cidadaoVerificado|administrador|sim|nao|pendente|aprovada|recusada|laranja|ocre|marrom|vermelho|terracota|azul|verdeAgua|roxo|rosa|cinza)'" src`. Só podem sobrar textos de UI.
- [ ] **Step 4:** verificação completa e commit `docs: front em inglês`.

### Task 7: Verificação final com a API real e PR

- [ ] **Step 1:** `npm run typecheck && npm run lint && npm run format:check && npm test && npm run build`. Anotar a quantidade de testes: era 340 antes do refactor e tem que ser ≥ 340.
- [ ] **Step 2:** subir o back da branch `refactor/ingles` (`cd ../TCC.back && git checkout refactor/ingles && docker compose up -d db && dotnet run --project src/UrbanReports.Api`) e rodar `npm run e2e`. Esperado: o roteiro inteiro passa (visitante, cadastro pela folha, voto retomado, registro com falha offline, admin).
- [ ] **Step 3:** prints finais comparados com `prints-referencia/`. Diferenças só se explicadas.
- [ ] **Step 4:** push e `gh pr create` (conta `VictorHenriqueTerraCheru`, via script Python, como no back). No corpo:
  - dizer que **sobe junto com o TCC.back #19**;
  - o efeito no usuário (escolher o tema de novo, pré-permissão de novo, login de novo, links antigos quebram);
  - o roteiro de deploy: renomear as variáveis do Railway (tabela no #19) → mergear #19 e este PR juntos → `GET /api/v1/health/database` → login, mapa, detalhe, voto, registro e admin no celular. **Não mergear.**
- [ ] **Step 5:** revisão final da branch por um revisor independente no modelo mais capaz.

### Task 8 (separada, depois do deploy): reaproveitamento de componentes

Não faz parte deste PR (spec §7).

- [ ] **Step 1:** inventário. Listar componentes com estrutura parecida: cartões (`cartao-solicitacao`, `cartao-usuario`, `cartao-verificacao`, `cartao-endereco`), listas do admin (`lista-categorias`, `lista-grupos`), formulários do admin (`formulario-categoria`, `formulario-grupo`), botões sobre o mapa (`botao-mapa`, `botao-bussola`), estados vazios, folhas e painéis responsivos. Para cada grupo: arquivos, o que repete, proposta de junção e quantas linhas sai.
- [ ] **Step 2:** levar a lista ao usuário e **só seguir com os itens aprovados**. Critério do spec: só junta quando o resultado fica mais simples de ler. Componente genérico com muitas props não conta.
- [ ] **Step 3:** cada junção aprovada é um commit, com textos e prints idênticos (mesmas redes da Task 1).
