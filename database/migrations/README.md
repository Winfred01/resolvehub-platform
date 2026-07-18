# Future Migrations

This folder is a planning marker for the database workstream. Runtime Flyway SQL
migrations should live under `backend/src/main/resources/db/migration/` once the
backend adds PostgreSQL and Flyway dependencies.

No migration SQL files are committed in Issue #6. The first implementation
migration should be created in a later scoped issue after schema ownership,
rollback expectations, and local test database behavior are reviewed.
