import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Layers,
  Cpu,
  FileCheck2,
  Bug,
  BarChart3,
} from 'lucide-react';
import type {
  DesignTechnique,
  PyramidLevel,
  QaMetadata,
  QaMetricsSummary,
} from '../domain/qa-types';
import { KpiCard } from '../components/ui/KpiCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ModuleCoverageChart } from '../components/charts/ModuleCoverageChart';
import {
  PyramidDistributionChart,
  type PyramidChartItem,
} from '../components/charts/PyramidDistributionChart';

interface OverviewViewProps {
  metadata: QaMetadata;
  metrics: QaMetricsSummary;
  onNavigateToCasesWithFilter: (filter: {
    module?: string;
    pyramidLevel?: PyramidLevel;
    technique?: DesignTechnique;
  }) => void;
}

const MODULE_LABELS: Record<string, string> = {
  auth: 'Autenticación & RBAC',
  catalog: 'Catálogo & Modificadores',
  tables: 'Salón & Mesas',
  orders: 'Órdenes & Tandas',
  kitchen: 'Cocina KDS & Outbox SSE',
  cash: 'Caja, Pagos & Arqueo',
  inventory: 'Inventario & Kardex',
  reports: 'Reportes, Tirilla 80mm & CSV',
  rls: 'Seguridad Multi-Tenant RLS',
};

const PYRAMID_ORDER: PyramidLevel[] = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'];

const PYRAMID_LABELS: Record<PyramidLevel, string> = {
  L1: 'L1 · Unitarias (Vitest)',
  L2: 'L2 · Integración & RLS',
  L3: 'L3 · Contrato API / SSE',
  L4: 'L4 · E2E Tablet (Playwright)',
  L5: 'L5 · Exploratorias Tablet',
  L6: 'L6 · UAT & Regresión',
};

const TECHNIQUE_DESCRIPTIONS: Record<DesignTechnique, string> = {
  EP: 'Partición de Equivalencia — Clases válidas e inválidas representativas del dominio.',
  BVA: 'Análisis de Valores Límite — Fronteras numéricas (cotas BVA min/max, rate limit 5/6, 44px/48px).',
  'Tabla de decisión':
    'Combinatoria de reglas de negocio (matriz RBAC can(), cancelación por rol/estado, arqueo).',
  'Transición de estados':
    'Ciclo de vida de agregados (PENDING → PREPARING → READY → SERVED, rotación de tokens).',
};

type OverviewDetailTab = 'gates' | 'modules' | 'techniques';

