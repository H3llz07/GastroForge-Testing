import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import rawDefects from '../../data/defects.json';
import rawMetadata from '../../data/metadata.json';
import rawRequirements from '../../data/requirements.json';
import rawTestCases from '../../data/test-cases.json';
import rawTestRuns from '../../data/test-runs.json';
import type {
  Defect,
  QaMetadata,
  Requirement,
  TestCase,
  TestRun,
} from '../domain/qa-types';
import { calculateQaMetrics } from './calculate-metrics';

const createRequirement = (
  id: string,
  status: 'IN_SCOPE' | 'PHASE_2' = 'IN_SCOPE',
  module = 'orders',
): Requirement => ({
  id,
  code: id,
  source: 'PRD.md',
  module,
  title: `Requirement ${id}`,
  description: `Description for ${id}`,
  status,
});

const createTestCase = (
  id: string,
  number: number,
  overrides: Partial<TestCase> = {},
): TestCase => ({
  id,
  number,
  requirementIds: ['HU-001'],
  userStory: 'HU-001 — Apertura de orden',
  module: 'orders',
  title: `Caso ${id}`,
  priority: 'Alta',
  type: 'Funcional',
  executionMode: 'Automatizada',
  pyramidLevel: 'L4',
  technique: 'EP',
  preconditions: ['Tenant activo'],
  inputData: { tableId: 'T-01' },
  steps: ['Paso 1', 'Paso 2'],
  expectedResult: 'HTTP 201',
  responsible: 'Jhonatan A. Méndez R.',
  ...overrides,
});

const createTestRun = (
  id: string,
  testCaseId: string,
  status: TestRun['status'],
  executedAt = '2026-11-16T01:00:00Z',
  defectIds: string[] = [],
): TestRun => ({
  id,
  testCaseId,
  releaseCommit: 'be9089e',
  environment: 'Docker PostgreSQL 16 (app_user RLS) + Playwright Tablet',
  executor: 'Julián Santiago Pico Pinzón',
  executedAt,
  status,
  actualResult: `Result ${status}`,
  defectIds,
  evidenceRefs: [],
  observations: '',
});

const createDefect = (
  id: string,
  externalCode: string,
  testCaseId: string,
  severity: Defect['severity'],
  severityCode: Defect['severityCode'],
  status: Defect['status'],
  overrides: Partial<Defect> = {},
): Defect => ({
  id,
  externalCode,
  issueUrl: `https://github.com/H3llz07/GastroForge-Testing/issues/${id}`,
  testCaseId,
  module: 'orders',
  title: `Defect ${id}`,
  severity,
  severityCode,
  priority: 'Alta',
  status,
  description: 'Descripción del defecto',
  stepsToReproduce: ['Paso 1'],
  expectedResult: 'Esperado',
  actualResult: 'Obtenido',
  evidenceRefs: [],
  environment: 'Local Docker',
  releaseCommit: 'be9089e',
  reportedBy: 'Jhonatan A. Méndez R.',
  reportedAt: '2026-11-16T01:00:00Z',
  assignedTo: 'Julián Santiago Pico Pinzón',
  ...overrides,
});

