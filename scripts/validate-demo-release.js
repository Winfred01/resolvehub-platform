const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const failures = [];

function filePath(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath) {
  return fs.readFileSync(filePath(relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function requireFile(relativePath) {
  if (!fs.existsSync(filePath(relativePath))) {
    failures.push(`Missing required demo release file: ${relativePath}`);
  }
}

function requireText(relativePath, expectedText) {
  const text = read(relativePath);
  if (!text.includes(expectedText)) {
    failures.push(`${relativePath} must include ${expectedText}`);
  }
}

function requireNoSensitiveCredentialFields(value, pointer = "$") {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => requireNoSensitiveCredentialFields(entry, `${pointer}[${index}]`));
    return;
  }

  if (!value || typeof value !== "object") return;

  for (const [key, nested] of Object.entries(value)) {
    if (/password|secret|token|cookie|session/i.test(key)) {
      failures.push(`tests/demo-seed-data.json must not include credential field ${pointer}.${key}`);
    }
    requireNoSensitiveCredentialFields(nested, `${pointer}.${key}`);
  }
}

for (const relativePath of [
  "tests/demo-seed-data.json",
  "docs/demo-release-guide.md",
  "docs/v0.1-release-notes.md",
  "docs/demo-plan.md",
  "docs/deployment-plan.md",
  "docker-compose.yml",
]) {
  requireFile(relativePath);
}

if (failures.length === 0) {
  const seed = readJson("tests/demo-seed-data.json");

  if (seed.issue !== 27) failures.push("tests/demo-seed-data.json must target Issue #27");
  if (seed.roadmapMode !== "PORTFOLIO_FIRST_V0_1") {
    failures.push("tests/demo-seed-data.json must target PORTFOLIO_FIRST_V0_1");
  }
  if (seed.fictionalDataOnly !== true) {
    failures.push("tests/demo-seed-data.json must explicitly require fictional data only");
  }
  if (seed.resettable !== true) {
    failures.push("tests/demo-seed-data.json must document a resettable demo dataset");
  }

  const roles = new Set((seed.accounts ?? []).map((account) => account.role));
  for (const role of ["REQUESTER", "SUPPORT_AGENT", "TEAM_LEAD", "ADMIN"]) {
    if (!roles.has(role)) failures.push(`tests/demo-seed-data.json missing ${role} demo account`);
  }

  for (const account of seed.accounts ?? []) {
    if (!String(account.email ?? "").endsWith("@example.test")) {
      failures.push(`Demo account ${account.id ?? "unknown"} must use example.test email`);
    }
    if (account.credentialSource !== "generated-at-demo-reset") {
      failures.push(`Demo account ${account.id ?? "unknown"} must use generated demo credentials`);
    }
  }

  if ((seed.tickets ?? []).length < 4) {
    failures.push("tests/demo-seed-data.json must include at least four fictional tickets");
  }

  for (const ticket of seed.tickets ?? []) {
    if (ticket.fictional !== true) {
      failures.push(`Demo ticket ${ticket.id ?? "unknown"} must be marked fictional`);
    }
  }

  requireNoSensitiveCredentialFields(seed);

  requireText("docker-compose.yml", "frontend:");
  requireText("docker-compose.yml", "healthcheck:");
  requireText("docker-compose.yml", "/api/health");
  requireText("docker-compose.yml", "/analytics/health");
  requireText("docker-compose.yml", "BACKEND_PORT:-18080");
  requireText("docker-compose.yml", "POSTGRES_PORT:-15432");

  for (const doc of ["docs/demo-release-guide.md", "docs/v0.1-release-notes.md"]) {
    requireText(doc, "PORTFOLIO_FIRST_V0_1");
    requireText(doc, "Issue #27");
    requireText(doc, "fictional");
    requireText(doc, "docker compose up --build");
    requireText(doc, "docker compose down --volumes");
    requireText(doc, "http://localhost:5173");
    requireText(doc, "http://localhost:18080/api/health");
    requireText(doc, "http://localhost:8000/analytics/health");
    requireText(doc, "15432");
    requireText(doc, "#23");
    requireText(doc, "#24");
    requireText(doc, "#25");
  }

  requireText("docs/deployment-plan.md", "tests/demo-seed-data.json");
  requireText("docs/demo-plan.md", "generated-at-demo-reset");
  requireText(".github/workflows/ci.yml", "Validate Issue #27 demo release package");
}

if (failures.length > 0) {
  console.error("Demo release validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Demo release validation passed.");
