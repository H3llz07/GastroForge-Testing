import React, { useState, useMemo } from 'react';
import {
  Activity,
  ClipboardCheck,
  GitBranch,
  Bug,
  ShieldCheck,
  GitCommit,
  Printer,
  RotateCcw,
  Download,
  ExternalLink,
} from 'lucide-react';

import metadataJson from '../data/metadata.json';
import requirementsJson from '../data/requirements.json';
import testCasesJson from '../data/test-cases.json';
import testRunsJson from '../data/test-runs.json';
import defectsJson from '../data/defects.json';

import type {
  Defect,
  DesignTechnique,
  PyramidLevel,
  QaMetadata,
  Requirement,
  TestCase,
  TestRun,
  TestStatus,
} from './domain/qa-types';
import { calculateQaMetrics } from './metrics/calculate-metrics';

import { OverviewView } from './views/OverviewView';
import { TestCasesView, type TestCaseFilters } from './views/TestCasesView';
import { TraceabilityView } from './views/TraceabilityView';
import { DefectsView } from './views/DefectsView';
import { GovernanceView } from './views/GovernanceView';

const STORAGE_KEY = 'gastroforge_qa_test_runs_be9089e_v1';

const metadata = metadataJson as unknown as QaMetadata;
const requirements = requirementsJson as unknown as Requirement[];
const testCases = testCasesJson as unknown as TestCase[];
const officialTestRuns = testRunsJson as unknown as TestRun[];
const defects = defectsJson as unknown as Defect[];

type DashboardTab =
  | 'overview'
  | 'test-cases'
  | 'traceability'
  | 'defects'
  | 'governance';

