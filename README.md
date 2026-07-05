# Todo App Backend

This repository contains the backend microservices only:

- `api-gateway` on port `4000`
- `auth-service` on port `4001`
- `todo-service` on port `4002`
- `docker-compose.yml` for local orchestration

The frontend has been split into its own repository.

## Local Run

Install dependencies:

```bash
npm install
npm run install:all
```

Start the backend stack:

```bash
npm run dev
```

## API

Gateway base URL:

```txt
http://localhost:4000
```

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`

Todos require `Authorization: Bearer <token>`:

- `GET /api/todos`
- `POST /api/todos`
- `PATCH /api/todos/:id`
- `DELETE /api/todos/:id`
