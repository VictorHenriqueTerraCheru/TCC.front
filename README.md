# Ocorrências urbanas — front web

Front em React + TypeScript do TCC "Sistema colaborativo de registro e validação de ocorrências urbanas" (Unilasalle-RJ). Consome a API do repositório `TCC.back`.

```bash
npm install
npm run dev                       # http://localhost:5173 (proxy /api → http://localhost:5080)
VITE_USE_MOCKS=true npm run dev   # sem a API, com MSW
npm test && npm run lint && npm run build
```

Arquitetura, regras e documentos: [`CLAUDE.md`](CLAUDE.md) e [`docs/`](docs/).
