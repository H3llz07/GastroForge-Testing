import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  icon,
  actions,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          {icon ? <span className="text-orange-700 shrink-0">{icon}</span> : null}
          <span className="truncate">{title}</span>
        </h2>
        {subtitle ? (
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            {subtitle}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
      ) : null}
    </div>
  );
};
