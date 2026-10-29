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
