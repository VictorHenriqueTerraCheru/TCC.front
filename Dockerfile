# ---------- Etapa 1: compilar ----------
FROM node:22-alpine AS build
WORKDIR /app

# Primeiro só as dependências: se o package-lock.json não mudar, o Docker reaproveita o npm ci (cache)
COPY package.json package-lock.json ./
RUN npm ci

# Endereço da API, gravado no JavaScript na hora do build (o Vite troca import.meta.env.VITE_API_URL pelo valor).
# No Railway vem da variável de mesmo nome do serviço; mudou a variável, precisa de um novo deploy.
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build

# ---------- Etapa 2: servir ----------
FROM caddy:2.10-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv

EXPOSE 8080