function loadInitialTestRuns(): { runs: TestRun[]; isCustom: boolean } {
  if (typeof window === 'undefined') {
    return { runs: officialTestRuns, isCustom: false };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { runs: officialTestRuns, isCustom: false };
    }
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed) && parsed.length === officialTestRuns.length) {
      return { runs: parsed as TestRun[], isCustom: true };
    }
  } catch {
    // Fallback to official snapshot if localStorage is unavailable or malformed
  }
  return { runs: officialTestRuns, isCustom: false };
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [runsState, setRunsState] = useState<{
    runs: TestRun[];
    isCustom: boolean;
  }>(() => loadInitialTestRuns());

  const [caseFilters, setCaseFilters] = useState<TestCaseFilters>({
    search: '',
    module: 'ALL',
    executionMode: 'ALL',
    pyramidLevel: 'ALL',
    technique: 'ALL',
    priority: 'ALL',
    status: 'ALL',
  });

  const metrics = useMemo(
    () =>
      calculateQaMetrics({
        requirements,
        testCases,
        testRuns: runsState.runs,
        defects,
      }),
    [runsState.runs],
  );

  const handleUpdateTestRun = (
    testCaseId: string,
    patch: {
      status: TestStatus;
      actualResult: string;
      observations: string;
    },
  ) => {
    setRunsState((prev) => {
      const updated = prev.runs.map((run) => {
        if (run.testCaseId !== testCaseId) return run;
        return {
          ...run,
          status: patch.status,
          actualResult: patch.actualResult,
          observations: patch.observations,
          executedAt: new Date().toISOString(),
        };
      });

      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage quota errors
      }

      return { runs: updated, isCustom: true };
    });
  };

  const handleResetSnapshot = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    setRunsState({ runs: officialTestRuns, isCustom: false });
  };

  const handleExportTestRunsJson = () => {
    const jsonString = JSON.stringify(runsState.runs, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `test-runs-${metadata.frozenCommit}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleNavigateToCasesWithFilter = (filter: {
    module?: string;
    pyramidLevel?: PyramidLevel;
    technique?: DesignTechnique;
  }) => {
    setCaseFilters({
      search: '',
      module: filter.module ?? 'ALL',
      executionMode: 'ALL',
      pyramidLevel: filter.pyramidLevel ?? 'ALL',
      technique: filter.technique ?? 'ALL',
      priority: 'ALL',
      status: 'ALL',
    });
    setActiveTab('test-cases');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Cabecera Superior de Comando e Identidad Industrial */}
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-slate-300">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-orange-700 text-white font-bold">
                  <GitCommit className="w-3.5 h-3.5" />
                  Commit {metadata.frozenCommit}
                </span>
                <span>•</span>
                <span>SUT Congelado: JhonatanM2005/GastroForge</span>
                <span>•</span>
                <span>v{metadata.version} ({metadata.date})</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                GastroForge QA Evidence &amp; Traceability Laboratory
              </h1>
              <p className="text-xs text-slate-300 font-mono">
                {metadata.elaboratedBy} — {metadata.institution}
              </p>
            </div>

            {/* Controles Globales Rápidos */}
            <div className="flex flex-wrap items-center gap-2 no-print">
              <a
                href={metadata.sutRepo}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono transition-colors"
              >
                <span>Repo SUT</span>
                <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
              </a>

              <a
                href={`${metadata.qaRepo}/issues`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono transition-colors"
              >
                <span>Issues QA (#1–#14)</span>
                <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
              </a>

              {runsState.isCustom ? (
                <button
                  type="button"
                  onClick={handleResetSnapshot}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-mono font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restaurar be9089e
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleExportTestRunsJson}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-orange-400" />
                test-runs.json
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-orange-700 hover:bg-orange-600 text-white text-xs font-mono font-semibold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir / PDF
              </button>
            </div>
          </div>

          {/* Cinta de Telemetría en Vivo */}
          <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 font-mono text-xs">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded px-3 py-1.5">
              <div className="text-[10px] text-slate-400 uppercase">Ejecución</div>
              <div className="font-bold text-white">
                {metrics.executionRate}% ({metrics.executedCases}/{metrics.totalCases})
              </div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded px-3 py-1.5">
              <div className="text-[10px] text-slate-400 uppercase">Aprobación</div>
              <div className="font-bold text-emerald-400">
                {metrics.passRate}% ({metrics.passedCases}/{metrics.executedCases})
              </div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded px-3 py-1.5">
              <div className="text-[10px] text-slate-400 uppercase">Cobertura Req.</div>
              <div className="font-bold text-white">
                {metrics.requirementCoverage}% ({metrics.coveredRequirements}/
                {metrics.inScopeRequirements})
              </div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded px-3 py-1.5">
              <div className="text-[10px] text-slate-400 uppercase">P1 / P2 Abiertos</div>
              <div className="font-bold text-emerald-400">
                {metrics.defectsBySeverity.P1.open +
                  metrics.defectsBySeverity.P2.open}{' '}
                (Meta = 0)
              </div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded px-3 py-1.5">
              <div className="text-[10px] text-slate-400 uppercase">Densidad Def.</div>
              <div className="font-bold text-white">
                {metrics.openDefectDensity} ab. / {metrics.defectDensity} hist.
              </div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded px-3 py-1.5">
              <div className="text-[10px] text-slate-400 uppercase">Reapertura</div>
              <div className="font-bold text-emerald-400">
                {metrics.reopenRate}% ({metrics.reopenedDefects}/
                {metrics.resolvedOrClosedDefects})
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Navegación por Pestañas */}
        <nav
          aria-label="Secciones del Dashboard QA"
          className="bg-slate-950/60 border-t border-slate-800 no-print"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-mono font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-orange-500 text-white bg-slate-900/80'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-4 h-4 text-orange-400" />
              1. Resumen Ejecutivo &amp; KPIs (§5.5 / §13)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('test-cases')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-mono font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'test-cases'
                  ? 'border-orange-500 text-white bg-slate-900/80'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ClipboardCheck className="w-4 h-4 text-orange-400" />
              2. Catálogo 40 CP &amp; Grabador (§7.1 / §7.2)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('traceability')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-mono font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'traceability'
                  ? 'border-orange-500 text-white bg-slate-900/80'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitBranch className="w-4 h-4 text-orange-400" />
              3. Matriz de Trazabilidad (28 IN_SCOPE + 2 F2)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('defects')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-mono font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'defects'
                  ? 'border-orange-500 text-white bg-slate-900/80'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bug className="w-4 h-4 text-orange-400" />
              4. Defectos &amp; GitHub Issues (§8.1 / §8.2)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('governance')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-mono font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'governance'
                  ? 'border-orange-500 text-white bg-slate-900/80'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-orange-400" />
              5. Gobernanza, RACI, Cronograma y Sustentación
            </button>
          </div>
        </nav>
      </header>

      {/* Contenido Principal de la Vista Seleccionada */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' ? (
          <OverviewView
            metadata={metadata}
            metrics={metrics}
            onNavigateToCasesWithFilter={handleNavigateToCasesWithFilter}
          />
        ) : null}

        {activeTab === 'test-cases' ? (
          <TestCasesView
            testCases={testCases}
            testRuns={runsState.runs}
            defects={defects}
            filters={caseFilters}
            onChangeFilters={setCaseFilters}
            onUpdateTestRun={handleUpdateTestRun}
            onResetSnapshot={handleResetSnapshot}
            onExportTestRunsJson={handleExportTestRunsJson}
            hasLocalOverrides={runsState.isCustom}
          />
        ) : null}

        {activeTab === 'traceability' ? (
          <TraceabilityView
            requirements={requirements}
            testCases={testCases}
            testRuns={runsState.runs}
            defects={defects}
            onSelectCaseModule={(module) =>
              handleNavigateToCasesWithFilter({ module })
            }
          />
        ) : null}

        {activeTab === 'defects' ? <DefectsView defects={defects} /> : null}

        {activeTab === 'governance' ? (
          <GovernanceView metadata={metadata} />
        ) : null}
      </main>

      {/* Pie de Página de Trazabilidad */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-slate-500">
          <div>
            GastroForge-Testing • Arquitectura Data-First • SUT Congelado @{' '}
            <strong className="text-slate-800">{metadata.frozenCommit}</strong>
          </div>
          <div>
            {metadata.elaboratedBy} • {metadata.institution}
          </div>
        </div>
      </footer>
    </div>
  );
};