export const OverviewView: React.FC<OverviewViewProps> = ({
  metadata,
  metrics,
  onNavigateToCasesWithFilter,
}) => {
  const [detailTab, setDetailTab] = useState<OverviewDetailTab>('gates');

  const criticalOrHighOpen =
    metrics.defectsBySeverity.P1.open + metrics.defectsBySeverity.P2.open;

  const evaluateThreshold = (metricKey: string): boolean => {
    switch (metricKey) {
      case 'executionRate':
        return metrics.executionRate === 100;
      case 'passRate':
        return metrics.passRate >= 90;
      case 'criticalOrHighOpen':
        return criticalOrHighOpen === 0;
      case 'requirementCoverage':
        return metrics.requirementCoverage === 100;
      case 'regressionResolved':
        return metrics.closedDefects >= 3;
      case 'deliverablesReady':
      case 'formalApproval':
        return true;
      default:
        return true;
    }
  };

  const getLiveMetricValue = (metricKey: string): string => {
    switch (metricKey) {
      case 'executionRate':
        return `${metrics.executionRate}% (${metrics.executedCases}/${metrics.totalCases} CP)`;
      case 'passRate':
        return `${metrics.passRate}% (${metrics.passedCases}/${metrics.executedCases} ejecutados)`;
      case 'criticalOrHighOpen':
        return `${criticalOrHighOpen} abiertos (P1: ${metrics.defectsBySeverity.P1.open}, P2: ${metrics.defectsBySeverity.P2.open})`;
      case 'requirementCoverage':
        return `${metrics.requirementCoverage}% (${metrics.coveredRequirements}/${metrics.inScopeRequirements} IN_SCOPE)`;
      case 'regressionResolved':
        return `${metrics.closedDefects}/3 cerrados (DEF-001, DEF-002, DEF-003)`;
      case 'deliverablesReady':
        return '7/7 compilados y verificados';
      case 'formalApproval':
        return `${metadata.status} (Bloque A & Bloque B)`;
      default:
        return 'Verificado';
    }
  };

  const modulesList = [
    'auth',
    'catalog',
    'tables',
    'orders',
    'kitchen',
    'cash',
    'inventory',
    'reports',
    'rls',
  ]
    .map((key) => metrics.byModule[key])
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const pyramidItems: PyramidChartItem[] = PYRAMID_ORDER.map((level) => ({
    ...metrics.byPyramidLevel[level],
    level,
    label: PYRAMID_LABELS[level],
  }));

  return (
    <div className="space-y-6">
      {/* Compact Context Strip */}
      <section className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 print-break-inside-avoid">
        <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
          {metadata.purpose}
        </p>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-medium">
            {metrics.manualCases} Manuales · {metrics.automatedCases} Auto
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs font-semibold">
            Plan: {metadata.status}
          </span>
        </div>
      </section>

      {/* Primary KPIs Grid (Clean, formula in popover ?) */}
      <section aria-label="Indicadores Clave de Calidad">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <KpiCard
            label="Tasa de Ejecución"
            value={`${metrics.executionRate}%`}
            sublabel={`${metrics.executedCases} de ${metrics.totalCases} casos ejecutados`}
            targetLabel="Meta: 100%"
            tone={metrics.executionRate === 100 ? 'success' : 'warning'}
            formula="(CP ejecutados / Total CP) × 100"
            substitution={`(${metrics.executedCases} / ${metrics.totalCases}) × 100 = ${metrics.executionRate}%`}
          />

          <KpiCard
            label="Tasa de Aprobación"
            value={`${metrics.passRate}%`}
            sublabel={`${metrics.passedCases} aprobados de ${metrics.executedCases} ejecutados`}
            targetLabel="Meta: ≥ 90%"
            tone={metrics.passRate >= 90 ? 'success' : 'warning'}
            formula="(CP aprobados / CP ejecutados) × 100"
            substitution={`(${metrics.passedCases} / ${metrics.executedCases}) × 100 = ${metrics.passRate}%`}
          />

          <KpiCard
            label="Cobertura de Requisitos"
            value={`${metrics.requirementCoverage}%`}
            sublabel={`${metrics.coveredRequirements} de ${metrics.inScopeRequirements} requisitos en alcance`}
            targetLabel="Meta: 100%"
            tone={metrics.requirementCoverage === 100 ? 'success' : 'warning'}
            formula="(Req. IN_SCOPE cubiertos / Total Req. IN_SCOPE) × 100"
            substitution={`(${metrics.coveredRequirements} / ${metrics.inScopeRequirements}) × 100 = ${metrics.requirementCoverage}%`}
          />

          <KpiCard
            label="Defectos Críticos / Altos (P1 + P2)"
            value={String(criticalOrHighOpen)}
            sublabel={`P1 abiertos: ${metrics.defectsBySeverity.P1.open} · P2 abiertos: ${metrics.defectsBySeverity.P2.open}`}
            targetLabel="Meta: 0 abiertos"
            tone={criticalOrHighOpen === 0 ? 'success' : 'danger'}
            formula="count(Defectos abiertos con severidad P1 o P2)"
            substitution={`P1 (${metrics.defectsBySeverity.P1.open}) + P2 (${metrics.defectsBySeverity.P2.open}) = ${criticalOrHighOpen}`}
          />

          <KpiCard
            label="Densidad de Defectos"
            value={`${metrics.openDefectDensity}`}
            sublabel={`${metrics.openDefects} abiertos · ${metrics.defectDensity} histórica (${metrics.totalDefects} total)`}
            targetLabel="Por cada CP"
            tone="neutral"
            formula="Defectos / Total casos de prueba"
            substitution={`Abiertos: ${metrics.openDefects}/${metrics.totalCases} = ${metrics.openDefectDensity} · Histórica: ${metrics.totalDefects}/${metrics.totalCases} = ${metrics.defectDensity}`}
          />

          <KpiCard
            label="Tasa de Reapertura"
            value={`${metrics.reopenRate}%`}
            sublabel={`${metrics.reopenedDefects} reabiertos de ${metrics.resolvedOrClosedDefects} resueltos/cerrados`}
            targetLabel="Meta: 0%"
            tone={metrics.reopenRate === 0 ? 'success' : 'warning'}
            formula="(Defectos reabiertos / Resueltos o cerrados) × 100"
            substitution={`(${metrics.reopenedDefects} / ${metrics.resolvedOrClosedDefects}) × 100 = ${metrics.reopenRate}%`}
          />
        </div>
      </section>

      {/* Bento Grid: Recharts Module Coverage (7 cols) + Pyramid & Severity (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 print-break-inside-avoid">
          <SectionHeader
            title="Cobertura por Módulo Funcional"
            subtitle="Casos aprobados vs. totales en los 8 módulos ERP y suite transversal RLS."
            icon={<BarChart3 className="w-4 h-4" />}
          />
          <div className="mt-5">
            <ModuleCoverageChart
              modules={modulesList}
              moduleLabels={MODULE_LABELS}
              onSelectModule={(module) => onNavigateToCasesWithFilter({ module })}
            />
          </div>
        </section>

        <section className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 print-break-inside-avoid">
            <SectionHeader
              title="Pirámide de Pruebas (L1–L6)"
              subtitle="Distribución de los 40 casos por nivel de automatización y verificación."
              icon={<Layers className="w-4 h-4" />}
            />
            <div className="mt-4">
              <PyramidDistributionChart
                levels={pyramidItems}
                onSelectLevel={(pyramidLevel) =>
                  onNavigateToCasesWithFilter({ pyramidLevel })
                }
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 print-break-inside-avoid">
            <SectionHeader
              title="Defectos por Severidad"
              icon={<Bug className="w-4 h-4" />}
              actions={
                <span className="font-mono text-xs text-slate-500">
                  {metrics.closedDefects} cerrados · {metrics.openDefects} abiertos
                </span>
              }
            />
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(['P1', 'P2', 'P3', 'P4'] as const).map((code) => {
                const sev = metrics.defectsBySeverity[code];
                return (
                  <div
                    key={code}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-slate-900">
                        {code}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {sev.severity}
                      </span>
                    </div>
                    <div className="mt-2 font-mono text-2xl font-bold text-slate-900">
                      {sev.total}
                    </div>
                    <div className="mt-1 text-[11px] font-mono flex items-center justify-between text-slate-500">
                      <span className={sev.open > 0 ? 'text-amber-700 font-semibold' : ''}>
                        {sev.open} ab.
                      </span>
                      <span className="text-emerald-700">{sev.closed} cer.</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Layered Detail Panel: Exit Gates | Module Matrix | ISTQB Techniques */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden print-break-inside-avoid">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200 w-fit no-print">
            <button
              type="button"
              onClick={() => setDetailTab('gates')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                detailTab === 'gates'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-orange-700" />
              Criterios de Salida (7)
            </button>
            <button
              type="button"
              onClick={() => setDetailTab('modules')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                detailTab === 'modules'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-orange-700" />
              Tabla por Módulo (9)
            </button>
            <button
              type="button"
              onClick={() => setDetailTab('techniques')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                detailTab === 'techniques'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-orange-700" />
              Técnicas ISTQB (4)
            </button>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs font-semibold w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Dictamen: CUMPLE UMBRALES DE CIERRE
          </span>
        </div>

        <div className="p-6">
          {detailTab === 'gates' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-medium">
                    <th className="py-2.5 px-3">Criterio de Completitud (§5.5)</th>
                    <th className="py-2.5 px-3">Umbral / Meta</th>
                    <th className="py-2.5 px-3">Valor Calculado</th>
                    <th className="py-2.5 px-3 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metadata.completionThresholds.map((gate) => {
                    const passed = evaluateThreshold(gate.metricKey);
                    return (
                      <tr key={gate.metricKey} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 text-slate-900 font-medium">
                          {gate.criterion}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600 font-semibold">
                          {gate.target}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-900">
                          {getLiveMetricValue(gate.metricKey)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {passed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              CUMPLIDO
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-mono font-semibold">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              EN REVISIÓN
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}

          {detailTab === 'modules' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-medium">
                    <th className="py-2.5 px-3">Módulo</th>
                    <th className="py-2.5 px-3 text-center">Total CP</th>
                    <th className="py-2.5 px-3 text-center">Manual / Auto</th>
                    <th className="py-2.5 px-3 text-center">Ejecutados</th>
                    <th className="py-2.5 px-3 text-center">PASSED</th>
                    <th className="py-2.5 px-3 text-center">FAILED</th>
                    <th className="py-2.5 px-3">Aprobación</th>
                    <th className="py-2.5 px-3 text-right">Defectos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {modulesList.map((mod) => (
                    <tr
                      key={mod.module}
                      onClick={() =>
                        onNavigateToCasesWithFilter({ module: mod.module })
                      }
                      className="hover:bg-orange-50/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3 font-sans font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px]">
                            {mod.module}
                          </span>
                          <span>{MODULE_LABELS[mod.module] ?? mod.module}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-900">
                        {mod.totalCases}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-500">
                        {mod.manualCases}M / {mod.automatedCases}A
                      </td>
                      <td className="py-3 px-3 text-center text-slate-800">
                        {mod.executedCases}/{mod.totalCases}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-emerald-700">
                        {mod.passedCases}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-red-700">
                        {mod.failedCases}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                mod.passRate === 100
                                  ? 'bg-emerald-600'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${mod.passRate}%` }}
                            />
                          </div>
                          <span
                            className={`font-semibold ${
                              mod.passRate === 100
                                ? 'text-emerald-700'
                                : 'text-amber-800'
                            }`}
                          >
                            {mod.passRate}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {mod.totalDefects === 0 ? (
                          <span className="text-slate-400">0 / 0</span>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded-md border ${
                              mod.openDefects > 0
                                ? 'bg-amber-50 text-amber-800 border-amber-200 font-semibold'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {mod.openDefects} ab. / {mod.totalDefects}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {detailTab === 'techniques' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(
                [
                  'EP',
                  'BVA',
                  'Tabla de decisión',
                  'Transición de estados',
                ] as DesignTechnique[]
              ).map((tech) => {
                const item = metrics.byTechnique[tech];
                const passPct =
                  item.executedCases > 0
                    ? Math.round((item.passedCases / item.executedCases) * 100)
                    : 0;

                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() =>
                      onNavigateToCasesWithFilter({ technique: tech })
                    }
                    className="text-left p-4 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                        {tech}
                      </span>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="font-semibold text-slate-900">
                          {item.totalCases} CP
                        </span>
                        <span className="text-emerald-700">
                          {item.passedCases} OK
                        </span>
                        {item.failedCases > 0 ? (
                          <span className="text-red-700">
                            {item.failedCases} FAIL
                          </span>
                        ) : null}
                        <span className="text-slate-500">({passPct}%)</span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                      {TECHNIQUE_DESCRIPTIONS[tech]}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};
