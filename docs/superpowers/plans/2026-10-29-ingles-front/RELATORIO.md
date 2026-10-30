# Relatório — Front em inglês, sem comentários

## Preparação

- Branch: `refactor/ingles`; `git pull --ff-only` em 2026-10-29: já atualizada.
- Plano e `CLAUDE.md` lidos integralmente antes da execução.
- Escopo: Tasks 1 a 8; Task 9 não será executada.
- Regras preservadas: textos visíveis e dados continuam em português; alterações mecânicas usam AST/TypeScript/PostCSS, nunca substituição global por regex ou sed.

## Task 1 — Redes de proteção e PR draft

- Dependências adicionadas via `npm install`: `pixelmatch@8.0.0` e `pngjs@7.0.0`; ambas compatíveis com Node 22 do projeto.
- Decisão: alinhei o centro e a geolocalização fixa de `scripts/prints.mjs` a Icaraí (`-22.905, -43.109`) — o commit `db70422` moveu o centro padrão e as fixtures para Icaraí, mas deixou o capturador em Botafogo; sem isso, as consultas por bounding box retornavam listas vazias e a baseline não podia ser criada. Custo se estiver errado: os prints podem capturar uma área diferente da referência pretendida.
- Decisão: forcei `reducedMotion: 'reduce'` no contexto Playwright dos prints — a comparação da segunda execução marcou mudanças nos pulsos de alerta, brilho e transições; o CSS e o `MotionConfig` já implementam o estado reduzido. Custo se estiver errado: a baseline mostra o estado estático das animações, mas preserva conteúdo e layout e torna a prova pixel a pixel repetível.
- Decisão: congelei `Date` em `2026-10-29T15:00:00-03:00` dentro dos contextos Playwright — os diffs remanescentes eram os minutos de datas relativas e os valores dinâmicos gerados pelo banco MSW. Custo se estiver errado: os prints deixam de representar o relógio real, mas representam uma execução reproduzível do mesmo fluxo.
- Decisão: esperei as animações finitas expostas pela Web Animations API antes da captura — os diffs passavam a ocorrer apenas em elementos que entram depois de dados MSW; finalizar no frame do screenshot ainda permitia estados diferentes conforme o início tardio da animação. Custo se estiver errado: o gerador demora até o fim da animação, mas registra o estado visual final em vez de uma etapa intermediária.
- Decisão: executei o Chrome sem GPU e com perfil de cor sRGB, e desabilitei animações/cursor somente no instante de `page.screenshot` — ainda havia variações de rasterização entre execuções idênticas; essas opções são do capturador, não do produto. Custo se estiver errado: a baseline deixa de cobrir diferenças específicas de aceleração por GPU, mas continua a comparar exatamente o HTML/CSS rasterizado pelo modo fixado.
- `node scripts/ui-strings.mjs` gravou `ui-strings.txt`; `node scripts/ui-strings.mjs --check` passou.
- `node scripts/compare-prints.mjs --baseline` e duas comparações independentes sem alteração de fonte passaram com zero pixels diferentes.
- Gate: `npm run typecheck` passou; `npm run lint` passou; `npm run format:check` passou; `npm test` passou com `Tests 340 passed`; `node scripts/ui-strings.mjs --check` passou; `node scripts/compare-prints.mjs` passou.
- Pendências: nenhuma.

## Task 2 — Remover comentários

- Adicionado `scripts/strip-comments.mjs`, com scanner do TypeScript e faixas de literais da AST para não confundir `//` em URL, regex ou template com comentário; a remoção de CSS usa PostCSS.
- Adicionada a devDependency direta `postcss@8.5.6` para a remoção sintática de comentários CSS.
- Removidos comentários de `src/`, `scripts/`, `eslint.config.js`, `vite.config.ts`, `index.html`, `Dockerfile` e `Caddyfile`; as três diretivas funcionais preservadas são `/// <reference types="vite/client" />`, `/// <reference types="vitest/config" />` e o `eslint-disable` do falso MapLibre.
- Decisão: preservei o comentário em `src/assets/material-symbols/rounded.css` — a regra 8 proíbe mexer em `src/assets/`, que contém fonte gerada. Custo se estiver errado: permanece um comentário em artefato gerado, mas a árvore de código e CSS editável fica sem comentários.
- Decisão: substituí cinco `catch` deliberadamente vazios por `void 0` — eles continham somente comentários e o ESLint proíbe bloco vazio. Custo se estiver errado: nenhum efeito observável; `void 0` é um no-op explícito.
- Verificação extra: `npx tsc --noEmit -p tsconfig.app.json` passou; a busca por `//`, `/*`, `<!--` e `#` só encontrou URLs, regex, seletores, globs, a diretiva `eslint-disable` e as duas diretivas `reference` permitidas.
- Gate: `npm run typecheck` passou; `npm run lint` passou; `npm run format:check` passou; `npm test` passou com `Tests 340 passed`; `node scripts/ui-strings.mjs --check` passou; `node scripts/compare-prints.mjs` passou.
- Pendências: nenhuma.

