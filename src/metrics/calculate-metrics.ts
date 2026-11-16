import type {
  CountBreakdownItem,
  Defect,
  DefectSeverityCode,
  DefectSeverityLabel,
  DesignTechnique,
  ModuleBreakdownItem,
  PyramidLevel,
  QaMetricsSummary,
  Requirement,
  SeverityBreakdownItem,
  TestCase,
  TestRun,
  TestStatus,
  TestType,
} from '../domain/qa-types';

const PYRAMID_LEVELS: PyramidLevel[] = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'];

const DESIGN_TECHNIQUES: DesignTechnique[] = [
  'EP',
  'BVA',
  'Tabla de decisión',
  'Transición de estados',
];

const TEST_TYPES: TestType[] = [
  'Funcional',
  'Regresión',
  'Integración',
  'Rendimiento',
  'Seguridad',
  'Usabilidad',
  'Aceptación (UAT)',
];

const SEVERITY_MAP: Record<DefectSeverityCode, DefectSeverityLabel> = {
  P1: 'Crítica',
  P2: 'Alta',
  P3: 'Media',
  P4: 'Baja',
};

function createEmptyCountMap<K extends string>(
  keys: readonly K[],
): Record<K, CountBreakdownItem> {
  const result = {} as Record<K, CountBreakdownItem>;
  for (const key of keys) {
    result[key] = {
      key,
      totalCases: 0,
      executedCases: 0,
      passedCases: 0,
      failedCases: 0,
    };
  }
  return result;
}

function getLatestRunByCase(testRuns: TestRun[]): Map<string, TestRun> {
  const map = new Map<string, TestRun>();
  for (const run of testRuns) {
    const existing = map.get(run.testCaseId);
    if (!existing) {
      map.set(run.testCaseId, run);
      continue;
    }
    const existingTime = Date.parse(existing.executedAt);
    const currentTime = Date.parse(run.executedAt);
    if (
      !Number.isNaN(currentTime) &&
      (Number.isNaN(existingTime) || currentTime >= existingTime)
    ) {
      map.set(run.testCaseId, run);
    }
  }
  return map;
}