describe('calculateQaMetrics', () => {
  it('returns safe zero-initialized metrics when all input collections are empty', () => {
    const summary = calculateQaMetrics({
      requirements: [],
      testCases: [],
      testRuns: [],
      defects: [],
    });

    expect(summary.totalCases).toBe(0);
    expect(summary.manualCases).toBe(0);
    expect(summary.automatedCases).toBe(0);
    expect(summary.executedCases).toBe(0);
    expect(summary.passedCases).toBe(0);
    expect(summary.failedCases).toBe(0);
    expect(summary.blockedCases).toBe(0);
    expect(summary.skippedCases).toBe(0);
    expect(summary.notRunCases).toBe(0);
    expect(summary.executionRate).toBe(0);
    expect(summary.passRate).toBe(0);
    expect(summary.inScopeRequirements).toBe(0);
    expect(summary.coveredRequirements).toBe(0);
    expect(summary.requirementCoverage).toBe(0);
    expect(summary.totalDefects).toBe(0);
    expect(summary.openDefects).toBe(0);
    expect(summary.closedDefects).toBe(0);
    expect(summary.reopenedDefects).toBe(0);
    expect(summary.resolvedOrClosedDefects).toBe(0);
    expect(summary.defectDensity).toBe(0);
    expect(summary.openDefectDensity).toBe(0);
    expect(summary.reopenRate).toBe(0);
    expect(summary.defectsBySeverity.P1.total).toBe(0);
    expect(summary.defectsBySeverity.P2.total).toBe(0);
    expect(summary.defectsBySeverity.P3.total).toBe(0);
    expect(summary.defectsBySeverity.P4.total).toBe(0);
  });

  it('excludes NOT_RUN, BLOCKED, and SKIPPED from executedCases and passRate denominator', () => {
    const testCases: TestCase[] = [
      createTestCase('CP-ORD-001', 1, { executionMode: 'Manual', pyramidLevel: 'L6' }),
      createTestCase('CP-ORD-002', 2, { executionMode: 'Automatizada', pyramidLevel: 'L4' }),
      createTestCase('CP-ORD-003', 3, { executionMode: 'Automatizada', pyramidLevel: 'L2' }),
      createTestCase('CP-ORD-004', 4, { executionMode: 'Manual', pyramidLevel: 'L6' }),
      createTestCase('CP-ORD-005', 5, { executionMode: 'Automatizada', pyramidLevel: 'L5' }),
      createTestCase('CP-ORD-006', 6, { executionMode: 'Manual', pyramidLevel: 'L6' }),
    ];

    // 2 PASSED, 1 FAILED, 1 BLOCKED, 1 SKIPPED, 1 without any run (implicitly NOT_RUN)
    const testRuns: TestRun[] = [
      createTestRun('RUN-1', 'CP-ORD-001', 'PASSED'),
      createTestRun('RUN-2', 'CP-ORD-002', 'PASSED'),
      createTestRun('RUN-3', 'CP-ORD-003', 'FAILED'),
      createTestRun('RUN-4', 'CP-ORD-004', 'BLOCKED'),
      createTestRun('RUN-5', 'CP-ORD-005', 'SKIPPED'),
    ];

    const summary = calculateQaMetrics({
      requirements: [createRequirement('HU-001', 'IN_SCOPE')],
      testCases,
      testRuns,
      defects: [],
    });

    expect(summary.totalCases).toBe(6);
    expect(summary.manualCases).toBe(3);
    expect(summary.automatedCases).toBe(3);
    expect(summary.executedCases).toBe(3); // Only PASSED (2) + FAILED (1)
    expect(summary.passedCases).toBe(2);
    expect(summary.failedCases).toBe(1);
    expect(summary.blockedCases).toBe(1);
    expect(summary.skippedCases).toBe(1);
    expect(summary.notRunCases).toBe(1);

    // executionRate = (3 / 6) * 100 = 50%
    expect(summary.executionRate).toBe(50);
    // passRate = (2 / 3) * 100 = 66.67% (never 2/6)
    expect(summary.passRate).toBe(66.67);
  });

  it('uses the most recent TestRun per testCaseId when multiple runs exist', () => {
    const testCases: TestCase[] = [createTestCase('CP-AUTH-001', 1)];
    const testRuns: TestRun[] = [
      createTestRun('RUN-OLD', 'CP-AUTH-001', 'FAILED', '2026-11-15T10:00:00Z'),
      createTestRun('RUN-NEW', 'CP-AUTH-001', 'PASSED', '2026-11-16T10:00:00Z'),
    ];

    const summary = calculateQaMetrics({
      requirements: [createRequirement('HU-001', 'IN_SCOPE')],
      testCases,
      testRuns,
      defects: [],
    });

    expect(summary.executedCases).toBe(1);
    expect(summary.passedCases).toBe(1);
    expect(summary.failedCases).toBe(0);
    expect(summary.passRate).toBe(100);
  });

  it('computes requirementCoverage strictly over IN_SCOPE requirements and ignores PHASE_2 exclusions', () => {
    const requirements: Requirement[] = [
      createRequirement('HU-001', 'IN_SCOPE', 'auth'),
      createRequirement('HU-002', 'IN_SCOPE', 'catalog'),
      createRequirement('HU-003', 'IN_SCOPE', 'orders'),
      createRequirement('HU-004', 'IN_SCOPE', 'cash'),
      createRequirement('FASE2-RESERVATIONS', 'PHASE_2', 'tables'),
      createRequirement('FASE2-API-KEYS', 'PHASE_2', 'auth'),
    ];

    const testCases: TestCase[] = [
      createTestCase('CP-AUTH-001', 1, { requirementIds: ['HU-001', 'HU-002'] }),
      createTestCase('CP-ORD-001', 2, { requirementIds: ['HU-003'] }),
    ];

    const summary = calculateQaMetrics({
      requirements,
      testCases,
      testRuns: [],
      defects: [],
    });

    expect(summary.inScopeRequirements).toBe(4);
    expect(summary.coveredRequirements).toBe(3); // HU-001, HU-002, HU-003 covered; HU-004 uncovered
    expect(summary.requirementCoverage).toBe(75);
    expect(summary.passRate).toBe(0); // 0 executed cases -> 0% passRate without NaN
  });

  it('calculates defect density, open defect density, reopen rate, and P1-P4 breakdown accurately', () => {
    const testCases = Array.from({ length: 40 }, (_, idx) =>
      createTestCase(`CP-MOD-${String(idx + 1).padStart(3, '0')}`, idx + 1, {
        module: idx < 20 ? 'orders' : 'cash',
        executionMode: idx < 15 ? 'Manual' : 'Automatizada',
        pyramidLevel: idx < 15 ? 'L6' : 'L4',
        technique: idx % 2 === 0 ? 'BVA' : 'Tabla de decisión',
        type: idx % 2 === 0 ? 'Funcional' : 'Seguridad',
      }),
    );

    const testRuns = testCases.map((tc, idx) =>
      createTestRun(
        `RUN-${idx + 1}`,
        tc.id,
        idx < 37 ? 'PASSED' : 'FAILED',
      ),
    );

    const defects: Defect[] = [
      createDefect('DEF-001', 'GF-BUG-001', 'CP-MOD-021', 'Alta', 'P2', 'Cerrado'),
      createDefect('DEF-002', 'GF-BUG-002', 'CP-MOD-022', 'Media', 'P3', 'Cerrado'),
      createDefect('DEF-003', 'GF-BUG-003', 'CP-MOD-023', 'Media', 'P3', 'Resuelto', {
        reopened: true,
      }),
      createDefect('DEF-004', 'GF-BUG-004', 'CP-MOD-038', 'Media', 'P3', 'Asignado'),
      createDefect('DEF-005', 'GF-BUG-005', 'CP-MOD-039', 'Media', 'P3', 'En progreso'),
      createDefect('DEF-006', 'GF-BUG-006', 'CP-MOD-040', 'Baja', 'P4', 'Nuevo'),
    ];

    const summary = calculateQaMetrics({
      requirements: [createRequirement('HU-001', 'IN_SCOPE')],
      testCases,
      testRuns,
      defects,
    });

    expect(summary.totalCases).toBe(40);
    expect(summary.manualCases).toBe(15);
    expect(summary.automatedCases).toBe(25);
    expect(summary.executedCases).toBe(40);
    expect(summary.passedCases).toBe(37);
    expect(summary.failedCases).toBe(3);
    expect(summary.executionRate).toBe(100);
    expect(summary.passRate).toBe(92.5);

    expect(summary.totalDefects).toBe(6);
    expect(summary.openDefects).toBe(3); // Asignado, En progreso, Nuevo
    expect(summary.closedDefects).toBe(2); // Cerrado
    expect(summary.resolvedOrClosedDefects).toBe(3); // 2 Cerrado + 1 Resuelto
    expect(summary.reopenedDefects).toBe(1);

    // defectDensity = 6 / 40 = 0.15
    expect(summary.defectDensity).toBe(0.15);
    // openDefectDensity = 3 / 40 = 0.075
    expect(summary.openDefectDensity).toBe(0.075);
    // reopenRate = (1 / 3) * 100 = 33.33%
    expect(summary.reopenRate).toBe(33.33);

    expect(summary.defectsBySeverity.P1).toEqual({
      severityCode: 'P1',
      severity: 'Crítica',
      total: 0,
      open: 0,
      closed: 0,
    });
    expect(summary.defectsBySeverity.P2).toEqual({
      severityCode: 'P2',
      severity: 'Alta',
      total: 1,
      open: 0,
      closed: 1,
    });
    expect(summary.defectsBySeverity.P3).toEqual({
      severityCode: 'P3',
      severity: 'Media',
      total: 4,
      open: 2,
      closed: 2,
    });
    expect(summary.defectsBySeverity.P4).toEqual({
      severityCode: 'P4',
      severity: 'Baja',
      total: 1,
      open: 1,
      closed: 0,
    });

    expect(summary.byModule.orders.totalCases).toBe(20);
    expect(summary.byModule.cash.totalCases).toBe(20);
    expect(summary.byPyramidLevel.L6.totalCases).toBe(15);
    expect(summary.byPyramidLevel.L4.totalCases).toBe(25);
    expect(summary.byTechnique.BVA.totalCases).toBe(20);
    expect(summary.byTechnique['Tabla de decisión'].totalCases).toBe(20);
    expect(summary.byType.Funcional.totalCases).toBe(20);
    expect(summary.byType.Seguridad.totalCases).toBe(20);
  });

  it('validates governance metadata structure against QaMetadata contract and frozen commit be9089e', () => {
    const metadata: QaMetadata = rawMetadata as QaMetadata;

    expect(metadata.frozenCommit).toBe('be9089e');
    expect(metadata.status).toBe('Aprobado');
    expect(metadata.team.length).toBeGreaterThanOrEqual(6);
    expect(metadata.raciMatrix.length).toBe(8);
    expect(metadata.objectives.length).toBeGreaterThanOrEqual(3);
    expect(metadata.suspensionCriteria.length).toBeGreaterThanOrEqual(5);
    expect(metadata.completionThresholds.length).toBeGreaterThanOrEqual(7);
    expect(metadata.entryExitCriteria.entry.length).toBeGreaterThanOrEqual(4);
    expect(metadata.entryExitCriteria.exit.length).toBeGreaterThanOrEqual(4);
    expect(metadata.deliverables.length).toBeGreaterThanOrEqual(7);
    expect(metadata.tools.length).toBeGreaterThanOrEqual(5);
    expect(metadata.environments.length).toBe(3);
    expect(metadata.schedule.length).toBe(9);
    expect(metadata.risks.length).toBeGreaterThanOrEqual(5);
    expect(metadata.glossaryTerms.length).toBeGreaterThanOrEqual(11);
    expect(metadata.acronyms.length).toBeGreaterThanOrEqual(11);
  });

  it('validates structured requirements catalog against MVP scope (28 IN_SCOPE, 2 PHASE_2, 22 UCs, HU-001..034, ADRs)', () => {
    const requirements: Requirement[] = rawRequirements as Requirement[];

    expect(requirements).toHaveLength(30);

    const ids = requirements.map((req) => req.id.trim());
    expect(ids.every((id) => id.length > 0)).toBe(true);
    expect(new Set(ids).size).toBe(requirements.length);

    for (const req of requirements) {
      expect(req.code.trim().length).toBeGreaterThan(0);
      expect(req.source.trim().length).toBeGreaterThan(0);
      expect(req.module.trim().length).toBeGreaterThan(0);
      expect(req.title.trim().length).toBeGreaterThan(0);
      expect(req.description.trim().length).toBeGreaterThan(0);
    }

    const inScope = requirements.filter((req) => req.status === 'IN_SCOPE');
    const phase2 = requirements.filter((req) => req.status === 'PHASE_2');

    expect(inScope).toHaveLength(28);
    expect(phase2.map((req) => req.id)).toEqual(['REQ-PH2-01', 'REQ-PH2-02']);

    const combinedInScopeCodes = inScope.map((req) => req.code).join(' | ');

    const expectedUseCases = [
      'UC-AUTH-01',
      'UC-AUTH-02',
      'UC-AUTH-03',
      'UC-AUTH-04',
      'UC-AUTH-05',
      'UC-CAT-01',
      'UC-CAT-02',
      'UC-CAT-03',
      'UC-CAT-04',
      'UC-TAB-01',
      'UC-TAB-02',
      'UC-ORD-01',
      'UC-ORD-02',
      'UC-ORD-03',
      'UC-KIT-01',
      'UC-KIT-02',
      'UC-CSH-01',
      'UC-CSH-02',
      'UC-CSH-03',
      'UC-INV-01',
      'UC-INV-02',
      'UC-REP-01',
      'UC-REP-02',
      'UC-REP-03',
    ];
    for (const uc of expectedUseCases) {
      expect(combinedInScopeCodes).toContain(uc);
    }

    for (let i = 1; i <= 34; i += 1) {
      const huCode = `HU-${String(i).padStart(3, '0')}`;
      expect(combinedInScopeCodes).toContain(huCode);
    }

    for (const adr of ['ADR-0002', 'ADR-0004', 'ADR-0005', 'ADR-0006']) {
      expect(combinedInScopeCodes).toContain(adr);
    }
  });

  it('validates the 40 traceable test cases (15 manual, 25 automated, 100% requirement coverage, and real spec paths in GastroForge)', () => {
    const requirements: Requirement[] = rawRequirements as Requirement[];
    const testCases: TestCase[] = rawTestCases as unknown as TestCase[];

    expect(testCases).toHaveLength(40);

    const summary = calculateQaMetrics({
      requirements,
      testCases,
      testRuns: [],
      defects: [],
    });

    expect(summary.totalCases).toBe(40);
    expect(summary.manualCases).toBe(15);
    expect(summary.automatedCases).toBe(25);
    expect(summary.inScopeRequirements).toBe(28);
    expect(summary.coveredRequirements).toBe(28);
    expect(summary.requirementCoverage).toBe(100);

    const byArea = {
      auth: testCases.filter((tc) => tc.module === 'auth'),
      catalogAndTables: testCases.filter(
        (tc) => tc.module === 'catalog' || tc.module === 'tables',
      ),
      ordersAndKitchen: testCases.filter(
        (tc) => tc.module === 'orders' || tc.module === 'kitchen',
      ),
      cash: testCases.filter((tc) => tc.module === 'cash'),
      inventoryAndReports: testCases.filter(
        (tc) => tc.module === 'inventory' || tc.module === 'reports',
      ),
      rls: testCases.filter((tc) => tc.module === 'rls'),
    };

    expect(byArea.auth).toHaveLength(6);
    expect(byArea.auth.filter((tc) => tc.executionMode === 'Manual')).toHaveLength(3);

    expect(byArea.catalogAndTables).toHaveLength(7);
    expect(
      byArea.catalogAndTables.filter((tc) => tc.executionMode === 'Manual'),
    ).toHaveLength(3);

    expect(byArea.ordersAndKitchen).toHaveLength(10);
    expect(
      byArea.ordersAndKitchen.filter((tc) => tc.executionMode === 'Manual'),
    ).toHaveLength(4);

    expect(byArea.cash).toHaveLength(8);
    expect(byArea.cash.filter((tc) => tc.executionMode === 'Manual')).toHaveLength(3);

    expect(byArea.inventoryAndReports).toHaveLength(5);
    expect(
      byArea.inventoryAndReports.filter((tc) => tc.executionMode === 'Manual'),
    ).toHaveLength(1);

    expect(byArea.rls).toHaveLength(4);
    expect(byArea.rls.filter((tc) => tc.executionMode === 'Manual')).toHaveLength(1);

    const validRequirementIds = new Set(requirements.map((req) => req.id));
    const sutRoot = path.resolve(process.cwd(), '..', 'GastroForge');

    testCases.forEach((tc, index) => {
      expect(tc.number).toBe(index + 1);
      expect(tc.id.trim().length).toBeGreaterThan(0);
      expect(tc.requirementIds.length).toBeGreaterThan(0);
      for (const reqId of tc.requirementIds) {
        expect(validRequirementIds.has(reqId)).toBe(true);
      }

      expect(tc.preconditions.length).toBeGreaterThan(0);
      expect(tc.steps.length).toBeGreaterThan(0);
      expect(Object.keys(tc.inputData).length).toBeGreaterThan(0);
      expect(tc.expectedResult.trim().length).toBeGreaterThan(0);

      if (tc.executionMode === 'Automatizada') {
        expect(tc.automatedSpecPath).toBeDefined();
        const specPath = tc.automatedSpecPath ?? '';
        expect(specPath.trim().length).toBeGreaterThan(0);
        const fullSpecPath = path.join(sutRoot, specPath);
        expect(fs.existsSync(fullSpecPath)).toBe(true);
      }
    });
  });

  it('validates the 40 real test executions in test-runs.json against commit be9089e and evidence files', () => {
    const requirements: Requirement[] = rawRequirements as Requirement[];
    const testCases: TestCase[] = rawTestCases as unknown as TestCase[];
    const testRuns: TestRun[] = rawTestRuns as unknown as TestRun[];

    expect(testRuns).toHaveLength(40);

    const summary = calculateQaMetrics({
      requirements,
      testCases,
      testRuns,
      defects: [],
    });

    expect(summary.totalCases).toBe(40);
    expect(summary.executedCases).toBe(40);
    expect(summary.passedCases).toBe(38);
    expect(summary.failedCases).toBe(2);
    expect(summary.blockedCases).toBe(0);
    expect(summary.skippedCases).toBe(0);
    expect(summary.notRunCases).toBe(0);
    expect(summary.executionRate).toBe(100);
    expect(summary.passRate).toBe(95);
    expect(summary.requirementCoverage).toBe(100);

    for (const run of testRuns) {
      expect(run.releaseCommit).toBe('be9089e');
      expect(run.evidenceRefs.length).toBeGreaterThan(0);
      for (const ev of run.evidenceRefs) {
        const fullEvPath = path.resolve(process.cwd(), ev.location);
        expect(fs.existsSync(fullEvPath)).toBe(true);
      }
    }
  });

  it('validates the 6 real defects in defects.json and full metrics across all 4 real datasets', () => {
    const requirements: Requirement[] = rawRequirements as Requirement[];
    const testCases: TestCase[] = rawTestCases as unknown as TestCase[];
    const testRuns: TestRun[] = rawTestRuns as unknown as TestRun[];
    const defects: Defect[] = rawDefects as unknown as Defect[];

    expect(defects).toHaveLength(6);

    const summary = calculateQaMetrics({
      requirements,
      testCases,
      testRuns,
      defects,
    });

    expect(summary.totalDefects).toBe(6);
    expect(summary.openDefects).toBe(3);
    expect(summary.closedDefects).toBe(3);
    expect(summary.reopenedDefects).toBe(0);
    expect(summary.reopenRate).toBe(0);
    expect(summary.defectDensity).toBe(0.15);
    expect(summary.openDefectDensity).toBe(0.075);

    expect(summary.defectsBySeverity.P1.open).toBe(0);
    expect(summary.defectsBySeverity.P2.open).toBe(0);
    expect(summary.defectsBySeverity.P2.closed).toBe(1);
    expect(summary.defectsBySeverity.P3.open).toBe(2);
    expect(summary.defectsBySeverity.P3.closed).toBe(2);
    expect(summary.defectsBySeverity.P4.open).toBe(1);

    for (const defect of defects) {
      expect(defect.releaseCommit).toBe('be9089e');
      expect(defect.issueUrl).toMatch(
        /^https:\/\/github\.com\/H3llz07\/GastroForge-Testing\/issues\/\d+$/,
      );
      expect(defect.evidenceRefs.length).toBeGreaterThan(0);
      for (const ev of defect.evidenceRefs) {
        const fullEvPath = path.resolve(process.cwd(), ev.location);
        expect(fs.existsSync(fullEvPath)).toBe(true);
      }
    }
  });

  it('verifies generated markdown deliverables exist, contain all 40 test case IDs and 6 defect IDs, and have zero unreplaced placeholders', () => {
    const testCases: TestCase[] = rawTestCases as unknown as TestCase[];
    const defects: Defect[] = rawDefects as unknown as Defect[];

    const planPath = path.resolve(
      process.cwd(),
      'docs',
      'plan-de-pruebas-gastroforge.md',
    );
    const matrixPath = path.resolve(
      process.cwd(),
      'docs',
      'matriz-trazabilidad.md',
    );
    const bugsPath = path.resolve(process.cwd(), 'docs', 'reporte-bugs.md');

    expect(fs.existsSync(planPath)).toBe(true);
    expect(fs.existsSync(matrixPath)).toBe(true);
    expect(fs.existsSync(bugsPath)).toBe(true);

    const planContent = fs.readFileSync(planPath, 'utf-8');
    const matrixContent = fs.readFileSync(matrixPath, 'utf-8');
    const bugsContent = fs.readFileSync(bugsPath, 'utf-8');

    const forbiddenPlaceholders = [
      '[Nombre',
      '[DD/MM/AAAA]',
      '[Agregar',
      '[Describir',
      '[Definir',
      '[Módulo',
      '[Criterio',
      '[%]',
    ];

    for (const docContent of [planContent, matrixContent, bugsContent]) {
      for (const placeholder of forbiddenPlaceholders) {
        expect(docContent).not.toContain(placeholder);
      }
    }

    for (const tc of testCases) {
      expect(planContent).toContain(tc.id);
      expect(matrixContent).toContain(tc.id);
    }

    for (const defect of defects) {
      expect(planContent).toContain(defect.id);
      expect(matrixContent).toContain(defect.id);
      expect(bugsContent).toContain(defect.id);
      expect(bugsContent).toContain(defect.externalCode);
      expect(bugsContent).toContain(defect.issueUrl);
    }

    expect(planContent).toContain('## 1. Historial de Cambios');
    expect(planContent).toContain('## 7. Casos de Prueba');
    expect(planContent).toContain('## 8. Gestión de Defectos');
    expect(planContent).toContain('## 13. Métricas de Calidad');
    expect(planContent).toContain('## 14. Criterios de Cierre y Entregables');
    expect(planContent).toContain('## 15. Términos y Acrónimos');
    expect(planContent).toContain('100% (40/40)');
    expect(planContent).toContain('95% (38/40)');
    expect(planContent).toContain('0.075 (3/40)');
    expect(planContent).toContain('0.15 (6/40)');
    expect(planContent).toContain('0 (P1=0, P2=0)');
    expect(planContent).toContain('0% (0/3)');
    expect(planContent).toContain('100% (28/28)');

    const apaReportPath = path.resolve(
      process.cwd(),
      'docs',
      'informe-calidad-apa.md',
    );
    const readmePath = path.resolve(process.cwd(), 'README.md');

    expect(fs.existsSync(apaReportPath)).toBe(true);
    expect(fs.existsSync(readmePath)).toBe(true);

    const apaReportContent = fs.readFileSync(apaReportPath, 'utf-8');
    const readmeContent = fs.readFileSync(readmePath, 'utf-8');

    expect(apaReportContent).toContain('**Tabla 1**');
    expect(apaReportContent).toContain('**Tabla 2**');
    expect(apaReportContent).toContain('**Tabla 3**');
    expect(apaReportContent).toContain('## Referencias');
    expect(apaReportContent).toContain('Institución Universitaria Pascual Bravo');
    expect(apaReportContent).toContain(
      'Apto con Observaciones Menores Controladas',
    );

    expect(readmeContent).toContain('docs/plan-de-pruebas-gastroforge.md');
    expect(readmeContent).toContain('docs/matriz-trazabilidad.md');
    expect(readmeContent).toContain('docs/reporte-bugs.md');
    expect(readmeContent).toContain('docs/informe-calidad-apa.md');
    expect(readmeContent).toContain('be9089e');
  });
});

describe('PDF deliverables (HU-QA-009)', () => {
  const pdfNames = [
    'plan-de-pruebas-gastroforge',
    'matriz-trazabilidad',
    'reporte-bugs',
    'informe-calidad-apa',
  ];

  it.each(pdfNames)('docs/pdf/%s.pdf exists, is larger than 10 KB and starts with %PDF-', (name) => {
    const pdfPath = path.resolve(process.cwd(), 'docs', 'pdf', `${name}.pdf`);
    expect(fs.existsSync(pdfPath)).toBe(true);
    const buffer = fs.readFileSync(pdfPath);
    expect(buffer.byteLength).toBeGreaterThan(10 * 1024);
    expect(buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });
});