## Task 3 — Contrato novo da API

- Copiados `contrato-novo/openapi.json` e `contrato-novo/API.md`; `npm run gen:api` regenerou `src/infrastructure/api/schema.d.ts` a partir do contrato novo.
- Adicionado `ts-morph@27.0.2` temporariamente e criado `scripts/migrate-contract.mjs`; ele usa AST para schemas, rotas, handlers MSW e parâmetros de query. Os scripts temporários de migração saem na Task 6.
- Ruling: o campo português `data` foi migrado manualmente apenas nos itens de histórico para `date`; ele também é uma propriedade legítima do TanStack Query e do MapLibre. Custo se estiver errado: algum campo de contrato poderia ficar português; a checagem de tipos e os testes de histórico cobrem o uso efetivo.
- Ruling: os valores de filtro de histórico foram conferidos contra `API.md` e migrados para `all`, `reports` e `votes`, embora o OpenAPI os exponha como `string`. Custo se estiver errado: a filtragem poderia enviar um valor não aceito; os mocks e o fluxo de perfil exercitam os três valores.
- Ruling: algumas propriedades de modelos locais tiveram de acompanhar as propriedades do contrato para manter objetos tipados e mocks coerentes; a tradução de identificadores declarados e a organização de arquivos continuam como escopo da Task 4. Custo se estiver errado: o diff desta task contém nomes locais antecipados, mas sem mudança de comportamento externo.
- Ruling: a checagem de subset de ícones ignora os valores de contrato `filter`, `groups`, `label` e `pending`, que também são nomes Material Symbols, para não alterar a fonte gerada nem a aparência. Custo se estiver errado: um futuro ícone dinâmico com um desses quatro nomes não entrará pelo coletor genérico; usos diretos em `name="..."` continuam incluídos.
- Ruling: snapshots de `MarcadorProblema` foram atualizados exclusivamente de enums/atributos do contrato antigo para o novo; o texto renderizado permanece em português e a comparação de prints confirma o mesmo resultado visual. Custo se estiver errado: uma alteração estrutural não visual pode ficar aceita no snapshot, mas os testes de componente e o gate completo a exercitam.
- Busca obrigatória de valores antigos: as ocorrências restantes são as chaves de query de rota do app `nova` (Task 5), textos visíveis `voto`/`votos`, e o mapeamento temporário de cores inglesas do contrato para tokens CSS portugueses (Task 4). Dados de grupos, endereços, nomes e credenciais de fixture foram mantidos em português.
- Gate: `npm run typecheck` passou; `npm run lint` passou; `npm run format:check` passou; `npm test -- --reporter=dot --silent` passou com `Tests 340 passed`; `node scripts/ui-strings.mjs --check` passou; `node scripts/compare-prints.mjs` passou, sem `prints-diff/`.
- Pendências: nenhuma.

## Task 4 — Identificadores, arquivos e pastas

A partir daqui a execução passou do Codex para o Claude. O inventário do Codex (`d48aa4a`) traduzia palavra por palavra (`DetailIssuePage`, `KeepsAdmin`, `changeModo`, `auth-test.ts`) e não pegava os nomes de `useState` (`[erroGeral, setErroGeral]`); foi substituído por um mapa escrito à mão.

### Commit 1 — identificadores, valores de código e títulos de teste

