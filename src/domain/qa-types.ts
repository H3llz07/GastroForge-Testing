export type TestStatus = 'NOT_RUN' | 'PASSED' | 'FAILED' | 'BLOCKED' | 'SKIPPED';

export type PriorityLevel = 'Alta' | 'Media' | 'Baja';

export type DefectSeverityLabel = 'Crítica' | 'Alta' | 'Media' | 'Baja';

export type DefectSeverityCode = 'P1' | 'P2' | 'P3' | 'P4';

export type DefectStatus = 'Nuevo' | 'Asignado' | 'En progreso' | 'Resuelto' | 'Cerrado';

export type TestType =
  | 'Funcional'
  | 'Regresión'
  | 'Integración'
  | 'Rendimiento'
  | 'Seguridad'
  | 'Usabilidad'
  | 'Aceptación (UAT)';

export type DesignTechnique =
  | 'EP'
  | 'BVA'
  | 'Tabla de decisión'
  | 'Transición de estados';

export type PyramidLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6';

export type ExecutionMode = 'Manual' | 'Automatizada';

export type RequirementScopeStatus = 'IN_SCOPE' | 'PHASE_2';

export interface Requirement {
  id: string;
  code: string;
  source: string;
  module: string;
  title: string;
  description: string;
  status: RequirementScopeStatus;
}

export interface TestCase {
  id: string;
  number: number;
  requirementIds: string[];
  userStory: string;
  module: string;
  title: string;
  priority: PriorityLevel;
  type: TestType;
  executionMode: ExecutionMode;
  pyramidLevel: PyramidLevel;
  technique: DesignTechnique;
  preconditions: string[];
  inputData: Record<string, string | number | boolean | string[]>;
  steps: string[];
  expectedResult: string;
  responsible: string;
  automatedSpecPath?: string;
}

export interface EvidenceItem {
  id: string;
  kind: 'SCREENSHOT' | 'LOG' | 'SPEC' | 'VIDEO' | 'COMMIT';
  location: string;
  capturedAt: string;
  description: string;
}

export interface TestRun {
  id: string;
  testCaseId: string;
  releaseCommit: string;
  environment: string;
  executor: string;
  executedAt: string;
  status: TestStatus;
  actualResult: string;
  defectIds: string[];
  evidenceRefs: EvidenceItem[];
  observations: string;
}

export interface Defect {
  id: string;
  externalCode: string;
  issueUrl: string;
  testCaseId: string;
  module: string;
  title: string;
  severity: DefectSeverityLabel;
  severityCode: DefectSeverityCode;
  priority: PriorityLevel;
  status: DefectStatus;
  reopened?: boolean;
  description: string;
  stepsToReproduce: string[];
  expectedResult: string;
  actualResult: string;
  evidenceRefs: EvidenceItem[];
  environment: string;
  releaseCommit: string;
  reportedBy: string;
  reportedAt: string;
  assignedTo: string;
  resolvedAt?: string;
}

export interface QaTeamMember {
  role: string;
  name: string;
  handle: string;
  block: string;
  responsibilities: string;
  participation: string;
}

export interface RaciEntry {
  activity: string;
  qaLead: string;
  qaAnalyst: string;
  dev: string;
  po: string;
  client: string;
}

export interface TestObjective {
  id: number;
  objective: string;
  successCriterion: string;
}

export interface SuspensionResumePair {
  suspensionCriterion: string;
  resumptionRequirement: string;
}

export interface CompletionThreshold {
  criterion: string;
  target: string;
  metricKey: string;
}

export interface EntryExitCriteria {
  entry: string[];
  exit: string[];
}

export interface DeliverableItem {
  name: string;
  description: string;
  phase: string;
  responsible: string;
  estimatedDate: string;
  artifactPath: string;
}

export interface ToolItem {
  category: string;
  tool: string;
  purpose: string;
}

export interface EnvironmentItem {
  name: string;
  urlOrServer: string;
  version: string;
  responsible: string;
}

export interface ScheduleItem {
  activity: string;
  startDate: string;
  endDate: string;
  responsible: string;
  status: 'Completado' | 'En curso' | 'Pendiente';
}

export interface RiskItem {
  id: number;
  risk: string;
  probability: 'Alta' | 'Media' | 'Baja';
  impact: 'Alto' | 'Medio' | 'Bajo';
  mitigationPlan: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface AcronymItem {
  acronym: string;
  meaning: string;
  description: string;
}

export interface ChangeHistoryEntry {
  version: string;
  date: string;
  description: string;
  author: string;
  approvedBy: string;
}

export interface StrategyTestTypeEntry {
  type: TestType;
  description: string;
  responsible: string;
  included: boolean;
}

export interface StrategyLevelEntry {
  level: string;
  pyramidCode: PyramidLevel;
  responsible: string;
  tool: string;
  description: string;
}

export interface QaMetadata {
  project: string;
  version: string;
  date: string;
  updatedAt: string;
  sutRepo: string;
  qaRepo: string;
  frozenCommit: string;
  frozenCommitTitle: string;
  institution: string;
  elaboratedBy: string;
  reviewedBy: string;
  approvedBy: string;
  status: 'Borrador' | 'En revisión' | 'Aprobado';
  changeHistory?: ChangeHistoryEntry[];
  purpose?: string;
  scope?: {
    inScope: string[];
    outOfScope: string[];
  };
  references?: string[];
  team: QaTeamMember[];
  raciMatrix: RaciEntry[];
  objectives: TestObjective[];
  strategyTestTypes?: StrategyTestTypeEntry[];
  strategyLevels?: StrategyLevelEntry[];
  suspensionCriteria: SuspensionResumePair[];
  completionThresholds: CompletionThreshold[];
  entryExitCriteria: EntryExitCriteria;
  deliverables: DeliverableItem[];
  tools: ToolItem[];
  environments: EnvironmentItem[];
  schedule: ScheduleItem[];
  risks: RiskItem[];
  glossaryTerms: GlossaryTerm[];
  acronyms: AcronymItem[];
}

export interface SeverityBreakdownItem {
  severityCode: DefectSeverityCode;
  severity: DefectSeverityLabel;
  total: number;
  open: number;
  closed: number;
}

export interface ModuleBreakdownItem {
  module: string;
  totalCases: number;
  manualCases: number;
  automatedCases: number;
  executedCases: number;
  passedCases: number;
  failedCases: number;
  blockedCases: number;
  skippedCases: number;
  notRunCases: number;
  passRate: number;
  openDefects: number;
  totalDefects: number;
}

export interface CountBreakdownItem {
  key: string;
  totalCases: number;
  executedCases: number;
  passedCases: number;
  failedCases: number;
}

export interface QaMetricsSummary {
  totalCases: number;
  manualCases: number;
  automatedCases: number;
  executedCases: number;
  passedCases: number;
  failedCases: number;
  blockedCases: number;
  skippedCases: number;
  notRunCases: number;
  executionRate: number;
  passRate: number;
  inScopeRequirements: number;
  coveredRequirements: number;
  requirementCoverage: number;
  totalDefects: number;
  openDefects: number;
  closedDefects: number;
  reopenedDefects: number;
  resolvedOrClosedDefects: number;
  defectDensity: number;
  openDefectDensity: number;
  reopenRate: number;
  defectsBySeverity: Record<DefectSeverityCode, SeverityBreakdownItem>;
  byModule: Record<string, ModuleBreakdownItem>;
  byPyramidLevel: Record<PyramidLevel, CountBreakdownItem>;
  byTechnique: Record<DesignTechnique, CountBreakdownItem>;
  byType: Record<TestType, CountBreakdownItem>;
}
