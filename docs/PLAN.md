# Plano de implementação — Front web (React)

Cada etapa termina com `npm run lint` e `npm test` verdes, `npm run build` sem erro e um commit. **A API já está pronta** (ver "API local" no `CLAUDE.md`): desenvolva contra ela. O **MSW** (`VITE_USE_MOCKS=true`) fica para os testes e para trabalhar sem o back; os handlers seguem o `docs/API.md` e as fixtures imitam os prints.

---

## Etapa 0 — Esqueleto (≈ ½ dia)
- `npm create vite@latest` (React + TypeScript), Tailwind v4, shadcn/ui inicializado, ESLint + Prettier, Vitest + Testing Library, MSW.
- Tokens de tema (seção Tema do `CLAUDE.md`), fonte Roboto, Material Symbols.
- React Router com dois layouts: `MobileLayout` (barra inferior) e `DesktopLayout` (trilho lateral), escolhidos por `useMediaQuery('(min-width: 1024px)')`. Rotas Mapa / Recentes / Perfil vazias.
- `api/client.ts` com openapi-fetch, `VITE_API_URL`, middleware JWT (com a regra 13 do `CLAUDE.md`: `401` → limpa a sessão) e `ApiError`. Script `gen:api` gerando `src/infrastructure/api/schema.d.ts` a partir de `docs/openapi.json`; não escreva tipos à mão.
- Proxy do Vite `/api → http://localhost:5080` e `VITE_API_URL=/api/v1` (`.env.development`).
- GitHub Actions: lint + test + build.

**Aceite:** a aplicação abre no celular e no desktop com a navegação certa para cada largura; `GET /categories` da API real aparece numa tela de teste via o cliente tipado.

## Etapa 1 — Mapa (≈ 2 dias) — telas 1, 2, 24, 25, 18
- react-leaflet com tiles OSM e atribuição; centraliza na posição atual ou, sem permissão, em Icaraí, Niterói (-22.905, -43.109).
- Hook `useGeolocation` (Permissions API + `watchPosition`, estados `prompt | granted | denied | unavailable`).
- Seletor de modo, chips de filtro, `moveend` com *debounce* → `GET /issues` e `GET /incidents/heatmap` via TanStack Query, com o retângulo limitado às coordenadas válidas (regra 15).
- `IssueMarker` (divIcon) com as variações de faixa/status — teste de snapshot de cada variação.
- Camada de calor (leaflet.heat), legendas "Como ler o mapa" e "Estado do problema", estado vazio (25), banner de localização negada (18), FAB/botão "Registrar".

**Aceite:** com o MSW, o mapa fica igual aos prints 1, 2, 24 e 25 no celular (390 px) e funciona no desktop.

## Etapa 2 — Detalhes (≈ 1–2 dias) — telas 3, 4, 19, 22, 23
- `ResponsivePanel` (vaul no mobile, painel lateral no desktop).
- Detalhe do problema nas três variações (Ativa, Nova, Possivelmente resolvida) e área de incidentes (toque no mapa nos modos Incidentes/Ambos).
- Votos com `useMutation` (atualização otimista, *rollback* em erro, invalida o detalhe e os marcadores), enviando `lat/lng` quando houver permissão.
- Rodapé de distância/peso e aviso de localização negada.

**Aceite:** testes das três variações e do estado `isAuthor`.

## Etapa 3 — Autenticação e guarda (≈ 1 dia) — telas 14, 15, 16, 27, 17
- Cadastro e login com React Hook Form + Zod (e-mail, senha ≥ 8, termos), sessão no Zustand persistida.
- Guarda de ação: guardar a ação pendente (ex.: `{ type: 'vote', issueId, value }`), abrir a folha/diálogo "Entre para ...", executar a ação após o login e voltar à rota de origem.
- Pré-permissão de localização (17) e ajuda "Como liberar a localização".

**Aceite:** visitante tenta votar → login → volta ao detalhe com o voto aplicado.

## Etapa 4 — Registro (≈ 2 dias) — telas 5–8, 20, 21a–c, 26
- Rascunho do registro no Zustand com `persist` em `sessionStorage` (sobrevive a recarregar a página e à falha de envio).
- Pino fixo no centro do mapa; endereço por `GET /geocoding/reverse` com *debounce*; precisão do GPS (`coords.accuracy`).
- Conferência de duplicatas, revisão com descrição (contador 0/280), sucesso.
- Incidente em 3 passos com o seletor de horário ("Agora" = agora − 1 min; "Outro horário" até 23 h 45 atrás, regra 16) e o aviso de anonimato.
- Diálogo de falha (26) com "Tentar novamente".

**Aceite:** com a API real, registrar dois buracos a 30 m dispara a tela de duplicata; recarregar a página no meio do fluxo não perde o rascunho.

## Etapa 5 — Recentes, perfil, verificação, admin, histórico, configurações (≈ 2 dias) — telas 9–13, 28, 29
- Recentes com filtros e paginação infinita (`useInfiniteQuery`).
- Perfil cidadão/verificado, solicitar verificação (banner de recusa), fila do admin com abas e recusa com motivo (rota protegida por perfil).
- Histórico agrupado por Hoje/Ontem/Esta semana/Anteriores; configurações (editar nome, ajuda de localização, sair).

**Aceite:** cidadão solicita → admin aprova → perfil mostra "Perfil verificado".

## Etapa 6 — Responsivo, acabamento, deploy e prints do TCC (≈ 1–2 dias)
- Revisar cada tela no mobile lado a lado com os prints de `docs/design/` e conferir o desktop em 1366×768 e 1920×1080.
- `manifest.webmanifest` e ícones (permite "Adicionar à tela inicial"); sem *service worker* de cache de dados (offline está fora do escopo).
- Deploy no Railway, no mesmo projeto da API: `Dockerfile` (build com Node, servido pelo Caddy com *fallback* de SPA para `index.html`); HTTPS pelo domínio do Railway. `VITE_API_URL` (argumento de build) apontando para a API publicada; o domínio do front vai em `Cors__Origins__0` da API.
- Script `npm run prints` (Playwright) contra o ambiente publicado, com dados de seed realistas e sem dados pessoais reais, capturando para a Seção 5.3.3 do TCC: Mapa (Ambos, com legenda), Detalhe (Alta), Detalhe (Nova), Área de incidentes, Registro de problema (com duplicata), Registro de incidente, Recentes, Perfil + Verificação, Fila do admin, Cadastro/Login — em 390×844 — e o Mapa com painel lateral em 1440×900.

**Aceite:** pelo navegador do celular, a aplicação publicada cria conta, registra, vota e vê o mapa; os 11 prints estão gerados.