- `mapa-identificadores-front.tsv`: ~1.290 nomes declarados, revisados um a um (ordem do inglês, glossário da seção 4). Linhas `arquivo|nome` são exceções locais para evitar colisão (ex.: `cadastro-page.tsx|cadastrar → registration`, porque `register` é do react-hook-form).
- Aplicado com o LanguageService do TypeScript (`findRenameLocations`), em uma passada só sobre o programa original, com três travas antes de gravar: (1) símbolo declarado fora de `src/` ou com uso fora dele não é renomeado (pegou `resolver` do react-hook-form); (2) o nome novo não pode já estar em uso no escopo nem ficar mais próximo de um uso (sombra silenciosa); (3) dois nomes diferentes não podem virar o mesmo nome no mesmo escopo ou tipo. As colisões apontadas foram resolvidas com exceções locais no mapa.
- Uma varredura extra renomeia usos que o rename semântico não alcança: propriedade de objeto curto (`return { enviar }` → `submission.send`) e acessos sobre `JSON.parse` nos testes de storage.
- `mapa-valores-front.tsv`: valores de código em string que andam junto com os nomes (uniões de literais e as chaves de objetos indexados por elas): tema `claro/escuro/automatico → light/dark/system`, modos do mapa `problemas/incidentes/ambos → issues/incidents/both`, passos e ações da guarda, query keys do TanStack Query, ids de camada e de elementos, valores internos do mock. Aplicado só a literais inteiros (AST); `Pick/Omit/Record<'campo'>` usam o mapa de identificadores.
- Query params do app: `modo → mode`, `grupos → groups`, `nova → new`, `tipo → type`, `aba → tab` (dentro dos literais de URL, via AST). Decisão: feito nesta task e não na Task 5 — os valores do modo (`ambos → both`) aparecem nas mesmas URLs, e separar deixaria um commit com URL e parser discordando. Custo se estiver errado: nenhum; a Task 5 fica só com rotas e chaves de storage.
- `mapa-titulos-teste.tsv`: 308 títulos de `describe/it/test` em inglês. Textos de tela citados entre aspas ficam em português (`"Agora não"`).
- `{ x: x }` deixados pelo rename viraram atalho `{ x }` (123 casos, via AST).
- Correções à mão, em nós isolados: script de tema no `index.html` (lê `state.preference`, grava `light/dark`), seletor `[data-tema='dark']` no CSS, template literals com substituição (`?modo=ambos`), `['get', 'peso'] → ['get', 'weight']` no calor (achado pelos prints: a camada lia uma propriedade que tinha mudado de nome), `noun="categorias"`/`"grupos"` voltaram ao português (é texto da tela montado em `"2 de 8 categorias"`; o `ui-strings` não enxerga props), test ids do MapLibre falso (`source-<id>`, `layer-<id>`), `scripts/prints.mjs` (estado gravado e URLs).
- Bug do Task 3 corrigido: o mock de `/admin/users?role=` aceitava `cidadaoverificado` em vez de `verifiedcitizen`.
- Decisão: `scripts/icones-usados.mjs` passa a ignorar `light`, `pin`, `report` e `weight` — viraram valores de código e também são nomes Material Symbols; sem isso o teste do subset exigiria baixar ícones que a tela não usa. Custo se estiver errado: um ícone dinâmico com um desses nomes não entraria no subset pelo coletor genérico.
- Decisão: o snapshot de `IssueMarker` foi regravado — mudaram só a chave (título do teste), a classe `marcador-problema → issue-marker` (não é usada no CSS) e o valor `data-faixa="nenhuma" → "none"`. Custo se estiver errado: nenhum visual; os prints são idênticos.
- Decisão: a referência `ui-strings.txt` ganhou a linha `E-mail`: o texto já existia (`<Linha titulo="E-mail">`), mas o coletor só reconhece a prop `title`, então ele passou a aparecer quando `titulo` virou `title`. Nenhum texto mudou.
- Ficam em português, por serem dados: chaves de ícone (`buraco`, `calcada`, `poste`, `fio`, `descarte`, `lixo`, `roubo`, `acidente`), chaves de grupo, nomes de pessoas das fixtures (`ana`, `mariana`), entradas digitadas nos testes (`'Provisório'`, `'curta'`), e os nomes de estilo do mapa `ocorrencias-claro/escuro`, que vêm dos arquivos gerados em `src/assets/mapa` (Task 6).
- Gate: `npm run typecheck` ok; `npm run lint` ok; `npm run format:check` ok; `npm test` → `Tests 340 passed`; `node scripts/ui-strings.mjs --check` idêntico; `node scripts/compare-prints.mjs` → prints idênticos.

