import React from 'react';
import { Menu, RotateCcw, Download, Printer, GitCommit } from 'lucide-react';
import type { DashboardTab } from './Sidebar';

interface TopbarProps {
  activeTab: DashboardTab;
  frozenCommit: string;
  hasLocalOverrides: boolean;
  onOpenMobileMenu: () => void;
  onResetSnapshot: () => void;
  onExportTestRunsJson: () => void;
  onPrint: () => void;
}

const TAB_META: Record<DashboardTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Resumen Ejecutivo & KPIs',
    subtitle: 'Indicadores empíricos, cobertura por módulo y criterios de salida',
  },
  'test-cases': {
    title: 'Catálogo de Casos de Prueba',
    subtitle: '40 casos verificables (15 manuales, 25 automatizados) y grabador en vivo',
  },
  traceability: {
    title: 'Matriz de Trazabilidad',
    subtitle: 'Cobertura bidireccional de requisitos MVP y exclusiones de Fase 2',
  },
  defects: {
    title: 'Registro de Defectos',
    subtitle: 'Taxonomía dual (DEF / GF-BUG) enlazada a GitHub Issues',
  },
  governance: {
    title: 'Gobernanza & Sustentación',
    subtitle: 'Equipo QA, matriz RACI, ambientes, cronograma y firmas',
  },
};

export const Topbar: React.FC<TopbarProps> = ({
  activeTab,
  frozenCommit,
  hasLocalOverrides,
  onOpenMobileMenu,
  onResetSnapshot,
  onExportTestRunsJson,
  onPrint,
}) => {
  const meta = TAB_META[activeTab];

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 no-print">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Abrir menú de navegación"
            className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-base sm:text-lg font-bold text-slate-900 truncate">
                {meta.title}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[11px]">
                <GitCommit className="w-3 h-3 text-orange-600" />
                {frozenCommit}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate hidden sm:block">
              {meta.subtitle}
            </p>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {hasLocalOverrides ? (
            <button
              type="button"
              onClick={onResetSnapshot}
              title="Descartar ediciones locales y volver al snapshot oficial"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden md:inline">Restaurar {frozenCommit}</span>
              <span className="md:hidden">Restaurar</span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={onExportTestRunsJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline font-mono">test-runs.json</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-700 hover:bg-orange-800 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Imprimir / PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
