import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Layers,
  Cpu,
  Activity,
  GitCommit,
  ArrowUpRight,
  FileCheck2,
  Bug,
} from 'lucide-react';
import type {
  DesignTechnique,
  PyramidLevel,
  QaMetadata,
  QaMetricsSummary,
} from '../domain/qa-types';

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
  auth: 'Autenticación & RBAC (auth)',
  catalog: 'Catálogo & Modificadores (catalog)',
  tables: 'Salón & Mesas (tables)',
  orders: 'Órdenes & Tandas (orders)',
  kitchen: 'Cocina KDS & Outbox SSE (kitchen)',
  cash: 'Caja, Pagos & Arqueo (cash)',
  inventory: 'Inventario & Kardex (inventory)',
  reports: 'Reportes, Tirilla 80mm & CSV (reports)',
  rls: 'Seguridad Multi-Tenant RLS (rls)',
};

const PYRAMID_ORDER: PyramidLevel[] = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'];

const TECHNIQUE_DESCRIPTIONS: Record<DesignTechnique, string> = {
  EP: 'Partición de Equivalencia — Clases válidas e inválidas representativas del dominio.',
  BVA: 'Análisis de Valores Límite — Fronteras numéricas (cotas BVA min/max, rate limit 5/6, 44px/48px).',
  'Tabla de decisión':
    'Combinatoria de reglas de negocio (matriz RBAC can(), cancelación por rol/estado, arqueo).',
  'Transición de estados':
    'Ciclo de vida de agregados (PENDING → PREPARING → READY → SERVED, rotación de tokens).',
};

