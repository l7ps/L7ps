# Server (Node + Express + Prisma)

Rotas principais:
- `POST /api/partners/sync`: dispara sincronização da API externa
- `GET /api/partners`: lista com filtros/paginação
- `GET /api/partners/stats`: estatísticas agregadas
- `GET /api/partners/:id`: detalhe (por `id` local ou `remoteId`)

Ajuste `server/.env` para apontar corretamente aos endpoints e autenticação da API Vida Cotidiana.