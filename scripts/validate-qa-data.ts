import fs from 'node:fs';
import path from 'node:path';
import type {
  Defect,
  QaMetadata,
  Requirement,
  TestCase,
  TestRun,
} from '../src/domain/qa-types';
import { calculateQaMetrics } from '../src/metrics/calculate-metrics';

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, 'data');

function readJsonFile<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

function validateQaData(): void {
  const errors: string[] = [];

  const metadataPath = path.join(DATA_DIR, 'metadata.json');
  const requirementsPath = path.join(DATA_DIR, 'requirements.json');
  const testCasesPath = path.join(DATA_DIR, 'test-cases.json');
  const testRunsPath = path.join(DATA_DIR, 'test-runs.json');
  const defectsPath = path.join(DATA_DIR, 'defects.json');

  if (!fs.existsSync(metadataPath)) {
    errors.push('Missing file: data/metadata.json');
  }
  if (!fs.existsSync(requirementsPath)) {
    errors.push('Missing file: data/requirements.json');
  }
  if (!fs.existsSync(testCasesPath)) {
    errors.push('Missing file: data/test-cases.json');
  }
  if (!fs.existsSync(testRunsPath)) {
    errors.push('Missing file: data/test-runs.json');
  }
  if (!fs.existsSync(defectsPath)) {
    errors.push('Missing file: data/defects.json');
  }

  if (errors.length > 0) {
    for (const err of errors) {
      console.error(`[ERROR] ${err}`);
    }
    process.exit(1);
  }

  const metadata = readJsonFile<QaMetadata>(metadataPath);
  const requirements = readJsonFile<Requirement[]>(requirementsPath);
  const testCases = readJsonFile<TestCase[]>(testCasesPath);
  const testRuns = readJsonFile<TestRun[]>(testRunsPath);
  const defects = readJsonFile<Defect[]>(defectsPath);

  // 1. Validate metadata.json
  if (metadata.frozenCommit !== 'be9089e') {
    errors.push(
      `metadata.frozenCommit must be "be9089e", found "${metadata.frozenCommit}"`,
    );
  }

  // 2. Validate requirements.json
  const reqIdSet = new Set<string>();
  for (const req of requirements) {
    if (!req.id || req.id.trim().length === 0) {
      errors.push('Requirement with empty id detected');
    } else if (reqIdSet.has(req.id)) {
      errors.push(`Duplicate requirement id: ${req.id}`);
    } else {
      reqIdSet.add(req.id);
    }
  }

  const inScopeReqs = requirements.filter((req) => req.status === 'IN_SCOPE');
  const phase2Reqs = requirements.filter((req) => req.status === 'PHASE_2');

  if (inScopeReqs.length !== 28) {
    errors.push(
      `Expected 28 IN_SCOPE requirements, found ${inScopeReqs.length}`,
    );
  }
  if (phase2Reqs.length !== 2) {
    errors.push(`Expected 2 PHASE_2 requirements, found ${phase2Reqs.length}`);
  }

  // 3. Validate test-cases.json
  if (testCases.length !== 40) {
    errors.push(`Expected 40 test cases, found ${testCases.length}`);
  }

  const manualCount = testCases.filter(
    (tc) => tc.executionMode === 'Manual',
  ).length;
  const automatedCount = testCases.filter(
    (tc) => tc.executionMode === 'Automatizada',
  ).length;

  if (manualCount !== 15) {
    errors.push(`Expected 15 Manual test cases, found ${manualCount}`);
  }
  if (automatedCount !== 25) {
    errors.push(`Expected 25 Automatizada test cases, found ${automatedCount}`);
  }

  const tcIdSet = new Set<string>();
  const coveredReqIds = new Set<string>();

  testCases.forEach((tc, idx) => {
    const expectedNumber = idx + 1;
    if (tc.number !== expectedNumber) {
      errors.push(
        `TestCase ${tc.id} has number=${tc.number}, expected ${expectedNumber}`,
      );
    }
    if (tcIdSet.has(tc.id)) {
      errors.push(`Duplicate TestCase id: ${tc.id}`);
    }
    tcIdSet.add(tc.id);

    if (!tc.requirementIds || tc.requirementIds.length === 0) {
      errors.push(`TestCase ${tc.id} has no requirementIds`);
    }
    for (const reqId of tc.requirementIds) {
      if (!reqIdSet.has(reqId)) {
        errors.push(
          `TestCase ${tc.id} references unknown requirementId "${reqId}"`,
        );
      } else {
        coveredReqIds.add(reqId);
      }
    }
  });

  for (const inScopeReq of inScopeReqs) {
    if (!coveredReqIds.has(inScopeReq.id)) {
      errors.push(
        `IN_SCOPE requirement "${inScopeReq.id}" is not covered by any TestCase`,
      );
    }
  }

  // 4. Validate test-runs.json
  if (testRuns.length !== 40) {
    errors.push(`Expected 40 test runs, found ${testRuns.length}`);
  }

  const runIdSet = new Set<string>();
  const coveredCaseIds = new Set<string>();

  for (const run of testRuns) {
    if (runIdSet.has(run.id)) {
      errors.push(`Duplicate TestRun id: ${run.id}`);
    }
    runIdSet.add(run.id);

    if (!tcIdSet.has(run.testCaseId)) {
      errors.push(
        `TestRun ${run.id} references unknown testCaseId "${run.testCaseId}"`,
      );
    } else {
      coveredCaseIds.add(run.testCaseId);
    }

    if (run.releaseCommit !== 'be9089e') {
      errors.push(
        `TestRun ${run.id} must have releaseCommit="be9089e", found "${run.releaseCommit}"`,
      );
    }

    if (!run.evidenceRefs || run.evidenceRefs.length === 0) {
      errors.push(`TestRun ${run.id} must include at least 1 evidenceRef`);
    } else {
      for (const ev of run.evidenceRefs) {
        const resolvedEvPath = path.resolve(ROOT_DIR, ev.location);
        if (!fs.existsSync(resolvedEvPath)) {
          errors.push(
            `TestRun ${run.id} evidence "${ev.id}" points to non-existent file "${ev.location}"`,
          );
        }
      }
    }
  }

  for (const tc of testCases) {
    if (!coveredCaseIds.has(tc.id)) {
      errors.push(`TestCase ${tc.id} has no TestRun entry`);
    }
  }

  // 5. Validate defects.json (strictly required: 6 defects, GitHub issueUrls, testRun resolution, P1+P2 open === 0)
  if (defects.length !== 6) {
    errors.push(`Expected 6 defects in data/defects.json, found ${defects.length}`);
  }

  const defectIdSet = new Set<string>();
  for (const defect of defects) {
    if (defectIdSet.has(defect.id)) {
      errors.push(`Duplicate Defect id: ${defect.id}`);
    }
    defectIdSet.add(defect.id);

    if (!tcIdSet.has(defect.testCaseId)) {
      errors.push(
        `Defect ${defect.id} references unknown testCaseId "${defect.testCaseId}"`,
      );
    }

    if (defect.releaseCommit !== 'be9089e') {
      errors.push(
        `Defect ${defect.id} must have releaseCommit="be9089e", found "${defect.releaseCommit}"`,
      );
    }

    if (
      !defect.issueUrl ||
      !defect.issueUrl.startsWith(
        'https://github.com/H3llz07/GastroForge-Testing/issues/',
      )
    ) {
      errors.push(
        `Defect ${defect.id} must have a valid GitHub issueUrl matching https://github.com/H3llz07/GastroForge-Testing/issues/, found "${defect.issueUrl}"`,
      );
    }

    if (!defect.evidenceRefs || defect.evidenceRefs.length === 0) {
      errors.push(`Defect ${defect.id} must include at least 1 evidenceRef`);
    } else {
      for (const ev of defect.evidenceRefs) {
        const resolvedEvPath = path.resolve(ROOT_DIR, ev.location);
        if (!fs.existsSync(resolvedEvPath)) {
          errors.push(
            `Defect ${defect.id} evidence "${ev.id}" points to non-existent file "${ev.location}"`,
          );
        }
      }
    }
  }

  for (const run of testRuns) {
    for (const defId of run.defectIds) {
      if (!defectIdSet.has(defId)) {
        errors.push(
          `TestRun ${run.id} references unknown defectId "${defId}"`,
        );
      }
    }
  }

  const metrics = calculateQaMetrics({
    requirements,
    testCases,
    testRuns,
    defects,
  });

  if (metrics.requirementCoverage !== 100) {
    errors.push(
      `Expected requirementCoverage === 100%, got ${metrics.requirementCoverage}%`,
    );
  }
  if (metrics.executionRate !== 100) {
    errors.push(
      `Expected executionRate === 100%, got ${metrics.executionRate}%`,
    );
  }

  const openCriticalOrHigh =
    metrics.defectsBySeverity.P1.open + metrics.defectsBySeverity.P2.open;
  if (openCriticalOrHigh !== 0) {
    errors.push(
      `Expected 0 open P1/P2 defects, found ${openCriticalOrHigh} (P1=${metrics.defectsBySeverity.P1.open}, P2=${metrics.defectsBySeverity.P2.open})`,
    );
  }

  if (errors.length > 0) {
    console.error('=== QA DATA VALIDATION FAILED ===');
    for (const err of errors) {
      console.error(` - ${err}`);
    }
    process.exit(1);
  }

  console.log('=== GASTROFORGE QA DATA VALIDATION PASSED ===');
  console.log(`Frozen SUT Commit      : ${metadata.frozenCommit}`);
  console.log(
    `Requirements           : ${metrics.coveredRequirements}/${metrics.inScopeRequirements} IN_SCOPE covered (${metrics.requirementCoverage}%)`,
  );
  console.log(
    `Test Cases             : ${metrics.totalCases} total (${metrics.manualCases} Manual, ${metrics.automatedCases} Automatizada)`,
  );
  console.log(
    `Test Execution         : ${metrics.executedCases}/${metrics.totalCases} (${metrics.executionRate}%)`,
  );
  console.log(
    `Results Breakdown      : ${metrics.passedCases} PASSED, ${metrics.failedCases} FAILED, ${metrics.blockedCases} BLOCKED, ${metrics.skippedCases} SKIPPED, ${metrics.notRunCases} NOT_RUN`,
  );
  console.log(`Pass Rate              : ${metrics.passRate}%`);
  console.log(
    `Defects Recorded       : ${metrics.totalDefects} (${metrics.openDefects} open, ${metrics.closedDefects} closed)`,
  );
}

validateQaData();
