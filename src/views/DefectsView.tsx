import React, { useState, useMemo } from 'react';
import {
  Bug,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  GitCommit,
  ShieldAlert,
} from 'lucide-react';
import type {
  Defect,
  DefectSeverityCode,
  DefectStatus,
} from '../domain/qa-types';

interface DefectsViewProps {
  defects: Defect[];
}

const SEVERITY_STYLE: Record<
  DefectSeverityCode,
  { badge: string; border: string }
> = {
  P1: {
    badge: 'bg-red-900 text-white border-red-950',
    border: 'border-red-400',
  },
  P2: {
    badge: 'bg-red-50 text-red-900 border-red-300',
    border: 'border-red-300',
  },
  P3: {
    badge: 'bg-amber-50 text-amber-900 border-amber-300',
    border: 'border-amber-300',
  },
  P4: {
    badge: 'bg-slate-100 text-slate-800 border-slate-300',
    border: 'border-slate-300',
  },
};

export const DefectsView: React.FC<DefectsViewProps> = ({ defects }) => {
  const [severityFilter, setSeverityFilter] = useState<'ALL' | DefectSeverityCode>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | DefectStatus>('ALL');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');

  const filteredDefects = useMemo(() => {
    return defects.filter((d) => {
      if (severityFilter !== 'ALL' && d.severityCode !== severityFilter) {
        return false;
      }
      if (statusFilter !== 'ALL' && d.status !== statusFilter) {
        return false;
      }
      if (moduleFilter !== 'ALL' && d.module !== moduleFilter) {
        return false;
      }
      return true;
    });
  }, [defects, severityFilter, statusFilter, moduleFilter]);

  const closedCount = defects.filter((d) => d.status === 'Cerrado').length;
  const openCount = defects.filter((d) => d.status !== 'Cerrado').length;

  return (
    <div className="space-y-6">
      {/* Cabecera y Escala de Severidades (§8.1) */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 print-break-inside-avoid">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bug className="w-5 h-5 text-orange-700" />
              Gestión de Defectos, Severidades P1–P4 y GitHub Issues
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Taxonomía dual académica (<code className="font-mono">DEF-001..006</code>) e industrial (<code className="font-mono">GF-BUG-001..006</code>) sincronizada con GitHub Issues #9 a #14.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
              Cerrados: {closedCount} (DEF-001..003)
            </span>
            <span className="px-3 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
              Asignados (P3/P4): {openCount} (DEF-004..006)
            </span>
          </div>
        </div>

        {/* Tabla de Clasificación de Severidades (§8.1) */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-medium">
                <th className="py-2 px-3">Severidad (§8.1)</th>
                <th className="py-2 px-3">Descripción Normativa</th>
                <th className="py-2 px-3">SLA Respuesta</th>
                <th className="py-2 px-3 text-center">Cerrados</th>
                <th className="py-2 px-3 text-center">Abiertos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              <tr>
                <td className="py-2 px-3 font-bold text-red-900">Crítica (P1)</td>
                <td className="py-2 px-3 font-sans text-slate-700">
                  El sistema no funciona o compromete aislamiento multi-tenant RLS / integridad de datos.
                </td>
                <td className="py-2 px-3 text-slate-700">Inmediato (&lt; 4h)</td>
                <td className="py-2 px-3 text-center">0</td>
                <td className="py-2 px-3 text-center font-bold text-emerald-700">0</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-red-700">Alta (P2)</td>
                <td className="py-2 px-3 font-sans text-slate-700">
                  Una funcionalidad principal falla sin solución alternativa directa (ej. bloqueo en cobro bajo app_user).
                </td>
                <td className="py-2 px-3 text-slate-700">&lt; 24 horas</td>
                <td className="py-2 px-3 text-center font-semibold text-emerald-700">1 (DEF-001)</td>
                <td className="py-2 px-3 text-center font-bold text-emerald-700">0</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-amber-800">Media (P3)</td>
                <td className="py-2 px-3 font-sans text-slate-700">
                  Funcionalidad secundaria o discrepancia RBAC con solución alternativa operativa (workaround).
                </td>
                <td className="py-2 px-3 text-slate-700">&lt; 72 horas</td>
                <td className="py-2 px-3 text-center font-semibold text-emerald-700">
                  2 (DEF-002, DEF-003)
                </td>
                <td className="py-2 px-3 text-center font-semibold text-amber-800">
                  2 (DEF-004, DEF-005)
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-slate-700">Baja (P4)</td>
                <td className="py-2 px-3 font-sans text-slate-700">
                  Defecto cosmético, ergonómico menor o inconsistencia documental que no afecta la funcionalidad.
                </td>
                <td className="py-2 px-3 text-slate-700">Próximo sprint</td>
                <td className="py-2 px-3 text-center">0</td>
                <td className="py-2 px-3 text-center font-semibold text-slate-700">
                  1 (DEF-006)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Barra de Filtros de Defectos */}
        <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 no-print">
          <div>
            <label
              htmlFor="def-severity"
              className="block text-[11px] font-mono text-slate-600 mb-1"
            >
              Filtrar por Severidad
            </label>
            <select
              id="def-severity"
              value={severityFilter}
              onChange={(e) =>
                setSeverityFilter(e.target.value as 'ALL' | DefectSeverityCode)
              }
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-orange-700 font-mono"
            >
              <option value="ALL">Todas las severidades (6)</option>
              <option value="P1">Crítica / P1 (0)</option>
              <option value="P2">Alta / P2 (1)</option>
              <option value="P3">Media / P3 (4)</option>
              <option value="P4">Baja / P4 (1)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="def-status"
              className="block text-[11px] font-mono text-slate-600 mb-1"
            >
              Filtrar por Estado (§8.2)
            </label>
            <select
              id="def-status"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'ALL' | DefectStatus)
              }
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-orange-700 font-mono"
            >
              <option value="ALL">Todos los estados (6)</option>
              <option value="Cerrado">Cerrado — Verificado en be9089e (3)</option>
              <option value="Asignado">Asignado — Abierto en be9089e (3)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="def-module"
              className="block text-[11px] font-mono text-slate-600 mb-1"
            >
              Filtrar por Módulo
            </label>
            <select
              id="def-module"
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-orange-700 font-mono"
            >
              <option value="ALL">Todos los módulos</option>
              <option value="cash">cash (DEF-001, DEF-003)</option>
              <option value="reports">reports (DEF-002)</option>
              <option value="auth">auth (DEF-004)</option>
              <option value="orders">orders (DEF-005, DEF-006)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Fichas Completas de los 6 Defectos (§8.2) */}
      <div className="space-y-4">
        {filteredDefects.map((defect) => {
          const sevStyle = SEVERITY_STYLE[defect.severityCode];
          const isClosed = defect.status === 'Cerrado';
          const issueNumber = defect.issueUrl.split('/').pop() ?? '';

          return (
            <article
              key={defect.id}
              className={`bg-white border rounded-md p-6 shadow-2xs print-break-inside-avoid ${sevStyle.border}`}
            >
              {/* Encabezado de la Ficha §8.2 */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs mb-1.5">
                    <span className="px-2.5 py-0.5 rounded bg-slate-900 text-white font-bold">
                      {defect.id} / {defect.externalCode}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded border font-semibold ${sevStyle.badge}`}
                    >
                      Severidad: {defect.severity} ({defect.severityCode})
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800">
                      Prioridad: {defect.priority}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold">
                      Módulo: {defect.module}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-900 font-semibold">
                      Caso: {defect.testCaseId}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {defect.title}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 font-mono text-xs">
                  {isClosed ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Estado: {defect.status}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 border border-amber-300 text-amber-900 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Estado: {defect.status}
                    </span>
                  )}

                  <a
                    href={defect.issueUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors"
                  >
                    <span>GitHub Issue #{issueNumber}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
                  </a>
                </div>
              </div>

              {/* Cuerpo Estructurado del Reporte de Defecto (§8.2) */}
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
                <div className="lg:col-span-7 space-y-3">
                  <div>
                    <h4 className="font-mono font-bold text-slate-700 uppercase text-[11px] mb-1">
                      Descripción Técnica y Análisis de Causa Raíz
                    </h4>
                    <p className="text-slate-800 leading-relaxed">
                      {defect.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-mono font-bold text-slate-700 uppercase text-[11px] mb-1">
                      Pasos para Reproducir
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 text-slate-800">
                      {defect.stepsToReproduce.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded bg-emerald-50/60 border border-emerald-200">
                      <div className="font-mono font-bold text-emerald-900 text-[11px] mb-1">
                        Resultado Esperado
                      </div>
                      <p className="text-slate-800 leading-snug">
                        {defect.expectedResult}
                      </p>
                    </div>

                    <div className="p-3 rounded bg-red-50/60 border border-red-200">
                      <div className="font-mono font-bold text-red-900 text-[11px] mb-1">
                        Resultado Actual / Resolución
                      </div>
                      <p className="text-slate-800 leading-snug">
                        {defect.actualResult}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metadatos de Auditoría y Evidencias */}
                <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded p-4 flex flex-col justify-between space-y-3 font-mono text-[11px]">
                  <div className="space-y-1.5">
                    <div className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-2 flex items-center justify-between">
                      <span>Metadatos de Auditoría (§8.2)</span>
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <GitCommit className="w-3 h-3" />
                        {defect.releaseCommit}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Ambiente:</span>{' '}
                      <span className="text-slate-800">{defect.environment}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Reportado por:</span>{' '}
                      <span className="text-slate-900 font-semibold">
                        {defect.reportedBy}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Fecha de reporte:</span>{' '}
                      <span className="text-slate-800">{defect.reportedAt}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Asignado a:</span>{' '}
                      <span className="text-slate-900 font-semibold">
                        {defect.assignedTo}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Fecha resolución:</span>{' '}
                      <span className="text-slate-800">
                        {defect.resolvedAt ?? 'Pendiente (Asignado post-be9089e)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Reabierto:</span>{' '}
                      <span className="text-slate-800">
                        {defect.reopened ? 'Sí' : 'No (0 reaperturas)'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    <div className="font-bold text-slate-800 flex items-center gap-1">
                      <FileCode2 className="w-3.5 h-3.5 text-orange-700" />
                      Evidencias Verificables ({defect.evidenceRefs.length})
                    </div>
                    {defect.evidenceRefs.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-2 rounded bg-white border border-slate-200"
                      >
                        <div className="font-semibold text-slate-900">
                          [{ev.kind}] {ev.location}
                        </div>
                        <div className="text-slate-600 font-sans text-[11px] mt-0.5">
                          {ev.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Dictamen de Riesgo Residual sobre Defectos Abiertos P3/P4 */}
      <section className="bg-orange-50/50 border border-orange-200/80 rounded-xl p-5 print-break-inside-avoid">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-orange-700 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h3 className="font-display font-bold text-sm text-slate-900">
              Evaluación de Riesgo Residual al Cierre del Ciclo QA (Commit be9089e)
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Los 3 defectos históricos detectados durante la validación MVP (<strong className="text-slate-900">DEF-001 [P2], DEF-002 [P3] y DEF-003 [P3]</strong>) fueron corregidos y verificados mediante pruebas de regresión con 0 reaperturas. Los 3 hallazgos abiertos (<strong className="text-slate-900">DEF-004 [P3], DEF-005 [P3] y DEF-006 [P4]</strong>) corresponden a discrepancias de granularidad RBAC y documentación ergonómica menor (44px vs 48px) que no comprometen el aislamiento multi-tenant RLS ni la integridad transaccional financiera, cumpliendo estrictamente el criterio de salida de <strong className="text-emerald-700">0 defectos P1/P2 abiertos</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
