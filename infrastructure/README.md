# Infrastructure

Infrastructure workspace for local Docker, CI, and deployment planning. No cloud
resources or production deployment are created in this repository stage.

## Local Docker Topology

The root `docker-compose.yml` defines a local development topology for:

- `frontend`: React/Vite development server on `localhost:5173`.
- `backend`: Spring Boot API on `localhost:8080`.
- `analytics`: FastAPI analytics scaffold on `localhost:8000`.
- `postgres`: local PostgreSQL container on `localhost:5432`.

The backend currently uses its local H2 configuration from the implemented MVP
slice. The PostgreSQL container is present so the planned local topology and
future migration work have a safe placeholder database service without adding
production credentials or schema changes.

## Safe Local Values

Use `.env.example` as the placeholder reference only:

```bash
cp .env.example .env
```

Keep `.env` local and do not commit real passwords, tokens, cookies, sessions,
Gmail content, browser data, job-search data, private user data, or production
connection strings.

## Commands

Validate the Compose file without starting containers:

```bash
docker compose config
```

Start the local stack:

```bash
docker compose up --build
```

Stop the local stack:

```bash
docker compose down
```

Remove local container data if a full reset is needed:

```bash
docker compose down --volumes
```

## Smoke Checks

After startup, verify the scaffold services:

```bash
curl http://localhost:5173
curl http://localhost:8080/api/health
curl http://localhost:8000/analytics/health
docker compose exec postgres pg_isready -U resolvehub_local -d resolvehub
```

## Non-Goals

- No production deployment.
- No cloud resources.
- No container publishing.
- No committed real secrets.
- No migration or seed-data implementation in this issue.
