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

- Criado `scripts/inventory.mjs` com `ts-morph`. Ele coleta declarações, títulos de `describe`/`it`/`test` e caminhos de `src/` e `scripts/`, e gera `mapa-identificadores-front.tsv` a partir do dicionário do plano.
- Decisão: o arquivo versionado neste commit é o inventário inicial, não a aplicação do mapa — a primeira tentativa semântica revelou que uma tradução palavra a palavra confunde propriedades de bibliotecas/contrato com identificadores próprios. Custo se estiver errado: a Task 4 leva mais tempo porque a lista precisa de revisão explícita por símbolo, mas evita quebrar serialização, props externas ou dados em português.
- Pendências: revisão explícita do mapa antes de sua aplicação semântica, movimentação de arquivos/pastas, tradução dos títulos de teste e migração AST/PostCSS de CSS nesta task.
