const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function fail(message) {
  throw new Error(message);
}

function requireFile(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) fail(`Missing required file: ${relativePath}`);
  const text = read(relativePath);
  if (!text.trim()) fail(`Blank required file: ${relativePath}`);
  return text;
}

const migrationStrategy = requireFile("docs/database-migration-strategy.md");
const schemaPlan = requireFile("docs/database-schema.md");
const databaseReadme = requireFile("database/README.md");
const migrationsReadme = requireFile("database/migrations/README.md");

const requiredPhrases = [
  [migrationStrategy, "Flyway"],
  [migrationStrategy, "backend/src/main/resources/db/migration/"],
  [migrationStrategy, "RESOLVEHUB_DB_HOST"],
  [migrationStrategy, "token hashes only"],
  [schemaPlan, "Migration Readiness"],
  [databaseReadme, "Future Migration Smoke Command"],
  [migrationsReadme, "No migration SQL files are committed in Issue #6"],
];

for (const [text, phrase] of requiredPhrases) {
  if (!text.includes(phrase)) fail(`Missing database foundation phrase: ${phrase}`);
}

const migrationSqlFiles = [];
const runtimeMigrationDir = path.join(repoRoot, "backend", "src", "main", "resources", "db", "migration");
if (fs.existsSync(runtimeMigrationDir)) {
  for (const entry of fs.readdirSync(runtimeMigrationDir)) {
    if (/\.sql$/i.test(entry)) migrationSqlFiles.push(entry);
  }
}

if (migrationSqlFiles.length > 0) {
  fail(`Issue #6 must not add runtime SQL migrations: ${migrationSqlFiles.join(", ")}`);
}

console.log(JSON.stringify({
  ok: true,
  migration_tool: "Flyway",
  runtime_migration_sql_files: migrationSqlFiles.length,
  strategy_doc: "docs/database-migration-strategy.md",
}, null, 2));
