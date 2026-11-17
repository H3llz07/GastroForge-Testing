import React, { useState, useMemo } from 'react';
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

import { Sidebar, type DashboardTab } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    const blob = new Blob([jsonString], {
      type: 'application/json;charset=utf-8',
    });
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
    <div className="min-h-screen bg-[#F8F9FB] text-slate-900">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        metadata={metadata}
        totalCases={metrics.totalCases}
        totalDefects={metrics.totalDefects}
        openDefects={metrics.openDefects}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen print-full-width">
        <Topbar
          activeTab={activeTab}
          frozenCommit={metadata.frozenCommit}
          hasLocalOverrides={runsState.isCustom}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onResetSnapshot={handleResetSnapshot}
          onExportTestRunsJson={handleExportTestRunsJson}
          onPrint={() => window.print()}
        />

        {/* Print-only Document Header */}
        <div className="hidden print-only border-b border-slate-300 pb-3 mb-4 px-4 pt-2">
          <div className="font-display font-bold text-lg text-slate-900">
            GastroForge QA Evidence &amp; Traceability Laboratory — Commit {metadata.frozenCommit}
          </div>
          <div className="text-xs font-mono text-slate-600">
            {metadata.elaboratedBy} · {metadata.institution} · v{metadata.version} ({metadata.date})
          </div>
        </div>

        <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

        <footer className="border-t border-slate-200 bg-white/70 py-3.5 px-4 sm:px-6 lg:px-8 no-print">
          <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div>
              GastroForge-Testing · Arquitectura Data-First · SUT @{' '}
              <span className="font-mono font-semibold text-slate-700">
                {metadata.frozenCommit}
              </span>
            </div>
            <div>
              {metadata.elaboratedBy} · {metadata.institution}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
