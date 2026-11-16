import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  RotateCcw,
  Download,
  Eye,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  SlidersHorizontal,
  Save,
  FileCode2,
  Bug,
} from 'lucide-react';
import type {
  Defect,
  DesignTechnique,
  ExecutionMode,
  PriorityLevel,
  PyramidLevel,
  TestCase,
  TestRun,
  TestStatus,
} from '../domain/qa-types';

export interface TestCaseFilters {
  search: string;
  module: string;
  executionMode: 'ALL' | ExecutionMode;
  pyramidLevel: 'ALL' | PyramidLevel;
  technique: 'ALL' | DesignTechnique;
  priority: 'ALL' | PriorityLevel;
  status: 'ALL' | TestStatus;
}

interface TestCasesViewProps {
  testCases: TestCase[];
  testRuns: TestRun[];
  defects: Defect[];
  filters: TestCaseFilters;
  onChangeFilters: React.Dispatch<React.SetStateAction<TestCaseFilters>>;
  onUpdateTestRun: (
    testCaseId: string,
    patch: {
      status: TestStatus;
      actualResult: string;
      observations: string;
    },
  ) => void;
  onResetSnapshot: () => void;
  onExportTestRunsJson: () => void;
  hasLocalOverrides: boolean;
}

const STATUS_BADGE: Record<
  TestStatus,
  { label: string; className: string }
