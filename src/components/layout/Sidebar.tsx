import React from 'react';
import {
  Activity,
  ClipboardCheck,
  GitBranch,
  Bug,
  ShieldCheck,
  GitCommit,
  ExternalLink,
  X,
  FlaskConical,
} from 'lucide-react';
import type { QaMetadata } from '../../domain/qa-types';

export type DashboardTab =
  | 'overview'
  | 'test-cases'
  | 'traceability'
  | 'defects'
  | 'governance';

interface SidebarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  metadata: QaMetadata;
  totalCases: number;
  totalDefects: number;
  openDefects: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: DashboardTab;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  badge?: string;
  badgeTone?: 'neutral' | 'alert';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  metadata,
  totalCases,
  totalDefects,
  openDefects,
  mobileOpen,
  onCloseMobile,
}) => {
  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Resumen Ejecutivo',
      description: 'KPIs y cobertura',
      icon: Activity,
    },
    {
      id: 'test-cases',
      label: 'Casos de Prueba',
      description: 'Catálogo y grabador',
      icon: ClipboardCheck,
      badge: String(totalCases),
      badgeTone: 'neutral',
    },
    {
      id: 'traceability',
      label: 'Trazabilidad',
      description: 'Requisitos ↔ CP',
      icon: GitBranch,
    },
    {
      id: 'defects',
      label: 'Defectos',
      description: 'Incidencias e Issues',
      icon: Bug,
      badge: openDefects > 0 ? `${openDefects} ab.` : String(totalDefects),
      badgeTone: openDefects > 0 ? 'alert' : 'neutral',
    },
    {
      id: 'governance',
      label: 'Gobernanza',
      description: 'RACI, cronograma y cierre',
      icon: ShieldCheck,
    },
  ];

  const handleSelect = (tab: DashboardTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#111318] text-slate-300 border-r border-slate-800/80 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-orange-600/15 border border-orange-500/30 flex items-center justify-center shrink-0">
            <FlaskConical className="w-4 h-4 text-orange-400" />
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold text-sm text-white truncate tracking-tight">
              GastroForge QA
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              Evidence &amp; Traceability
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Cerrar menú"
          className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* SUT Frozen Commit Pill */}
      <div className="px-4 pt-4 pb-2">
        <div className="rounded-lg bg-slate-900/90 border border-slate-800 px-3 py-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>SUT Congelado</span>
            <span className="font-mono text-slate-400">v{metadata.version}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 font-mono text-xs text-white font-semibold">
            <GitCommit className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span>{metadata.frozenCommit}</span>
            <span className="ml-auto inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {metadata.status}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav aria-label="Secciones del Dashboard QA" className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1.5 text-[11px] font-medium text-slate-500">
          Vistas del Laboratorio
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer relative ${
                isActive
                  ? 'bg-white/[0.08] text-white'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
              }`}
            >
              {isActive ? (
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-orange-500"
                />
              ) : null}

              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive
                    ? 'text-orange-400'
                    : 'text-slate-500 group-hover:text-slate-300'
                }`}
              />

              <div className="min-w-0 flex-1">
                <div
                  className={`text-sm leading-tight truncate ${
                    isActive ? 'font-semibold text-white' : 'font-medium'
                  }`}
                >
                  {item.label}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {item.description}
                </div>
              </div>

              {item.badge ? (
                <span
                  className={`font-mono text-[11px] px-1.5 py-0.5 rounded-md border shrink-0 ${
                    item.badgeTone === 'alert'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                      : isActive
                        ? 'bg-slate-800 text-slate-200 border-slate-700'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* External References & Metadata Footer */}
      <div className="p-4 border-t border-slate-800/80 space-y-2.5 shrink-0">
        <div className="grid grid-cols-2 gap-2">
          <a
            href={metadata.sutRepo}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs transition-colors"
          >
            <span>Repo SUT</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
          <a
            href={`${metadata.qaRepo}/issues`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs transition-colors"
          >
            <span>Issues QA</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
        <div className="text-[11px] text-slate-500 leading-snug space-y-0.5">
          <div className="truncate text-slate-400 font-medium">{metadata.institution}</div>
          <div className="text-slate-500 break-words">{metadata.elaboratedBy}</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 z-30 no-print">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden no-print">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] z-10 shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      ) : null}
    </>
  );
};
