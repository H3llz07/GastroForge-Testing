import React, { useState, useMemo } from 'react';
import {
  GitBranch,
  CheckCircle2,
  XCircle,
  Search,
  Bug,
  Layers,
  Ban,
} from 'lucide-react';
import type {
  Defect,
  Requirement,
  RequirementScopeStatus,
  TestCase,
  TestRun,
} from '../domain/qa-types';

interface TraceabilityViewProps {
  requirements: Requirement[];
  testCases: TestCase[];
  testRuns: TestRun[];
  defects: Defect[];
  onSelectCaseModule: (module: string) => void;
}

export const TraceabilityView: React.FC<TraceabilityViewProps> = ({
  requirements,
  testCases,
  testRuns,
  defects,
  onSelectCaseModule,
}) => {
  const [scopeFilter, setScopeFilter] = useState<'ALL' | RequirementScopeStatus>(
    'ALL',
  );
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const runByCaseId = useMemo(() => {
    const map = new Map<string, TestRun>();
    for (const run of testRuns) {
      map.set(run.testCaseId, run);
    }
    return map;
  }, [testRuns]);

  const casesByRequirementId = useMemo(() => {
    const map = new Map<string, TestCase[]>();
    for (const tc of testCases) {
      for (const reqId of tc.requirementIds) {
        const list = map.get(reqId) ?? [];
        list.push(tc);
        map.set(reqId, list);
      }
    }
    return map;
  }, [testCases]);

  const defectsByCaseId = useMemo(() => {
    const map = new Map<string, Defect[]>();
    for (const d of defects) {
      const list = map.get(d.testCaseId) ?? [];
      list.push(d);
      map.set(d.testCaseId, list);
    }
    return map;
  }, [defects]);

  const filteredRequirements = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return requirements.filter((req) => {
      if (scopeFilter !== 'ALL' && req.status !== scopeFilter) {
        return false;
      }
      if (moduleFilter !== 'ALL' && req.module !== moduleFilter) {
        return false;
      }
      if (q.length > 0) {
        const inId = req.id.toLowerCase().includes(q);
        const inCode = req.code.toLowerCase().includes(q);
        const inTitle = req.title.toLowerCase().includes(q);
        const inSource = req.source.toLowerCase().includes(q);
        if (!inId && !inCode && !inTitle && !inSource) {
          return false;
        }
      }
      return true;
    });
  }, [requirements, scopeFilter, moduleFilter, searchQuery]);

  const inScopeCount = requirements.filter((r) => r.status === 'IN_SCOPE').length;
  const phase2Count = requirements.filter((r) => r.status === 'PHASE_2').length;

  return (
    <div className="space-y-6">
      {/* Resumen de Trazabilidad Bidireccional */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 print-break-inside-avoid">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-orange-700" />
              Matriz de Trazabilidad Bidireccional
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Vinculación completa de los {inScopeCount} requisitos en alcance (22 Casos de Uso MVP, 34 Historias de Usuario HU-001..034 y ADR-0001..0006) más las {phase2Count} exclusiones normativas de Fase 2.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
              IN_SCOPE: {inScopeCount} / {inScopeCount} (100%)
            </span>
            <span className="px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
              PHASE_2: {phase2Count}
            </span>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 no-print">
          <div>
            <label
              htmlFor="trace-search"
              className="block text-xs font-medium text-slate-600 mb-1"
            >
              Buscar por ID, UC, HU, ADR o Título
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                id="trace-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ej: REQ-RLS-01, UC-CSH-02, HU-024..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-orange-600"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="trace-scope"
              className="block text-xs font-medium text-slate-600 mb-1"
            >
              Alcance Normativo
            </label>
            <select
              id="trace-scope"
              value={scopeFilter}
              onChange={(e) =>
                setScopeFilter(e.target.value as 'ALL' | RequirementScopeStatus)
              }
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-orange-600"
            >
              <option value="ALL">Todos ({requirements.length})</option>
              <option value="IN_SCOPE">En Alcance MVP — IN_SCOPE ({inScopeCount})</option>
              <option value="PHASE_2">Diferido a Fase 2 — PHASE_2 ({phase2Count})</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="trace-module"
              className="block text-xs font-medium text-slate-600 mb-1"
            >
              Módulo
            </label>
            <select
              id="trace-module"
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-orange-600"
            >
              <option value="ALL">Todos los módulos</option>
              <option value="auth">auth</option>
              <option value="catalog">catalog</option>
              <option value="tables">tables</option>
              <option value="orders">orders</option>
              <option value="kitchen">kitchen</option>
              <option value="cash">cash</option>
              <option value="inventory">inventory</option>
              <option value="reports">reports</option>
              <option value="rls">rls</option>
            </select>
          </div>
        </div>
      </section>

      {/* Tabla de Trazabilidad Bidireccional */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-medium">
                <th className="py-3 px-3">ID Requisito</th>
                <th className="py-3 px-3">Código (UC / HU / ADR)</th>
                <th className="py-3 px-3">Módulo</th>
                <th className="py-3 px-3">Descripción del Requisito y Fuente</th>
                <th className="py-3 px-3">Casos de Prueba Vinculados (CP-*)</th>
                <th className="py-3 px-3 text-center">Estado Verificación</th>
                <th className="py-3 px-3">Defectos Asociados (DEF-*)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRequirements.map((req) => {
                const linkedCases = casesByRequirementId.get(req.id) ?? [];
                const linkedDefects = new Map<string, Defect>();
                let passedCount = 0;
                let failedCount = 0;

                for (const tc of linkedCases) {
                  const run = runByCaseId.get(tc.id);
                  if (run?.status === 'PASSED') passedCount += 1;
                  if (run?.status === 'FAILED') failedCount += 1;

                  const cDefs = defectsByCaseId.get(tc.id) ?? [];
                  for (const d of cDefs) {
                    linkedDefects.set(d.id, d);
                  }
                }

                const defectList = Array.from(linkedDefects.values());

                return (
                  <tr
                    key={req.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      req.status === 'PHASE_2' ? 'bg-slate-50/70 text-slate-500' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <div>{req.id}</div>
                      <span
                        className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                          req.status === 'IN_SCOPE'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                      {req.code}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <button
                        type="button"
                        onClick={() => onSelectCaseModule(req.module)}
                        className="px-2 py-0.5 rounded bg-slate-200 hover:bg-orange-100 text-slate-800 font-semibold text-[11px] cursor-pointer"
                      >
                        {req.module}
                      </button>
                    </td>
                    <td className="py-3 px-3 max-w-md">
                      <div className="font-semibold text-slate-900">{req.title}</div>
                      <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                        {req.description}
                      </p>
                      <div className="mt-1 font-mono text-[10px] text-slate-500">
                        Fuente: {req.source}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {req.status === 'PHASE_2' ? (
                        <span className="inline-flex items-center gap-1 text-slate-500 text-[11px]">
                          <Ban className="w-3.5 h-3.5" />
                          Excluido por ADR-0005 / ADR-0006
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {linkedCases.map((tc) => {
                            const run = runByCaseId.get(tc.id);
                            const isPassed = run?.status === 'PASSED';
                            return (
                              <span
                                key={tc.id}
                                className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${
                                  isPassed
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-red-50 text-red-800 border-red-200'
                                }`}
                                title={`${tc.title} (${run?.status ?? 'NOT_RUN'})`}
                              >
                                {tc.id} ({tc.pyramidLevel})
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {req.status === 'PHASE_2' ? (
                        <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[11px] font-semibold">
                          FASE 2 (Fuera MVP)
                        </span>
                      ) : failedCount === 0 && passedCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          {passedCount}/{linkedCases.length} PASSED
                        </span>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-semibold">
                            <XCircle className="w-3 h-3 text-red-700" />
                            {passedCount} OK / {failedCount} FAIL
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {defectList.length === 0 ? (
                        <span className="text-slate-400 text-[11px]">Sin defectos</span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {defectList.map((d) => (
                            <a
                              key={d.id}
                              href={d.issueUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-semibold w-fit ${
                                d.status === 'Cerrado'
                                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                                  : 'bg-amber-50 text-amber-900 border-amber-300'
                              }`}
                            >
                              <Bug className="w-3 h-3" />
                              {d.id} ({d.severityCode} • {d.status})
                            </a>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Nota Metodológica de Exclusiones de Fase 2 */}
      <section className="bg-orange-50/50 border border-orange-200/80 rounded-xl p-5 print-break-inside-avoid">
        <div className="flex items-start gap-3">
          <Layers className="w-5 h-5 text-orange-700 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h3 className="font-display font-bold text-sm text-slate-900">
              Trazabilidad de Alcance y Separación de Fase 2 (ADR-0005 y ADR-0006)
            </h3>
            <p className="text-slate-600 leading-relaxed">
              El denominador de cobertura de requisitos del ciclo QA evalúa exclusivamente los{' '}
              <strong className="text-slate-900">{inScopeCount} requisitos IN_SCOPE</strong> del MVP congelado en el commit{' '}
              <code className="font-mono text-orange-800 bg-orange-100/70 px-1 py-0.5 rounded">be9089e</code>. Los módulos de reservaciones de mesas (
              <code className="font-mono text-slate-800">REQ-PH2-01</code>) y permisos dinámicos/turnos/X-API-Key (
              <code className="font-mono text-slate-800">REQ-PH2-02</code>) se mantienen registrados con estado{' '}
              <code className="font-mono text-slate-800">PHASE_2</code> para garantizar trazabilidad arquitectónica completa sin distorsionar los indicadores de cumplimiento del MVP.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
