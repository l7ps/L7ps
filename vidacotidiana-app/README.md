# Vida Cotidiana - Dashboard de Parceiros (Web)

Aplicação web para conectar à API da Vida Cotidiana (Rede Credenciada), sincronizar dados de parceiros localmente (SQLite) e apresentar um dashboard com filtros, busca e gráficos. Sem Python. Frontend em React (Vite + Tailwind) e backend em Node.js/Express com Prisma/SQLite.

## Visão Geral
- Backend (`server`):
  - Rotas: sincronizar parceiros da API externa, listar/filtrar parceiros, detalhes e estatísticas agregadas.
  - Banco local: SQLite via Prisma (arquivo no seu PC). Não apaga dados; apenas insere ou atualiza (upsert) por `remoteId`.
  - Autenticação da API externa configurável: `basic` (usuário/senha) ou `bearer` (token).
- Frontend (`web`):
  - Dashboard com KPIs, filtros, tabela paginada e gráficos por UF e especialidade.

## Requisitos (Windows)
- Node.js LTS (18+ ou 20+): instale pelo site oficial
- Git (opcional)

## Configuração
1) Clone ou copie esta pasta `vidacotidiana-app` para o seu PC.

2) Backend
- Edite `server/.env` (crie a partir de `.env.example`):
```
# URL base da API externa (ajuste se necessário)
VIDA_BASE_URL=https://apiredecredenciada.vidacotidiana.com.br
# Caminho do endpoint de parceiros (copie exatamente da documentação)
VIDA_PARTNERS_ENDPOINT=/api/partners
# Tipo de autenticação: basic ou bearer
VIDA_AUTH_TYPE=basic
# Para basic
VIDA_USERNAME=
VIDA_PASSWORD=
# Para bearer (opcional)
# VIDA_BEARER_TOKEN=

# Paginação (se a API usar)
VIDA_PAGE_PARAM=page
VIDA_SIZE_PARAM=per_page
VIDA_PAGE_START=1
VIDA_PAGE_SIZE=100

# Banco local SQLite
DATABASE_URL=file:./data.db
# Porta do backend
PORT=4000
# Permitir CORS do frontend
CORS_ORIGIN=http://localhost:5173
```

- Instale dependências e gere o banco:
```
cd server
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

3) Frontend
- Configure a URL do backend:
```
cd ../web
copy .env.example .env  (no PowerShell use: copy .env.example .env)
```
Abra `.env` e ajuste se necessário:
```
VITE_API_BASE_URL=http://localhost:4000
```
- Instale e rode:
```
npm install
npm run dev
```
Acesse o frontend em: http://localhost:5173

## Fluxo de uso
- No frontend, clique em "Sincronizar agora" para buscar da API externa.
- Os dados são salvos em `server/data.db` (SQLite). Não são apagados; apenas inseridos/atualizados.
- Use os filtros (busca livre, UF, especialidade) e a tabela paginada.

## Observações sobre a API externa
- Verifique na documentação o caminho exato do endpoint de parceiros e o método de autenticação. Ajuste as variáveis em `server/.env`.
- Caso a API use outras chaves de paginação (ex.: `pageNumber`, `pageSize`), atualize `VIDA_PAGE_PARAM`, `VIDA_SIZE_PARAM`.
- Se a API suportar filtro incremental por data de atualização, você pode definir `updatedAfter` na query: ajuste em `vidaApiClient.ts` conforme a doc.

## Scripts úteis
Backend (`server`):
- `npm run dev`: inicia servidor com reload
- `npm run build && npm start`: build e start
- `npx prisma studio`: UI do banco local

Frontend (`web`):
- `npm run dev`: inicia o Vite
- `npm run build && npm run preview`: build e preview

## Estrutura
- `server/src/routes/partners.ts`: rotas de consulta e sync
- `server/src/services/partnerSyncService.ts`: rotina de sincronização/upsert
- `server/src/services/vidaApiClient.ts`: cliente HTTP da API externa
- `server/prisma/schema.prisma`: modelo de dados
- `web/src/components/*`: UI (Dashboard, Tabela, Filtros)

## Segurança
- Não commit suas credenciais em repositórios públicos.
- Mantenha credenciais em `.env` e armazene com cuidado.

## Suporte
Se a resposta da API tiver formato diferente, ajuste o mapeamento em `partnerSyncService.ts` (função `mapToPartner`).