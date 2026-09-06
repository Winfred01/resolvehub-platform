const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const manifestPath = path.join(root, "tests", "quality-gates.json");
const ciPath = path.join(root, ".github", "workflows", "ci.yml");
const packagePath = path.join(root, "frontend", "package.json");
const e2eSpecPath = path.join(root, "frontend", "tests", "e2e", "portfolio-smoke.spec.ts");
const backendAnalyticsClientTestPath = path.join(
  root,
  "backend",
  "src",
  "test",
  "java",
  "com",
  "resolvehub",
  "backend",
  "tickets",
  "TicketAnalyticsClientTest.java"
);
const backendTicketControllerTestPath = path.join(
  root,
  "backend",
  "src",
  "test",
  "java",
  "com",
  "resolvehub",
  "backend",
  "tickets",
  "TicketControllerTest.java"
);
const analyticsTriageTestPath = path.join(root, "analytics-service", "tests", "test_triage_suggestions.py");
const analyticsDuplicateTestPath = path.join(root, "analytics-service", "tests", "test_duplicate_suggestions.py");
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
requireFile(backendAnalyticsClientTestPath);
requireFile(backendTicketControllerTestPath);
requireFile(analyticsTriageTestPath);
requireFile(analyticsDuplicateTestPath);

const manifest = readJson(manifestPath);
const gateNames = new Set((manifest.requiredGates ?? []).map((gate) => gate.name));
for (const gateName of [
  "frontend-accessibility",
  "e2e-browser-smoke",
  "backend-security",
  "privacy-metadata",
  "analytics-contract-robustness",
  "backend-analytics-resilience",
  "frontend-analytics-review",
  "analytics-e2e-advisory-review",
  "privacy-unsafe-analytics-logging"
]) {
  if (!gateNames.has(gateName)) {
    failures.push(`tests/quality-gates.json is missing ${gateName}`);
  }
}

if (manifest.baselineIssue !== 26 || manifest.baselineRoadmapMode !== "PORTFOLIO_FIRST_V0_1") {
  failures.push("tests/quality-gates.json must preserve the Issue #26 v0.1 baseline gate reference");
}

if (manifest.roadmapMode !== "ANALYTICS_ASSISTED_V0_2") {
  failures.push("tests/quality-gates.json must target ANALYTICS_ASSISTED_V0_2");
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
requireText(e2eSpecPath, "analytics-assisted v0.2 smoke paths");
requireText(e2eSpecPath, "accept review recorded for triage");
requireText(backendAnalyticsClientTestPath, "malformedAnalyticsPayloadsReturnAdvisoryFallbacks");
requireText(backendAnalyticsClientTestPath, "analyticsRuntimeTimeoutsReturnFallbackWithoutThrowing");
requireText(backendTicketControllerTestPath, "acceptedDuplicateReviewRecordsAuditOnlyWithoutTicketMutation");
requireText(analyticsTriageTestPath, "test_triage_suggestion_treats_whitespace_only_input_as_minimal_request");
requireText(analyticsDuplicateTestPath, "test_duplicate_suggestion_rejects_candidate_lists_over_limit");

const forbiddenPatterns = [
  /gmail/iu,
  /cookie/iu,
  /resume/iu,
  /job-search/iu,
  /private address/iu,
  /phone number/iu
];
const scannedFiles = [
  manifestPath,
  e2eSpecPath,
  backendAnalyticsClientTestPath,
  backendTicketControllerTestPath,
  analyticsTriageTestPath,
  analyticsDuplicateTestPath
];
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