export function calculateQaMetrics(params: {
  requirements: Requirement[];
  testCases: TestCase[];
  testRuns: TestRun[];
  defects: Defect[];
}): QaMetricsSummary {
  const { requirements, testCases, testRuns, defects } = params;

  const latestRuns = getLatestRunByCase(testRuns);

  const totalCases = testCases.length;
  let manualCases = 0;
  let automatedCases = 0;
  let executedCases = 0;
  let passedCases = 0;
  let failedCases = 0;
  let blockedCases = 0;
  let skippedCases = 0;
  let notRunCases = 0;

  const byModule: Record<string, ModuleBreakdownItem> = {};
  const byPyramidLevel = createEmptyCountMap(PYRAMID_LEVELS);
  const byTechnique = createEmptyCountMap(DESIGN_TECHNIQUES);
  const byType = createEmptyCountMap(TEST_TYPES);

  const coveredRequirementIds = new Set<string>();

  for (const tc of testCases) {
    if (tc.executionMode === 'Manual') {
      manualCases += 1;
    } else {
      automatedCases += 1;
    }

    for (const reqId of tc.requirementIds) {
      coveredRequirementIds.add(reqId);
    }

    if (!byModule[tc.module]) {
      byModule[tc.module] = {
        module: tc.module,
        totalCases: 0,
        manualCases: 0,
        automatedCases: 0,
        executedCases: 0,
        passedCases: 0,
        failedCases: 0,
        blockedCases: 0,
        skippedCases: 0,
        notRunCases: 0,
        passRate: 0,
        openDefects: 0,
        totalDefects: 0,
      };
    }

    const modEntry = byModule[tc.module];
    modEntry.totalCases += 1;
    if (tc.executionMode === 'Manual') {
      modEntry.manualCases += 1;
    } else {
      modEntry.automatedCases += 1;
    }

    const pyramidEntry = byPyramidLevel[tc.pyramidLevel];
    if (pyramidEntry) {
      pyramidEntry.totalCases += 1;
    }

    const techniqueEntry = byTechnique[tc.technique];
    if (techniqueEntry) {
      techniqueEntry.totalCases += 1;
    }

    const typeEntry = byType[tc.type];
    if (typeEntry) {
      typeEntry.totalCases += 1;
    }

    const latestRun = latestRuns.get(tc.id);
    const status: TestStatus = latestRun ? latestRun.status : 'NOT_RUN';

    if (status === 'PASSED') {
      executedCases += 1;
      passedCases += 1;
      modEntry.executedCases += 1;
      modEntry.passedCases += 1;
      if (pyramidEntry) {
        pyramidEntry.executedCases += 1;
        pyramidEntry.passedCases += 1;
      }
      if (techniqueEntry) {
        techniqueEntry.executedCases += 1;
        techniqueEntry.passedCases += 1;
      }
      if (typeEntry) {
        typeEntry.executedCases += 1;
        typeEntry.passedCases += 1;
      }
    } else if (status === 'FAILED') {
      executedCases += 1;
      failedCases += 1;
      modEntry.executedCases += 1;
      modEntry.failedCases += 1;
      if (pyramidEntry) {
        pyramidEntry.executedCases += 1;
        pyramidEntry.failedCases += 1;
      }
      if (techniqueEntry) {
        techniqueEntry.executedCases += 1;
        techniqueEntry.failedCases += 1;
      }
      if (typeEntry) {
        typeEntry.executedCases += 1;
        typeEntry.failedCases += 1;
      }
    } else if (status === 'BLOCKED') {
      blockedCases += 1;
      modEntry.blockedCases += 1;
    } else if (status === 'SKIPPED') {
      skippedCases += 1;
      modEntry.skippedCases += 1;
    } else {
      notRunCases += 1;
      modEntry.notRunCases += 1;
    }
  }

  for (const modKey of Object.keys(byModule)) {
    const mod = byModule[modKey];
    mod.passRate =
      mod.executedCases > 0
        ? Number(((mod.passedCases / mod.executedCases) * 100).toFixed(2))
        : 0;
  }

  const executionRate =
    totalCases > 0 ? Number(((executedCases / totalCases) * 100).toFixed(2)) : 0;

  const passRate =
    executedCases > 0
      ? Number(((passedCases / executedCases) * 100).toFixed(2))
      : 0;

  const inScopeReqs = requirements.filter((req) => req.status === 'IN_SCOPE');
  const inScopeRequirements = inScopeReqs.length;
  const coveredRequirements = inScopeReqs.filter(
    (req) =>
      coveredRequirementIds.has(req.id) || coveredRequirementIds.has(req.code),
  ).length;

  const requirementCoverage =
    inScopeRequirements > 0
      ? Number(((coveredRequirements / inScopeRequirements) * 100).toFixed(2))
      : 0;

  const defectsBySeverity: Record<DefectSeverityCode, SeverityBreakdownItem> = {
    P1: { severityCode: 'P1', severity: SEVERITY_MAP.P1, total: 0, open: 0, closed: 0 },
    P2: { severityCode: 'P2', severity: SEVERITY_MAP.P2, total: 0, open: 0, closed: 0 },
    P3: { severityCode: 'P3', severity: SEVERITY_MAP.P3, total: 0, open: 0, closed: 0 },
    P4: { severityCode: 'P4', severity: SEVERITY_MAP.P4, total: 0, open: 0, closed: 0 },
  };

  let totalDefects = 0;
  let openDefects = 0;
  let closedDefects = 0;
  let reopenedDefects = 0;
  let resolvedOrClosedDefects = 0;

  for (const defect of defects) {
    totalDefects += 1;
    const isResolvedOrClosed =
      defect.status === 'Resuelto' || defect.status === 'Cerrado';

    if (defect.status === 'Cerrado') {
      closedDefects += 1;
    }

    if (isResolvedOrClosed) {
      resolvedOrClosedDefects += 1;
    } else {
      openDefects += 1;
    }

    if (defect.reopened) {
      reopenedDefects += 1;
    }

    const sevEntry = defectsBySeverity[defect.severityCode];
    if (sevEntry) {
      sevEntry.total += 1;
      if (isResolvedOrClosed) {
        sevEntry.closed += 1;
      } else {
        sevEntry.open += 1;
      }
    }

    const modEntry = byModule[defect.module];
    if (modEntry) {
      modEntry.totalDefects += 1;
      if (!isResolvedOrClosed) {
        modEntry.openDefects += 1;
      }
    }
  }

  const defectDensity =
    executedCases > 0 ? Number((totalDefects / executedCases).toFixed(4)) : 0;

  const openDefectDensity =
    executedCases > 0 ? Number((openDefects / executedCases).toFixed(4)) : 0;

  const reopenRate =
    resolvedOrClosedDefects > 0
      ? Number(((reopenedDefects / resolvedOrClosedDefects) * 100).toFixed(2))
      : 0;

  return {
    totalCases,
    manualCases,
    automatedCases,
    executedCases,
    passedCases,
    failedCases,
    blockedCases,
    skippedCases,
    notRunCases,
    executionRate,
    passRate,
    inScopeRequirements,
    coveredRequirements,
    requirementCoverage,
    totalDefects,
    openDefects,
    closedDefects,
    reopenedDefects,
    resolvedOrClosedDefects,
    defectDensity,
    openDefectDensity,
    reopenRate,
    defectsBySeverity,
    byModule,
    byPyramidLevel,
    byTechnique,
    byType,
  };
}