> = {
  PASSED: {
    label: 'PASSED (Aprobado)',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  FAILED: {
    label: 'FAILED (Fallido)',
    className: 'bg-red-50 text-red-800 border-red-200',
  },
  BLOCKED: {
    label: 'BLOCKED (Bloqueado)',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  SKIPPED: {
    label: 'SKIPPED (Omitido)',
    className: 'bg-slate-100 text-slate-700 border-slate-300',
  },
  NOT_RUN: {
    label: 'NOT_RUN (Pendiente)',
    className: 'bg-slate-100 text-slate-600 border-slate-300',
  },
};

export const TestCasesView: React.FC<TestCasesViewProps> = ({
  testCases,
  testRuns,
  defects,
  filters,
  onChangeFilters,
  onUpdateTestRun,
  onResetSnapshot,
  onExportTestRunsJson,
  hasLocalOverrides,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<TestStatus>('PASSED');
  const [draftActualResult, setDraftActualResult] = useState<string>('');
  const [draftObservations, setDraftObservations] = useState<string>('');
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const runByCaseId = useMemo(() => {
    const map = new Map<string, TestRun>();
    for (const run of testRuns) {
      map.set(run.testCaseId, run);
    }
    return map;
  }, [testRuns]);

  const defectsByCaseId = useMemo(() => {
    const map = new Map<string, Defect[]>();
    for (const d of defects) {
      const list = map.get(d.testCaseId) ?? [];
      list.push(d);
      map.set(d.testCaseId, list);
    }
    return map;
  }, [defects]);

  const filteredCases = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return testCases.filter((tc) => {
      const run = runByCaseId.get(tc.id);
      const currentStatus: TestStatus = run ? run.status : 'NOT_RUN';

      if (filters.module !== 'ALL' && tc.module !== filters.module) {
        return false;
      }
      if (
        filters.executionMode !== 'ALL' &&
        tc.executionMode !== filters.executionMode
      ) {
        return false;
      }
      if (
        filters.pyramidLevel !== 'ALL' &&
        tc.pyramidLevel !== filters.pyramidLevel
      ) {
        return false;
      }
      if (filters.technique !== 'ALL' && tc.technique !== filters.technique) {
        return false;
      }
      if (filters.priority !== 'ALL' && tc.priority !== filters.priority) {
        return false;
      }
      if (filters.status !== 'ALL' && currentStatus !== filters.status) {
        return false;
      }

      if (query.length > 0) {
        const matchesId = tc.id.toLowerCase().includes(query);
        const matchesTitle = tc.title.toLowerCase().includes(query);
        const matchesHu = tc.userStory.toLowerCase().includes(query);
        const matchesReq = tc.requirementIds.some((r) =>
          r.toLowerCase().includes(query),
        );
        if (!matchesId && !matchesTitle && !matchesHu && !matchesReq) {
          return false;
        }
      }

      return true;
    });
  }, [testCases, runByCaseId, filters]);

  const selectedCase = useMemo(
    () => testCases.find((tc) => tc.id === selectedCaseId) ?? null,
    [testCases, selectedCaseId],
  );

  const selectedRun = useMemo(
    () => (selectedCase ? runByCaseId.get(selectedCase.id) ?? null : null),
    [selectedCase, runByCaseId],
  );

  const openCaseDrawer = (tc: TestCase) => {
    const run = runByCaseId.get(tc.id);
    setSelectedCaseId(tc.id);
    setDraftStatus(run ? run.status : 'NOT_RUN');
    setDraftActualResult(run ? run.actualResult : '');
    setDraftObservations(run ? run.observations : '');
    setSaveFeedback(null);
  };

  const handleSaveExecution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    onUpdateTestRun(selectedCase.id, {
      status: draftStatus,
      actualResult: draftActualResult.trim() || 'Actualizado desde el Grabador QA.',
      observations: draftObservations.trim(),
    });
    setSaveFeedback(
      `Ejecución de ${selectedCase.id} guardada en localStorage. KPIs recalculados en vivo.`,
    );
  };

  const resetAllFilters = () => {
    onChangeFilters({
      search: '',
      module: 'ALL',
      executionMode: 'ALL',
      pyramidLevel: 'ALL',
      technique: 'ALL',
      priority: 'ALL',
      status: 'ALL',
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabecera y Acciones del Grabador / Exportador JSON */}
      <section className="bg-white border border-slate-200 rounded-md p-5 print-break-inside-avoid">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Catálogo de 40 Casos de Prueba &amp; Grabador de Ejecuciones (§7.1 / §7.2)
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Explora las 40 fichas detalladas (15 manuales + 25 automatizadas), filtra por criterios múltiples y simula o actualiza resultados de ejecución en tiempo real con recálculo automático de KPIs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 no-print">
            {hasLocalOverrides ? (
              <span className="px-2.5 py-1 rounded bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono font-semibold">
                Simulación Local Activa (localStorage)
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-semibold">
                Snapshot Oficial be9089e Activo
              </span>
            )}

            <button
              type="button"
              onClick={onResetSnapshot}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-mono font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              Restaurar snapshot oficial be9089e
            </button>

            <button
              type="button"
              onClick={onExportTestRunsJson}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-orange-400" />
              Descargar test-runs.json
            </button>
          </div>
        </div>

        {/* Barra de Filtros Multicriterio */}
        <div className="mt-5 pt-4 border-t border-slate-200 no-print">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {/* Búsqueda */}
            <div className="sm:col-span-2 xl:col-span-2 relative">
              <label htmlFor="cp-search" className="block text-[11px] font-mono text-slate-600 mb-1">
                Buscar por ID, Título, HU o Requisito
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  id="cp-search"
                  type="text"
                  value={filters.search}
                  onChange={(e) =>
                    onChangeFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  placeholder="Ej: CP-AUTH-001, HU-024, RLS, Idempotency..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-orange-700 focus:bg-white font-mono"
                />
              </div>
            </div>

            {/* Módulo */}
            <div>
              <label htmlFor="cp-module" className="block text-[11px] font-mono text-slate-600 mb-1">
                Módulo
              </label>
              <select
                id="cp-module"
                value={filters.module}
                onChange={(e) =>
                  onChangeFilters((prev) => ({ ...prev, module: e.target.value }))
                }
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-orange-700 font-mono"
              >
                <option value="ALL">Todos (9)</option>
                <option value="auth">auth (6)</option>
                <option value="catalog">catalog (4)</option>
                <option value="tables">tables (3)</option>
                <option value="orders">orders (6)</option>
                <option value="kitchen">kitchen (4)</option>
                <option value="cash">cash (6)</option>
                <option value="inventory">inventory (3)</option>
                <option value="reports">reports (3)</option>
                <option value="rls">rls (5)</option>
              </select>
            </div>

            {/* Modo de Ejecución */}
            <div>
              <label htmlFor="cp-mode" className="block text-[11px] font-mono text-slate-600 mb-1">
                Modo Ejecución
              </label>
              <select
                id="cp-mode"
                value={filters.executionMode}
                onChange={(e) =>
                  onChangeFilters((prev) => ({
                    ...prev,
                    executionMode: e.target.value as 'ALL' | ExecutionMode,
                  }))
                }
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-orange-700 font-mono"
              >
                <option value="ALL">Todos (40)</option>
                <option value="Manual">Manual (15)</option>
                <option value="Automatizada">Automatizada (25)</option>
              </select>
            </div>

            {/* Nivel Piramidal */}
            <div>
              <label htmlFor="cp-pyramid" className="block text-[11px] font-mono text-slate-600 mb-1">
                Nivel Piramidal
              </label>
              <select
                id="cp-pyramid"
                value={filters.pyramidLevel}
                onChange={(e) =>
                  onChangeFilters((prev) => ({
                    ...prev,
                    pyramidLevel: e.target.value as 'ALL' | PyramidLevel,
                  }))
                }
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-orange-700 font-mono"
              >
                <option value="ALL">Todos (L1–L6)</option>
                <option value="L1">L1 — Estático / Contratos</option>
                <option value="L2">L2 — Unitario Dominio</option>
                <option value="L3">L3 — Aplicación Fake</option>
                <option value="L4">L4 — Integración RLS</option>
                <option value="L5">L5 — E2E Playwright</option>
                <option value="L6">L6 — Manual Tablet UAT</option>
              </select>
            </div>

            {/* Técnica */}
            <div>
              <label htmlFor="cp-technique" className="block text-[11px] font-mono text-slate-600 mb-1">
                Técnica de Diseño
              </label>
              <select
                id="cp-technique"
                value={filters.technique}
                onChange={(e) =>
                  onChangeFilters((prev) => ({
                    ...prev,
                    technique: e.target.value as 'ALL' | DesignTechnique,
                  }))
                }
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-orange-700 font-mono"
              >
                <option value="ALL">Todas (4)</option>
                <option value="EP">EP (Partición Equivalencia)</option>
                <option value="BVA">BVA (Valores Límite)</option>
                <option value="Tabla de decisión">Tabla de decisión</option>
                <option value="Transición de estados">Transición de estados</option>
              </select>
            </div>

            {/* Estado + Prioridad */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="cp-priority" className="block text-[11px] font-mono text-slate-600 mb-1">
                  Prioridad
                </label>
                <select
                  id="cp-priority"
                  value={filters.priority}
                  onChange={(e) =>
                    onChangeFilters((prev) => ({
                      ...prev,
                      priority: e.target.value as 'ALL' | PriorityLevel,
                    }))
                  }
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-orange-700 font-mono"
                >
                  <option value="ALL">Todas</option>
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                  <option value="Baja">Baja</option>
                </select>
              </div>

              <div>
                <label htmlFor="cp-status" className="block text-[11px] font-mono text-slate-600 mb-1">
                  Resultado
                </label>
                <select
                  id="cp-status"
                  value={filters.status}
                  onChange={(e) =>
                    onChangeFilters((prev) => ({
                      ...prev,
                      status: e.target.value as 'ALL' | TestStatus,
                    }))
                  }
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-orange-700 font-mono"
                >
                  <option value="ALL">Todos</option>
                  <option value="PASSED">PASSED</option>
                  <option value="FAILED">FAILED</option>
                  <option value="BLOCKED">BLOCKED</option>
                  <option value="SKIPPED">SKIPPED</option>
                  <option value="NOT_RUN">NOT_RUN</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-600">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-orange-700" />
              <span>
                Mostrando <strong>{filteredCases.length}</strong> de{' '}
                <strong>{testCases.length}</strong> casos de prueba
              </span>
            </div>
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-orange-700 hover:text-orange-900 underline cursor-pointer"
            >
              Limpiar todos los filtros
            </button>
          </div>
        </div>
      </section>

      {/* Tabla Resumen de Casos de Prueba (§7.2) */}
      <section className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-100 text-slate-700 font-mono uppercase">
                <th className="py-3 px-3 text-center">#</th>
                <th className="py-3 px-3">ID Caso</th>
                <th className="py-3 px-3">Módulo / Requisito</th>
                <th className="py-3 px-3">Título y Descripción del Caso (§7.2)</th>
                <th className="py-3 px-3">Tipo / Técnica</th>
                <th className="py-3 px-3 text-center">Nivel / Modo</th>
                <th className="py-3 px-3 text-center">Prioridad</th>
                <th className="py-3 px-3 text-center">Estado Ejecución</th>
                <th className="py-3 px-3 text-center no-print">Ficha §7.1 / Grabar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-mono">
                    No se encontraron casos de prueba que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredCases.map((tc) => {
                  const run = runByCaseId.get(tc.id);
                  const status: TestStatus = run ? run.status : 'NOT_RUN';
                  const badge = STATUS_BADGE[status];
                  const caseDefects = defectsByCaseId.get(tc.id) ?? [];

                  return (
                    <tr
                      key={tc.id}
                      onClick={() => openCaseDrawer(tc)}
                      className="hover:bg-slate-50/90 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3 text-center font-mono text-slate-500">
                        {String(tc.number).padStart(2, '0')}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {tc.id}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <div className="flex flex-col gap-1">
                          <span className="inline-block w-fit px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 text-[11px] font-semibold">
                            {tc.module}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {tc.requirementIds.join(', ')}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 max-w-md">
                        <div className="font-semibold text-slate-900 leading-snug">
                          {tc.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 font-mono truncate">
                          {tc.userStory}
                        </div>
                        {caseDefects.length > 0 ? (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {caseDefects.map((d) => (
                              <span
                                key={d.id}
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                                  d.status === 'Cerrado'
                                    ? 'bg-slate-100 text-slate-700 border-slate-300'
                                    : 'bg-amber-50 text-amber-900 border-amber-300'
                                }`}
                              >
                                <Bug className="w-2.5 h-2.5" />
                                {d.id} ({d.externalCode} • {d.status})
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <div className="text-slate-900 font-medium">{tc.type}</div>
                        <div className="text-[11px] text-slate-500">{tc.technique}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-900 text-white text-[11px] font-bold">
                          {tc.pyramidLevel}
                        </span>
                        <div
                          className={`mt-1 text-[11px] font-semibold ${
                            tc.executionMode === 'Manual'
                              ? 'text-orange-800'
                              : 'text-slate-600'
                          }`}
                        >
                          {tc.executionMode}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            tc.priority === 'Alta'
                              ? 'bg-red-50 text-red-800 border-red-200'
                              : tc.priority === 'Media'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          {tc.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-semibold ${badge.className}`}
                        >
                          {status === 'PASSED' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : status === 'FAILED' ? (
                            <XCircle className="w-3 h-3" />
                          ) : status === 'BLOCKED' ? (
                            <AlertCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center no-print">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCaseDrawer(tc);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-mono text-[11px] font-medium cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-orange-700" />
                          Ficha §7.1
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal / Drawer de Ficha Detallada §7.1 + Grabador de Ejecución en Tiempo Real */}
      {selectedCase ? (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end no-print"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-case-title"
        >
          <div className="bg-white w-full max-w-3xl h-full overflow-y-auto shadow-2xl border-l border-slate-300 flex flex-col justify-between">
            <div className="p-6 space-y-6">
              {/* Cabecera del Drawer */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs mb-1.5">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-bold">
                      Caso #{String(selectedCase.number).padStart(2, '0')} — {selectedCase.id}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800 font-semibold">
                      Nivel {selectedCase.pyramidLevel} ({selectedCase.executionMode})
                    </span>
                    <span className="px-2 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-900 font-semibold">
                      Técnica: {selectedCase.technique}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Prioridad: {selectedCase.priority}
                    </span>
                  </div>
                  <h3
                    id="drawer-case-title"
                    className="text-lg font-bold text-slate-900 leading-snug"
                  >
                    {selectedCase.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCaseId(null)}
                  className="p-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 cursor-pointer"
                  aria-label="Cerrar ficha de caso de prueba"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabla de Campos Oficiales §7.1 */}
              <div className="border border-slate-200 rounded-md overflow-hidden text-xs">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-mono font-bold text-slate-800">
                  Ficha Técnica Normalizada (§7.1 Plan de Pruebas)
                </div>
                <dl className="divide-y divide-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-4 p-3 gap-2">
                    <dt className="font-mono font-semibold text-slate-600">
                      Historia de usuario / Requisitos
                    </dt>
                    <dd className="sm:col-span-3 text-slate-900">
                      <div className="font-medium">{selectedCase.userStory}</div>
                      <div className="mt-1 flex flex-wrap gap-1.5 font-mono">
                        {selectedCase.requirementIds.map((reqId) => (
                          <span
                            key={reqId}
                            className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800 text-[11px]"
                          >
                            {reqId}
                          </span>
                        ))}
                      </div>
                    </dd>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 p-3 gap-2">
                    <dt className="font-mono font-semibold text-slate-600">
                      Módulo / Tipo / Responsable
                    </dt>
                    <dd className="sm:col-span-3 font-mono text-slate-800">
                      Módulo: <strong>{selectedCase.module}</strong> | Tipo:{' '}
                      <strong>{selectedCase.type}</strong> | Responsable:{' '}
                      <strong>{selectedCase.responsible}</strong>
                    </dd>
                  </div>

                  {selectedCase.automatedSpecPath ? (
                    <div className="grid grid-cols-1 sm:grid-cols-4 p-3 gap-2 bg-slate-50/60">
                      <dt className="font-mono font-semibold text-slate-600 flex items-center gap-1">
                        <FileCode2 className="w-3.5 h-3.5 text-orange-700" />
                        Spec Automatizado
                      </dt>
                      <dd className="sm:col-span-3 font-mono text-slate-900 font-semibold">
                        {selectedCase.automatedSpecPath}
                      </dd>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 sm:grid-cols-4 p-3 gap-2">
                    <dt className="font-mono font-semibold text-slate-600">
                      Precondiciones
                    </dt>
                    <dd className="sm:col-span-3">
                      <ul className="list-disc list-inside space-y-1 text-slate-800">
                        {selectedCase.preconditions.map((pre, idx) => (
                          <li key={idx}>{pre}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 p-3 gap-2">
                    <dt className="font-mono font-semibold text-slate-600">
                      Datos de entrada
                    </dt>
                    <dd className="sm:col-span-3">
                      <pre className="p-2.5 rounded bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto">
                        {JSON.stringify(selectedCase.inputData, null, 2)}
                      </pre>
                    </dd>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 p-3 gap-2">
                    <dt className="font-mono font-semibold text-slate-600">
                      Pasos (numerados)
                    </dt>
                    <dd className="sm:col-span-3">
                      <ol className="list-decimal list-inside space-y-1.5 text-slate-800">
                        {selectedCase.steps.map((step, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </dd>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 p-3 gap-2">
                    <dt className="font-mono font-semibold text-slate-600">
                      Resultado esperado
                    </dt>
                    <dd className="sm:col-span-3 text-slate-900 font-medium leading-relaxed">
                      {selectedCase.expectedResult}
                    </dd>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 p-3 gap-2 bg-slate-50">
                    <dt className="font-mono font-semibold text-slate-600">
                      Evidencia Verificable ({selectedRun?.id ?? 'N/A'})
                    </dt>
                    <dd className="sm:col-span-3 space-y-2">
                      {selectedRun && selectedRun.evidenceRefs.length > 0 ? (
                        selectedRun.evidenceRefs.map((ev) => (
                          <div
                            key={ev.id}
                            className="p-2 rounded bg-white border border-slate-200 font-mono text-[11px]"
                          >
                            <div className="font-semibold text-slate-900">
                              [{ev.kind}] {ev.location}
                            </div>
                            <div className="text-slate-600 font-sans mt-0.5">
                              {ev.description}
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-500">Sin evidencia adjunta</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Grabador Interactivo de Ejecución en Tiempo Real */}
              <form
                onSubmit={handleSaveExecution}
                className="border border-orange-200 bg-orange-50/40 rounded-md p-4 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-orange-200 pb-2">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-orange-700" />
                    Grabador Interactivo de Ejecución (Persistencia en localStorage)
                  </h4>
                  <span className="text-[11px] font-mono text-slate-600">
                    Run ID: {selectedRun?.id ?? 'RUN-NEW'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label
                      htmlFor="recorder-status"
                      className="block text-xs font-mono font-semibold text-slate-700 mb-1"
                    >
                      Estado de Ejecución
                    </label>
                    <select
                      id="recorder-status"
                      value={draftStatus}
                      onChange={(e) => setDraftStatus(e.target.value as TestStatus)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded focus:outline-none focus:border-orange-700"
                    >
                      <option value="PASSED">PASSED (Aprobado)</option>
                      <option value="FAILED">FAILED (Fallido)</option>
                      <option value="BLOCKED">BLOCKED (Bloqueado)</option>
                      <option value="SKIPPED">SKIPPED (Omitido)</option>
                      <option value="NOT_RUN">NOT_RUN (No ejecutado)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="recorder-observations"
                      className="block text-xs font-mono font-semibold text-slate-700 mb-1"
                    >
                      Observaciones Operativas
                    </label>
                    <input
                      id="recorder-observations"
                      type="text"
                      value={draftObservations}
                      onChange={(e) => setDraftObservations(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-orange-700"
                      placeholder="Observaciones de la corrida manual o automatizada..."
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="recorder-actual"
                    className="block text-xs font-mono font-semibold text-slate-700 mb-1"
                  >
                    Resultado Obtenido (§7.1)
                  </label>
                  <textarea
                    id="recorder-actual"
                    rows={3}
                    value={draftActualResult}
                    onChange={(e) => setDraftActualResult(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-orange-700"
                    placeholder="Describe el comportamiento real observado en el SUT..."
                  />
                </div>

                {saveFeedback ? (
                  <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono">
                    {saveFeedback}
                  </div>
                ) : null}

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCaseId(null)}
                    className="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-mono cursor-pointer"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded bg-orange-700 hover:bg-orange-800 text-white text-xs font-mono font-semibold cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Guardar Resultado y Recalcular KPIs
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
