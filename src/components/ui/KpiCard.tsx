import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

export type KpiTone = 'success' | 'warning' | 'danger' | 'neutral';

interface KpiCardProps {
  label: string;
  value: string;
  sublabel: string;
  targetLabel: string;
  tone?: KpiTone;
  formula: string;
  substitution: string;
}

const TONE_CLASSES: Record<KpiTone, string> = {
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  danger: 'bg-red-50 text-red-800 border-red-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  sublabel,
  targetLabel,
  tone = 'neutral',
  formula,
  substitution,
}) => {
  const [showFormula, setShowFormula] = useState(false);

  return (
    <article className="relative bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between transition-colors hover:border-slate-300 print-break-inside-avoid">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-slate-500">{label}</span>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`px-2 py-0.5 text-[11px] font-medium rounded-md border ${TONE_CLASSES[tone]}`}
          >
            {targetLabel}
          </span>

          <button
            type="button"
            onClick={() => setShowFormula((prev) => !prev)}
            onBlur={() => setShowFormula(false)}
            aria-label={`Ver fórmula de ${label}`}
            aria-expanded={showFormula}
            className="no-print p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2.5">
        <span className="text-3xl font-bold font-mono tabular-nums tracking-tight text-slate-900">
          {value}
        </span>
      </div>

      <div className="mt-1.5 text-xs text-slate-500">{sublabel}</div>

      {showFormula ? (
        <div
          role="tooltip"
          className="absolute right-4 top-12 z-20 w-72 rounded-lg bg-slate-900 text-slate-100 p-3 shadow-xl border border-slate-700 text-xs font-mono space-y-1.5 no-print"
        >
          <div className="text-slate-400 text-[11px]">{formula}</div>
          <div className="text-emerald-300 font-semibold leading-snug">
            {substitution}
          </div>
        </div>
      ) : null}

      {/* Print-only compact formula line */}
      <div className="hidden print-only mt-2 pt-1.5 border-t border-slate-200 text-[10px] font-mono text-slate-600">
        {substitution}
      </div>
    </article>
  );
};