### Commit 2 — arquivos e pastas

- `mapa-caminhos-front.tsv`: 231 arquivos (features pelo glossário: `mapa → map`, `problemas → issues`, `registro → report`...; `test/fluxos → test/flows`, `maplibre-falso → fake-maplibre`, `banco.ts → database.ts`). O nome do arquivo segue o export principal (`seletor-horario.tsx → time-picker.tsx`).
- Aplicado com `git mv` (o histórico segue cada arquivo) e reescrita dos especificadores de módulo via AST: `import`/`export`, `import()`, `vi.mock()` e `import('...')` em tipos, mantendo o estilo de cada um (`@/...` continua alias, relativo continua relativo).
- `eslint.config.js` e `components.json` não citam nomes de pasta de feature: nada a mudar.
- Fica para a Task 6: `src/assets/mapa/estilo-{claro,escuro}.json`, gerados por `scripts/gen-estilo-mapa.mjs` (regra 8: `src/assets/` só muda pelo gerador).
- Gate: typecheck ok; lint ok; format ok; `Tests 340 passed`; textos idênticos; prints idênticos.

### Commit 3 — tokens e classes CSS

- `src/index.css` com `postcss` (nome e valor de declarações, seletores, parâmetros de `@utility`/`@keyframes`/`@media`); `.ts/.tsx/.mjs` só dentro de literais, partes de template, nomes de atributo JSX e `element.dataset.*` (AST). Tabela da seção 4: `--primario* → --brand*`, `--superficie-* → --surface-*`, `--sombra-* → --elevation-*`, `vidro → glass`, `pressionavel → pressable`, `--nova → --new-badge`, `--voto-sim/nao → --vote-yes/no`, `--calor → --heatmap`, `--realce → --highlight`, `--cat-<cor>[-claro] → --group-<color>[-light]`, `brilho → shimmer`, `pulso-alerta → alert-pulse`, `mapa-principal → main-map` e os dez `data-*`.
- O teste "every API slot has literal Tailwind classes and the CSS token of the same name" tinha uma tabela inglês → português para achar o token; como o token agora tem o nome da cor do contrato, a tabela saiu e o teste compara direto com a cor. Mesmas três asserções por cor.
- Decisão: `ui-strings.txt` inclui as strings de `className`; as 97 linhas de classe foram reescritas passando a referência antiga pela mesma função de rename (nenhuma linha de texto mudou; a única feita à mão foi `[&_.pulso-alerta]:hidden`, que o padrão não pegava por causa do `_.`). Custo se estiver errado: nenhum; os prints confirmam.
- Snapshot de `IssueMarker` regravado: só `pulso-alerta → alert-pulse`, `var(--cat-ocre) → var(--group-ochre)` e `var(--primario-cheio) → var(--brand-solid)`.
- `index.html` (`dataset.theme`) e `scripts/contraste.test.mjs` (lê o bloco `:root[data-theme='dark']`) acompanham.
- A busca da seção 5 da Task 4 (`rg ... src scripts`) volta vazia fora de `src/assets`.
- Gate: typecheck ok; lint ok; format ok; `Tests 340 passed`; textos idênticos; prints idênticos (claro e escuro).

## Task 5 — Rotas do app e chaves de storage

- Testes escritos antes: `src/app/router.test.tsx` (24 rotas novas, cada uma renderizada com sessão de admin: sem erro de rota e sem "Página não encontrada"); `recent-store.test.ts` (chave `urbanReports.recentCategories`); `MapPage › closing the legend remembers it was seen` (`urbanReports.legendSeen`); os testes que já liam `ocorrencias.*` passaram a ler a chave nova (troca de literal exato). Rodada antes da troca: `Tests 44 failed | 322 passed (366)`.
- Troca via AST: segmentos de caminho em literais que começam com `/` (e partes de template), `path:` do `router.tsx`, chaves `ocorrencias.* → urbanReports.*`, expressões regulares (`mobile-layout.tsx`, `scripts/e2e.mjs`) e o script de tema do `index.html`. Os mocks do MSW ficaram de fora da troca de caminhos (as rotas da API já estavam em inglês).
- `scripts/e2e.mjs` também estava desatualizado desde o Task 3 (`?tipo=problema`); passou a `?type=issue` e `?type=incident`.
- Títulos de teste que citavam rotas ou endpoints antigos (`/registrar`, `GET /grupos`) acompanharam.
- Decisão: o `describe` novo se chama `'app routes'` e não `'router'`, porque `router` é nome de ícone Material Symbols e o coletor do subset de ícones lê todo literal de `src/`. Custo se estiver errado: nenhum.
- Busca da Task 5 (`rg ... src scripts`) vazia.
- Efeito para quem já usa o app: entrar de novo, escolher o tema de novo, ver a pré-permissão de novo; links antigos (`/mapa/problema/{id}`) caem na página não encontrada.
- Gate: typecheck ok; lint ok; format ok; `Tests 366 passed` (340 + 26 novos); textos idênticos; prints idênticos.

