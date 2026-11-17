import React from 'react';
import type { DefectSeverityCode, TestStatus } from '../../domain/qa-types';

const TEST_STATUS_MAP: Record<
  TestStatus,
  { label: string; className: string }
> = {
  PASSED: {
    label: 'PASSED',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  FAILED: {
    label: 'FAILED',
    className: 'bg-red-50 text-red-800 border-red-200',
  },
  BLOCKED: {
    label: 'BLOCKED',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  SKIPPED: {
    label: 'SKIPPED',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  NOT_RUN: {
    label: 'NOT RUN',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

const SEVERITY_MAP: Record<
  DefectSeverityCode,
  { label: string; className: string }
> = {
  P1: {
    label: 'P1 Crítica',
    className: 'bg-red-700 text-white border-red-800',
  },
  P2: {
    label: 'P2 Alta',
    className: 'bg-red-50 text-red-800 border-red-200',
  },
  P3: {
    label: 'P3 Media',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  P4: {
    label: 'P4 Baja',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

export const TestStatusBadge: React.FC<{ status: TestStatus }> = ({ status }) => {
  const cfg = TEST_STATUS_MAP[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md border font-mono text-[11px] font-semibold ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: DefectSeverityCode }> = ({
  severity,
}) => {
  const cfg = SEVERITY_MAP[severity];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md border font-mono text-[11px] font-semibold ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
};
