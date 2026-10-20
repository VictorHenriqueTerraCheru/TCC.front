# Telas da aplicação

Numeração igual à do protótipo (`docs/design/`), que mostra a versão **mobile**. Os prints continuam valendo para **conteúdo e fluxo**; o visual (tema escuro, vidro, mapa vetorial, alertas em balão e o card rápido do detalhe) segue `docs/superpowers/specs/2026-10-17-redesign-mapa-vetorial-design.md`. Rotas são sugestões para o React Router. A variação desktop está no fim deste arquivo.

| # | Tela | Rota | Print | Endpoints |
|---|---|---|---|---|
| 1 | Mapa — Problemas | `/mapa` | 01-04 | `GET /problemas`, `GET /categorias` |
| 2 | Mapa — Ambos (com legenda "Como ler o mapa") | `/mapa?modo=ambos` | 01-04 | `GET /problemas`, `GET /incidentes/calor` |
| 3 | Detalhe de problema (folha inferior) | `/mapa/problema/:id` | 01-04 | `GET /problemas/{id}`, `PUT .../voto` |
| 4 | Área de incidentes (folha inferior) | `/mapa/area?lat&lng` | 01-04 | `GET /incidentes/area`, `GET /geocodificacao/reversa` |
| 5 | Registrar — Tipo e categoria (passo 1 de 4) | `/registrar` (tipo) → `/registrar/categoria?tipo=` | 05-08 | `GET /categorias`, `GET /grupos` |
| 6 | Registrar — Local (passo 2) | `/registrar/local` | 05-08 | `GET /geocodificacao/reversa` |
| 7 | Registrar — Duplicata (passo 3) | `/registrar/conferencia` | 05-08 | `GET /problemas/duplicatas`, `PUT .../voto` (sim) |
| 8 | Registrar — Revisão (passo 4) | `/registrar/revisao` | 05-08 | `POST /problemas` |
| 9 | Recentes | `/recentes` | 09-13 | `GET /problemas/recentes` |
| 10 | Perfil — Cidadão | `/perfil` | 09-13 | `GET /me`, `GET /me/historico?tamanho=3` |
| 11 | Solicitar verificação (com banner da última recusa) | `/perfil/verificacao` | 09-13 | `POST /verificacoes` |
| 12 | Perfil — Verificado | `/perfil` | 09-13 | `GET /me` |
| 13 | Admin — Fila de verificação (abas Pendentes/Aprovadas/Recusadas) | `/admin/verificacoes` | 09-13 | `GET /admin/verificacoes`, `POST .../aprovar`, `POST .../recusar` |
| 14 | Visitante — "Entre para registrar" (folha) | modal | 05-08 | — |
| 15 | Cadastro | `/cadastro` | 15-16 | `POST /auth/cadastro` |
| 16 | Login | `/login` | 15-16 | `POST /auth/login` |
| 17 | Pedido de localização (pré-permissão, antes do pedido do navegador) | `/permissao-localizacao` | 17-19 | — |
| 18 | Mapa — localização negada (banner + botão de GPS riscado) | `/mapa` | 17-19 | — |
| 19 | Detalhe — localização negada (aviso no rodapé) | `/mapa/problema/:id` | 17-19 | — |
| 20 | Sucesso — Problema | `/registrar/sucesso` | 20-21c | — |
| 21a | Incidente — Local + "Quando aconteceu?" (passo 2 de 3) | `/registrar/incidente/local` | 20-21c | `GET /geocodificacao/reversa` |
| 21b | Incidente — Revisão (passo 3 de 3) | `/registrar/incidente/revisao` | 20-21c | `POST /incidentes` |
| 21c | Incidente — Sucesso | `/registrar/incidente/sucesso` | 20-21c | (resposta do POST) |
| 22 | Detalhe — Nova (em avaliação: "2 de 5 votos") | `/mapa/problema/:id` | 22-24 | `GET /problemas/{id}` |
| 23 | Detalhe — Possivelmente resolvida ("Ainda está lá?" em destaque) | `/mapa/problema/:id` | 22-24 | idem |
| 24 | Mapa — legenda "Estado do problema" | `/mapa` | 22-24 | — |
| 25 | Mapa vazio ("Nenhuma ocorrência nesta área" + "Ver área maior") | `/mapa` | 25-27 | — |
| 26 | Falha ao enviar (diálogo sobre a revisão, dados preservados) | modal | 25-27 | — |
| 27 | Visitante — "Entre para votar" (folha) | modal | 25-27 | — |
| 28 | Configurações (conta, permissão de localização, sobre, sair) | `/perfil/configuracoes` | 28-29 | `PATCH /me` — o botão "Abrir configurações do Android" do protótipo vira "Como liberar a localização" (o navegador não abre as configurações do sistema) |
| 30 | Admin — Categorias e grupos (seções Categorias/Grupos; formulário em folha com seletor de ícone) | `/admin/categorias` | — (sem print) | `GET /admin/categorias`, `POST/PUT /admin/categorias`, `PATCH .../ativa`, `GET /grupos`, `POST/PUT/DELETE /admin/grupos`; o seletor de ícone busca em `api.iconify.design/search` |
| 29 | Histórico completo (Tudo / Registros / Votos, agrupado por Hoje/Ontem/Esta semana) | `/perfil/historico` | 28-29 | `GET /me/historico` |

## Comportamentos que não estão óbvios no print