### Correções depois da Task 5 (varredura com o dicionário português)

- O detector de sobras usava o dicionário inglês do macOS, que aceita algumas palavras portuguesas (`aviso`, `vista`). Uma segunda varredura, com as palavras do `dicionario-palavras.txt` e do mapa, achou: `aviso/setAviso`, `vista/setVista`, `ultimas/setUltimas`, `AreaIncidentesDados`, `__VERSAO_APP__` (define do Vite), `pacote` (`vite.config.ts`), `importarFeaturePorDentro/importarCamadaDeCima` (`eslint.config.js`) e ids de camada do MapLibre (`calor`, `area-incidentes`).
- Três locais chamados `dados` tinham virado `unwrapData` (o nome do helper do cliente): agora `iconData` e `geoJson`.
- Achado do Task 3 (Codex): o mapa de campos trocou `tamanho → pageSize` também em props de componente (`Avatar`, `CategoryIcon`, `CenterPoint`) e em `RemoteIconData`. `pageSize` é só do contrato de paginação; essas props viraram `size`.
- Gate: typecheck ok; lint ok; format ok; `Tests 366 passed`; textos idênticos; prints idênticos.

## Task 6 — Scripts em inglês

- Arquivos: `gen-icones → gen-icons`, `icones-usados → used-icons`, `icones.test → icons.test`, `gen-estilo-mapa → gen-map-style`, `estilo-mapa(.test) → map-style(.test)`, `contraste.test → contrast.test`. `package.json`: `gen:icones → gen:icons`, `gen:estilo-mapa → gen:map-style`, nome do pacote `ocorrencias-front → urban-reports-front`.
- Identificadores dos scripts pelo mesmo mapa (LanguageService, projeto `allowJs`), com exceções locais (`prints.mjs|usuario → account`, `tela → device`). Variáveis de ambiente: `E2E_NAVEGADOR/E2E_SENHA/E2E_VISIVEL → E2E_BROWSER/E2E_PASSWORD/E2E_HEADED`, `PRINTS_NAVEGADOR/PRINTS_SENHA → PRINTS_BROWSER/PRINTS_PASSWORD`.
- Logs, títulos de teste e nomes dos prints em inglês (`01-mapa-ambos-legenda → 01-map-both-legend`, pastas `claro/escuro → light/dark`). A baseline local dos prints (fora do git) foi renomeada junto; a pasta `e2e/` que tinha ido parar na baseline (saída antiga do `npm run e2e`, não do `prints.mjs`) saiu dela.
- Decisão: os assets gerados do mapa foram movidos (`src/assets/mapa/estilo-{claro,escuro}.json → src/assets/map/{light,dark}-style.json`) e só o campo `name` mudou (`ocorrencias-claro → urban-reports-light`), lendo e regravando o JSON com a mesma formatação do gerador; não rodei o gerador porque ele baixa o estilo do OpenFreeMap e traria mudanças de upstream. `icones.json → icons.json`. Custo se estiver errado: nenhum visual (prints idênticos); o próximo `npm run gen:map-style` grava nos caminhos novos.
- `npm run gen:icons` regenerou `icons.json` idêntico (78 ícones), mas o `rounded-subset.woff2` baixado veio com bytes diferentes (o Google Fonts muda o arquivo); voltei o `.woff2` do git, como pede a regra 8.
- Removidos `ts-morph` e `postcss` (só serviam à migração) e os scripts temporários `inventory.mjs`, `migrate-contract.mjs`, `fix-contract-diagnostics.mjs`, `translate-contract-properties.mjs`, `strip-comments.mjs`. Ficam no histórico do git (último commit com eles: `274e777`). As ferramentas que usei nas Tasks 4–6 (rename com LanguageService, valores, caminhos, CSS) ficaram fora do repo; os mapas que elas aplicaram estão nesta pasta.
- `scripts/e2e.mjs`: identificadores traduzidos; as mensagens dos passos e as consultas SQL ainda citam o modelo antigo (tabelas e rotas da API em português). Fica para a Task 8, que roda o roteiro contra o back do #19.
- Gate: typecheck ok; lint ok; format ok; `Tests 366 passed`; textos idênticos; prints idênticos; `npm run build` ok.