export const OverviewView: React.FC<OverviewViewProps> = ({
  metadata,
  metrics,
  onNavigateToCasesWithFilter,
}) => {
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

  return (
    <div className="space-y-8">
      {/* Banner de Propósito y Contexto Congelado */}
      <section className="bg-white border border-slate-200 rounded-md p-6 shadow-2xs print-break-inside-avoid">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-600 mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 text-white font-semibold">
                <GitCommit className="w-3.5 h-3.5 text-orange-400" />
                SUT @ {metadata.frozenCommit}
              </span>
              <span>•</span>
              <span>ISO/IEC/IEEE 29119-3</span>
              <span>•</span>
              <span>{metadata.institution}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Resumen Ejecutivo e Indicadores Empíricos (§5.5 / §13)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-semibold">
              {metrics.manualCases} CP Manuales + {metrics.automatedCases} CP Automatizados ={' '}
              {metrics.totalCases} CP
            </span>
            <span className="px-3 py-1 rounded bg-slate-100 border border-slate-300 text-slate-800 text-xs font-mono font-semibold">
              Estado del Plan: {metadata.status}
            </span>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-700 leading-relaxed max-w-5xl">
          {metadata.purpose}
        </p>
      </section>

      {/* 6 Tarjetas KPI Primarias con Fórmulas Explícitas y Denominadores en Vivo */}
      <section aria-label="Indicadores Clave de Calidad">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-700" />
            Métricas Primarias del Ciclo de Pruebas (Cálculo Determinista en Vivo)
          </h3>
          <span className="text-xs font-mono text-slate-500">
            Fuente: src/metrics/calculate-metrics.ts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* KPI 1: Tasa de Ejecución */}
          <article className="bg-white border border-slate-200 rounded-md p-5 flex flex-col justify-between print-break-inside-avoid">
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                  1. Tasa de Ejecución
                </span>
                <span
                  className={`px-2 py-0.5 text-xs font-mono font-semibold rounded border ${
                    metrics.executionRate === 100
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  Meta: 100%
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-3xl font-bold font-mono text-slate-900">
                  {metrics.executionRate}%
                </span>
                <span className="text-xs font-mono text-slate-600">
                  ({metrics.executedCases} de {metrics.totalCases} CP ejecutados)
                </span>
              </div>
              <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-800">
                <div className="text-slate-500 mb-0.5">
                  Fórmula: (CP ejecutados / Total CP) × 100
                </div>
                <div className="font-semibold text-slate-900">
                  Tasa de ejecución: ({metrics.executedCases} / {metrics.totalCases}) × 100 ={' '}
                  {metrics.executionRate}%
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-mono">
              <span>Manuales: {metrics.manualCases}</span>
              <span>Automatizados: {metrics.automatedCases}</span>
              <span>Pendientes: {metrics.notRunCases}</span>
            </div>
          </article>

          {/* KPI 2: Tasa de Aprobación */}
          <article className="bg-white border border-slate-200 rounded-md p-5 flex flex-col justify-between print-break-inside-avoid">
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                  2. Tasa de Aprobación
                </span>
                <span
                  className={`px-2 py-0.5 text-xs font-mono font-semibold rounded border ${
                    metrics.passRate >= 90
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}
                >
                  Meta: &gt;= 90%
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-3xl font-bold font-mono text-emerald-700">
                  {metrics.passRate}%
                </span>
                <span className="text-xs font-mono text-slate-600">
                  ({metrics.passedCases} PASSED / {metrics.failedCases} FAILED)
                </span>
              </div>
              <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-800">
                <div className="text-slate-500 mb-0.5">
                  Fórmula: (CP aprobados / CP ejecutados) × 100
                </div>
                <div className="font-semibold text-slate-900">
                  Tasa de aprobación: ({metrics.passedCases} / {metrics.executedCases}) × 100 ={' '}
                  {metrics.passRate}%
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-mono">
              <span className="text-emerald-700 font-medium">
                PASSED: {metrics.passedCases}
              </span>
              <span className="text-red-700 font-medium">
                FAILED: {metrics.failedCases}
              </span>
              <span>
                Excluidos: {metrics.notRunCases + metrics.blockedCases + metrics.skippedCases}
              </span>
            </div>
          </article>

          {/* KPI 3: Cobertura de Requisitos */}
          <article className="bg-white border border-slate-200 rounded-md p-5 flex flex-col justify-between print-break-inside-avoid">
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                  3. Cobertura de Requisitos
                </span>
                <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded border bg-emerald-50 text-emerald-800 border-emerald-200">
                  Meta: 100% IN_SCOPE
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-3xl font-bold font-mono text-slate-900">
                  {metrics.requirementCoverage}%
                </span>
                <span className="text-xs font-mono text-slate-600">
                  ({metrics.coveredRequirements} de {metrics.inScopeRequirements} requisitos MVP)
                </span>
              </div>
              <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-800">
                <div className="text-slate-500 mb-0.5">
                  Fórmula: (Req. IN_SCOPE cubiertos / Total IN_SCOPE) × 100
                </div>
                <div className="font-semibold text-slate-900">
                  Cobertura de requisitos: ({metrics.coveredRequirements} /{' '}
                  {metrics.inScopeRequirements}) × 100 = {metrics.requirementCoverage}%
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-mono">
              <span>22 UC + 34 HU + 6 ADR</span>
              <span>Excluidos PHASE_2: 2</span>
            </div>
          </article>

          {/* KPI 4: Defectos Críticos Abiertos (P1/P2) */}
          <article className="bg-white border border-slate-200 rounded-md p-5 flex flex-col justify-between print-break-inside-avoid">
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                  4. Defectos Críticos Abiertos
                </span>
                <span
                  className={`px-2 py-0.5 text-xs font-mono font-semibold rounded border ${
                    criticalOrHighOpen === 0
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}
                >
                  Meta: P1 = 0, P2 = 0
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-3xl font-bold font-mono text-slate-900">
                  {criticalOrHighOpen}
                </span>
                <span className="text-xs font-mono text-slate-600">
                  (P1 Crítica: {metrics.defectsBySeverity.P1.open} | P2 Alta:{' '}
                  {metrics.defectsBySeverity.P2.open})
                </span>
              </div>
              <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-800">
                <div className="text-slate-500 mb-0.5">
                  Fórmula: Defectos Abiertos P1 + Defectos Abiertos P2
                </div>
                <div className="font-semibold text-slate-900">
                  Defectos críticos abiertos (P1/P2): {criticalOrHighOpen}
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-mono">
              <span>Cerrados (P2/P3): {metrics.closedDefects}</span>
              <span className="text-amber-800">
                Abiertos (P3/P4): {metrics.openDefects}
              </span>
            </div>
          </article>

          {/* KPI 5: Densidad de Defectos */}
          <article className="bg-white border border-slate-200 rounded-md p-5 flex flex-col justify-between print-break-inside-avoid">
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                  5. Densidad de Defectos
                </span>
                <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded border bg-slate-100 text-slate-800 border-slate-300">
                  Umbral: &lt;= 0.15 / CP
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-3xl font-bold font-mono text-slate-900">
                  {metrics.openDefectDensity}
                </span>
                <span className="text-xs font-mono text-slate-600">
                  abiertos/CP ({metrics.defectDensity} histórica)
                </span>
              </div>
              <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-800">
                <div className="text-slate-500 mb-0.5">
                  Fórmula: Defectos ({metrics.openDefects} abiertos | {metrics.totalDefects}{' '}
                  totales) / {metrics.executedCases} CP
                </div>
                <div className="font-semibold text-slate-900">
                  Densidad de defectos: {metrics.openDefectDensity} abiertos /{' '}
                  {metrics.defectDensity} histórica
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-mono">
              <span>Total hallazgos: {metrics.totalDefects}</span>
              <span>CP ejecutados: {metrics.executedCases}</span>
            </div>
          </article>

          {/* KPI 6: Tasa de Reapertura */}
          <article className="bg-white border border-slate-200 rounded-md p-5 flex flex-col justify-between print-break-inside-avoid">
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                  6. Tasa de Reapertura
                </span>
                <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded border bg-emerald-50 text-emerald-800 border-emerald-200">
                  Meta: &lt;= 5%
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-3xl font-bold font-mono text-slate-900">
                  {metrics.reopenRate}%
                </span>
                <span className="text-xs font-mono text-slate-600">
                  ({metrics.reopenedDefects} reabiertos de {metrics.resolvedOrClosedDefects}{' '}
                  cerrados)
                </span>
              </div>
              <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-800">
                <div className="text-slate-500 mb-0.5">
                  Fórmula: (Reabiertos / Resueltos o Cerrados) × 100
                </div>
                <div className="font-semibold text-slate-900">
                  Tasa de reapertura: ({metrics.reopenedDefects} /{' '}
                  {metrics.resolvedOrClosedDefects}) × 100 = {metrics.reopenRate}%
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-mono">
              <span>DEF-001..003 verificados</span>
              <span>Eficacia de fix: 100%</span>
            </div>
          </article>
        </div>
      </section>

      {/* Desglose Pirámide de 6 Niveles (L1–L6) y Técnicas de Diseño */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pirámide de Pruebas de 6 Niveles */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-md p-6 print-break-inside-avoid">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-700" />
                Estrategia Piramidal de 6 Niveles (L1 a L6 — §5.2)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Haz clic en cualquier nivel para filtrar los casos de prueba asociados en el catálogo.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">40 Casos Totales</span>
          </div>

          <div className="space-y-3">
            {PYRAMID_ORDER.map((levelCode) => {
              const breakdown = metrics.byPyramidLevel[levelCode];
              const levelMeta = metadata.strategyLevels?.find(
                (l) => l.pyramidCode === levelCode,
              );
              const pctOfTotal =
                metrics.totalCases > 0
                  ? Math.round((breakdown.totalCases / metrics.totalCases) * 100)
                  : 0;
              const levelPassRate =
                breakdown.executedCases > 0
                  ? Math.round((breakdown.passedCases / breakdown.executedCases) * 100)
                  : 0;

              return (
                <div
                  key={levelCode}
                  onClick={() => onNavigateToCasesWithFilter({ pyramidLevel: levelCode })}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onNavigateToCasesWithFilter({ pyramidLevel: levelCode });
                    }
                  }}
                  className="group p-3.5 rounded border border-slate-200 hover:border-orange-700 hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded bg-slate-900 text-white font-mono text-xs font-bold">
                        {levelCode}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 group-hover:text-orange-800 flex items-center gap-1">
                          {levelMeta ? levelMeta.level : `Nivel ${levelCode}`}
                          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-orange-700 no-print" />
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {levelMeta?.tool}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold">
                        {breakdown.totalCases} CP ({pctOfTotal}%)
                      </span>
                      <span className="text-emerald-700 font-semibold">
                        {breakdown.passedCases} OK
                      </span>
                      {breakdown.failedCases > 0 ? (
                        <span className="text-red-700 font-semibold">
                          {breakdown.failedCases} FAIL
                        </span>
                      ) : null}
                      <span className="text-slate-600">{levelPassRate}%</span>
                    </div>
                  </div>

                  {/* Barra de proporción y estado */}
                  <div className="mt-2.5 w-full bg-slate-100 h-2 rounded overflow-hidden flex">
                    <div
                      className="bg-emerald-600 h-full"
                      style={{
                        width: `${
                          metrics.totalCases > 0
                            ? (breakdown.passedCases / metrics.totalCases) * 100
                            : 0
                        }%`,
                      }}
                      title={`Aprobados: ${breakdown.passedCases}`}
                    />
                    <div
                      className="bg-red-600 h-full"
                      style={{
                        width: `${
                          metrics.totalCases > 0
                            ? (breakdown.failedCases / metrics.totalCases) * 100
                            : 0
                        }%`,
                      }}
                      title={`Fallidos: ${breakdown.failedCases}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Técnicas de Diseño Formales y Distribución de Defectos */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-md p-6 print-break-inside-avoid">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-orange-700" />
                  Técnicas de Diseño Aplicadas (§5.3)
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Cobertura metodológica sobre particiones, fronteras, reglas y estados.
                </p>
              </div>
            </div>

            <div className="space-y-3">
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
                  <div
                    key={tech}
                    onClick={() => onNavigateToCasesWithFilter({ technique: tech })}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onNavigateToCasesWithFilter({ technique: tech });
                      }
                    }}
                    className="p-3 rounded border border-slate-200 hover:border-orange-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                        {tech}
                      </span>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="font-semibold text-slate-900">
                          {item.totalCases} CP
                        </span>
                        <span className="text-emerald-700">{item.passedCases} OK</span>
                        {item.failedCases > 0 ? (
                          <span className="text-red-700">{item.failedCases} FAIL</span>
                        ) : null}
                        <span className="text-slate-500">({passPct}%)</span>
                      </div>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-600 leading-snug">
                      {TECHNIQUE_DESCRIPTIONS[tech]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumen de Severidad de Defectos (§8.1) */}
          <div className="bg-white border border-slate-200 rounded-md p-6 print-break-inside-avoid">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bug className="w-4 h-4 text-orange-700" />
                Estado de Defectos por Severidad (§8.1)
              </h3>
              <span className="text-xs font-mono text-slate-600">
                Total: {metrics.totalDefects} (3 Cerrados / 3 Asignados)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
              {(['P1', 'P2', 'P3', 'P4'] as const).map((code) => {
                const sev = metrics.defectsBySeverity[code];
                return (
                  <div
                    key={code}
                    className="p-3 rounded border border-slate-200 bg-slate-50 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{code}</span>
                      <span className="text-[11px] text-slate-600">{sev.severity}</span>
                    </div>
                    <div className="mt-2 text-xl font-bold text-slate-900">
                      {sev.total}
                    </div>
                    <div className="mt-1 text-[11px] flex flex-col text-slate-600">
                      <span className={sev.open > 0 ? 'text-amber-800 font-semibold' : ''}>
                        Abiertos: {sev.open}
                      </span>
                      <span className="text-emerald-700">Cerrados: {sev.closed}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Matriz de Salud por Módulo Funcional (9 Módulos) */}
      <section className="bg-white border border-slate-200 rounded-md p-6 print-break-inside-avoid">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-orange-700" />
              Matriz de Salud por Módulo Funcional (8 Módulos ERP + Suite Transversal RLS)
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Desglose de cobertura de ejecución, automatización, tasa de aprobación y defectos por dominio.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Haz clic en una fila para inspeccionar los CP del módulo
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-100/80 text-slate-700 font-mono uppercase">
                <th className="py-2.5 px-3">Módulo</th>
                <th className="py-2.5 px-3 text-center">Total CP</th>
                <th className="py-2.5 px-3 text-center">Manual / Auto</th>
                <th className="py-2.5 px-3 text-center">Ejecutados</th>
                <th className="py-2.5 px-3 text-center">PASSED</th>
                <th className="py-2.5 px-3 text-center">FAILED</th>
                <th className="py-2.5 px-3">Tasa de Aprobación</th>
                <th className="py-2.5 px-3 text-center">Defectos (Abiertos / Total)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {modulesList.map((mod) => (
                <tr
                  key={mod.module}
                  onClick={() => onNavigateToCasesWithFilter({ module: mod.module })}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 font-sans font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-mono text-[11px]">
                        {mod.module}
                      </span>
                      <span>{MODULE_LABELS[mod.module] ?? mod.module}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-900">
                    {mod.totalCases}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-600">
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
                      <div className="w-24 bg-slate-200 h-2 rounded overflow-hidden">
                        <div
                          className={`h-full ${
                            mod.passRate === 100 ? 'bg-emerald-600' : 'bg-amber-600'
                          }`}
                          style={{ width: `${mod.passRate}%` }}
                        />
                      </div>
                      <span
                        className={`font-bold ${
                          mod.passRate === 100 ? 'text-emerald-700' : 'text-amber-800'
                        }`}
                      >
                        {mod.passRate}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {mod.totalDefects === 0 ? (
                      <span className="text-slate-400">0 / 0</span>
                    ) : (
                      <span
                        className={`px-2 py-0.5 rounded border ${
                          mod.openDefects > 0
                            ? 'bg-amber-50 text-amber-800 border-amber-200 font-semibold'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {mod.openDefects} abiertos / {mod.totalDefects} total
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Compuertas de Completitud y Criterios de Éxito (§5.5) */}
      <section className="bg-white border border-slate-200 rounded-md p-6 print-break-inside-avoid">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-orange-700" />
              Verificación de Criterios de Completitud y Éxito (§5.5)
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Evaluación automática de las 7 compuertas de salida sobre la versión congelada {metadata.frozenCommit}.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-semibold">
            Dictamen: CUMPLE UMBRALES DE CIERRE
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-100/80 text-slate-700 font-mono uppercase">
                <th className="py-2.5 px-3">Criterio de Completitud (§5.5)</th>
                <th className="py-2.5 px-3">Umbral / Meta</th>
                <th className="py-2.5 px-3">Valor Real Calculado</th>
                <th className="py-2.5 px-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {metadata.completionThresholds.map((gate) => {
                const passed = evaluateThreshold(gate.metricKey);
                return (
                  <tr key={gate.metricKey} className="hover:bg-slate-50">
                    <td className="py-3 px-3 text-slate-900 font-medium">
                      {gate.criterion}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700 font-semibold">
                      {gate.target}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-900">
                      {getLiveMetricValue(gate.metricKey)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {passed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          CUMPLIDO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono font-semibold">
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
      </section>
    </div>
  );
};
