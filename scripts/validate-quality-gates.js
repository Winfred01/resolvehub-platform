const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const manifestPath = path.join(root, "tests", "quality-gates.json");
const ciPath = path.join(root, ".github", "workflows", "ci.yml");
const packagePath = path.join(root, "frontend", "package.json");
const e2eSpecPath = path.join(root, "frontend", "tests", "e2e", "portfolio-smoke.spec.ts");
const backendSourceRoot = path.join(root, "backend", "src", "main", "java");
const frontendSourceRoot = path.join(root, "frontend", "src");

const failures = [];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function requireFile(filePath) {
  if (!fs.existsSync(filePath)) {
    failures.push(`Missing required quality-gate file: ${path.relative(root, filePath)}`);
  }
}

function requireText(filePath, expectedText) {
  const body = fs.readFileSync(filePath, "utf8");
  if (!body.includes(expectedText)) {
    failures.push(`${path.relative(root, filePath)} must include ${expectedText}`);
  }
}

function listFiles(directory, predicate) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return listFiles(entryPath, predicate);
    }

    return predicate(entryPath) ? [entryPath] : [];
  });
}

requireFile(manifestPath);
requireFile(e2eSpecPath);

const manifest = readJson(manifestPath);
const gateNames = new Set((manifest.requiredGates ?? []).map((gate) => gate.name));
for (const gateName of [
  "frontend-accessibility",
  "e2e-browser-smoke",
  "backend-security",
  "privacy-metadata"
]) {
  if (!gateNames.has(gateName)) {
    failures.push(`tests/quality-gates.json is missing ${gateName}`);
  }
}

if (manifest.roadmapMode !== "PORTFOLIO_FIRST_V0_1") {
  failures.push("tests/quality-gates.json must target PORTFOLIO_FIRST_V0_1");
}

if (manifest.fictionalDataOnly !== true) {
  failures.push("tests/quality-gates.json must explicitly require fictional data only");
}

if ((manifest.manualKeyboardSmoke ?? []).length < 5) {
  failures.push("tests/quality-gates.json must document the manual keyboard smoke checklist");
}

const frontendPackage = readJson(packagePath);
if (frontendPackage.scripts?.e2e !== "playwright test") {
  failures.push("frontend/package.json must expose npm run e2e");
}

requireText(ciPath, "Validate Issue #26 quality gate inventory");
requireText(ciPath, "Run Playwright E2E smoke");
requireText(e2eSpecPath, "Laptop dock fails in demo lab");
requireText(e2eSpecPath, "Status distribution");

const forbiddenPatterns = [
  /gmail/iu,
  /cookie/iu,
  /resume/iu,
  /job-search/iu,
  /private address/iu,
  /phone number/iu
];
const scannedFiles = [manifestPath, e2eSpecPath];
for (const filePath of scannedFiles) {
  const body = fs.readFileSync(filePath, "utf8");
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(body)) {
      failures.push(`${path.relative(root, filePath)} contains forbidden private-data wording`);
    }
  }
}

const unsafeLoggingPatterns = [
  /System\.out\.print/iu,
  /System\.err\.print/iu,
  /printStackTrace\s*\(/iu,
  /console\.log\s*\(/iu,
  /console\.error\s*\(/iu,
  /console\.warn\s*\(/iu
];
const sourceFiles = [
  ...listFiles(backendSourceRoot, (filePath) => filePath.endsWith(".java")),
  ...listFiles(frontendSourceRoot, (filePath) => /\.(ts|tsx)$/.test(filePath))
];
for (const filePath of sourceFiles) {
  const body = fs.readFileSync(filePath, "utf8");
  for (const pattern of unsafeLoggingPatterns) {
    if (pattern.test(body)) {
      failures.push(`${path.relative(root, filePath)} contains an unsafe logging pattern`);
    }
  }
}

if (failures.length > 0) {
  console.error("Quality gate validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Quality gate validation passed.");