- **Tela 5 — tipo e categoria**: `/registrar` pergunta "Isso continua lá?" e oferece dois cartões: **Estado** (continua lá até ser resolvido = problema) e **Evento** (aconteceu e passou = incidente) e tocar num cartão já avança. `/registrar/categoria?tipo=` lista só as categorias do tipo, agrupadas por grupo (seções na ordem da API, grade de 3 colunas), com busca sem acento, "Recentes" (neste aparelho, `localStorage`) e chips para pular entre grupos. Grupos e categorias vêm da API: o que o admin criar aparece sem mudar o app.
- **Tela 30 — admin de categorias**: o tipo da categoria e do grupo não muda depois de criado; só se apaga grupo sem categorias; desativar categoria a esconde sem apagar o histórico. O ícone é um nome Material Symbols; se não estiver no pacote embutido, o app busca aquele SVG no Iconify na primeira vez e guarda em cache.
- **Tela 1/2/24 — seletor Problemas | Incidentes | Ambos**: Problemas mostra só marcadores; Incidentes só calor; Ambos os dois. Os chips de filtro mudam conforme o modo (grupos de problema × grupos de incidente). O chip de ampulheta filtra "Em avaliação" (`status=nova`).
- **Tela 3 — detalhe Ativa**: barra "Confiança alta · 82/100"; o texto "Calculada com N votos, ponderados por proximidade e histórico de quem votou" usa `votos.sim + votos.nao`. Uma pergunta só, "Ainda está lá?" ("Sim, está lá" / "Não está lá", `PUT /problemas/{id}/voto`): a API usa a mesma resposta na confiança e no ciclo de vida. O botão de `meuVoto` fica marcado. Se `souAutor`, não há botões, só a dica "Você registrou este problema".
- **Tela 22 — Nova**: em vez da confiança, "Em avaliação · X de 5 votos" com barra segmentada; o cartão azul faz a mesma pergunta ("Você está a 90 m. Ainda está lá?"). Os "não" dados em Nova contam para a resolução quando o problema sai de Nova.
- **Tela 23 — Possivelmente resolvida**: o cartão azul usa `votos.naoUltimas24h` ("7 pessoas disseram que não está mais lá nas últimas 24 h").
- **Rodapé verde "Você está a X m — seu voto pesa mais por estar perto"** só aparece quando a distância é ≤ 2 000 m e a localização está permitida; acima disso, não mostra nada; sem permissão, mostra o aviso da tela 19.
- **Tela 7 — duplicata**: só aparece se `GET /problemas/duplicatas` devolver itens. "Sim, confirmar esse" vota "sim" no problema existente e vai para a tela de sucesso com o texto adaptado ("Sua confirmação foi registrada"). "Não, é outro" segue para a revisão.
- **Tela 21a**: "Agora" / "Há 1 hora" / "Outro horário" (stepper de 15 min, limitado a 24 h atrás). A área é um círculo fixo de 150 m sobre o centro do mapa; o texto "O ponto exato não é salvo nem exibido" é verdade porque a API arredonda.
- **Tela 21c**: o resumo usa o `rotuloArea` de `GET /geocodificacao/reversa` do centro + "Roubos · N relatos nos últimos 7 dias" vindo da resposta do POST.
- **Tela 11**: o contador `0/500` e a validação "escreva pelo menos 30 caracteres" são locais; o banner vermelho aparece se `GET /me` trouxer `verificacao.status = recusada`.
- **Tela 13**: só acessível se `perfil == administrador` (o item aparece no Perfil apenas para admin). Recusar abre o campo "Motivo da recusa" inline, obrigatório.
- **Tela 17**: mostrar antes do pedido do navegador, na primeira abertura (flag em `localStorage`). "Continuar" chama `navigator.geolocation.getCurrentPosition`; "Agora não" segue sem pedir. Se a Permissions API já disser `granted` ou `denied`, pule a tela.
- **Telas 18/19 — localização negada**: "Ativar" chama o pedido do navegador se o estado for `prompt`; se for `denied`, abre a ajuda "Como liberar a localização" (o navegador não reabre o pedido).
- **Tela 26**: em falha de rede/timeout no envio (`TypeError` do fetch ou `AbortError`), exibir o diálogo; erros 4xx de regra mostram a mensagem do `type` (ver `API.md`). Use `navigator.onLine` só como dica, não como verdade.
- **Tela 4 — abrir a área**: no modo Incidentes ou Ambos, toque no mapa fora de marcador → `GET /incidentes/area` naquele ponto; se a soma de `dias7` for 0, não abre nada (no máximo um *toast* "Sem incidentes por aqui nos últimos 7 dias").
- **Tela 6 — endereço**: enquanto a consulta de geocodificação roda, mostre um *skeleton* no cartão "Endereço aproximado"; se vier `disponivel: false`, mostre o texto de fallback e permita continuar.

## Variação desktop (≥ 1024 px)

Não há print do protótipo para o desktop; siga estas regras e mantenha os mesmos componentes do mobile.

| Mobile | Desktop |
|---|---|
| Barra inferior Mapa / Recentes / Perfil | Trilho de navegação vertical à esquerda (72 px), com os mesmos três itens + "Registrar" como botão de destaque |
| Folha inferior (detalhe, área, legenda) | Painel lateral de 420 px sobre o mapa, à esquerda (ao lado do trilho), com botão de fechar |
| Fluxo de registro em tela cheia | Mesmo fluxo dentro do painel lateral; o mapa à direita serve para posicionar o pino |
| Seletor Problemas/Incidentes/Ambos e chips no topo | Mesmo lugar, sobre o mapa, alinhados à direita do painel |
| Recentes, Perfil, Histórico, Configurações, Fila do admin | Páginas centralizadas (`max-w-3xl`), sem o mapa |
| Folhas "Entre para votar/registrar" | `Dialog` centralizado |

A demonstração na banca provavelmente será em projetor: confira a legibilidade em 1366×768 e 1920×1080.