## Task 7 — Documentação

- `CLAUDE.md`: nomes de código, pastas, rotas, chaves de storage, tokens CSS, scripts e comandos novos (`dotnet run --project src/UrbanReports.Api`, `gen:icons`, `gen:map-style`, `E2E_HEADED`, `PRINTS_BROWSER`, `Cors__Origins__0`). A regra 10 passou a ser: textos da interface em português; código, identificadores, rotas, chaves de storage e CSS em inglês; sem comentários; dados em português.
- `docs/TELAS.md` e `docs/PLAN.md`: só os trechos de código (entre crases) mudaram — rotas do app, rotas da API (estavam no contrato antigo desde o Task 3), campos e nomes. A prosa continua em português. Cada rota da API citada foi conferida com os títulos de `docs/API.md`.
- `README.md`: sem mudança de comando; saiu um `.` solto no fim.
- `docs/openapi.json` e `docs/API.md` idênticos aos de `contrato-novo/` (`cmp`).
- Gate: typecheck ok; lint ok; format ok; `Tests 366 passed`; textos idênticos; prints idênticos.

## Task 8 — Verificação final com a API real

- `scripts/e2e.mjs` acompanhou o contrato e o banco novos: rotas da API (`/issues`, `/incidents`, `/issues/recent?radiusKm&pageSize`, `/health/database`), tabelas e colunas da migration `RenameToEnglish` (`users`, `issues`, `votes`, `incidents`, `verification_requests`), rotas do app, ids (`#accepted-terms`), tema `light/dark` e mensagens em inglês. Duas sobras do rename automático corrigidas aqui: `fetchedIssues` (era a lista de respostas de erro da API → `apiErrors`) e `robberies.sevenDays` (o campo do contrato é `days7`; o rename tinha alcançado o acesso sobre um JSON sem tipo).
- Back do PR #19 (`refactor/ingles`, `docker compose up -d db` + `dotnet run --project src/UrbanReports.Api`) e `npm run dev`: **19 de 20 passos ok** — tema, marcadores, card rápido, voto como visitante → cadastro → voto retomado, registro com falha offline e "Tentar novamente", incidente, área de incidentes, perfil e histórico, edição do nome, pedido de verificação aprovado pelo admin, voto de outro cidadão, recentes, bússola. Cada escrita conferida no PostgreSQL.
- **Falha (pré-existente, não é do refactor):** "Invalid token: voting asks for login again (rule 13)". Reproduzido à parte: o `PUT /issues/{id}/vote` volta 401, o middleware limpa a sessão, e o `useSyncCacheWithSession` faz `resetQueries` do detalhe; o card do alerta desmonta e o TanStack Query descarta o `onError` passado ao `mutate`, então a folha "Entre para votar" não abre. O código é o mesmo de antes do refactor (`git show b6782fc:src/features/auth/hooks/use-sincronizar-cache.ts`, introduzido em `bfe5411`, 20/10). Não corrigi: é mudança de comportamento (regra 11) e fica para o dono decidir. O passo do painel desktop não rodou porque o roteiro para na primeira falha; o painel desktop está nos prints (`11-desktop-map-panel`).
- Conferência à mão com a API real (Playwright, admin): `/admin/categories` (claro, desktop) com as cores de grupo certas e `/admin/users` (escuro, celular), sem nenhuma resposta de erro da API.
- Gate final: typecheck ok; lint ok; format ok; `Tests 366 passed` (340 + 26); textos idênticos; prints idênticos; `npm run build` ok.

Pronto para revisão.
