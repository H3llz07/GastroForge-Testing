import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import type { ModuleBreakdownItem } from '../../domain/qa-types';

interface ModuleCoverageChartProps {
  modules: ModuleBreakdownItem[];
  moduleLabels: Record<string, string>;
  onSelectModule: (module: string) => void;
}

interface ChartDatum {
  module: string;
  label: string;
  totalCases: number;
  passedCases: number;
  remainingCases: number;
  manualCases: number;
  automatedCases: number;
  passRate: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDatum }>;
}

const ModuleTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;

  return (
    <div className="rounded-lg bg-slate-900 text-slate-100 p-3 shadow-xl border border-slate-700 text-xs space-y-1">
      <div className="font-semibold text-white">{data.label}</div>
      <div className="font-mono text-emerald-300">
        Aprobados: {data.passedCases}/{data.totalCases} ({data.passRate}%)
      </div>
      <div className="font-mono text-slate-300 text-[11px]">
        {data.manualCases} manuales · {data.automatedCases} automatizados
      </div>
      <div className="text-[11px] text-orange-300 pt-0.5">
        Click para ver casos del módulo
      </div>
    </div>
  );
};

export const ModuleCoverageChart: React.FC<ModuleCoverageChartProps> = ({
  modules,
  moduleLabels,
  onSelectModule,
}) => {
  const data: ChartDatum[] = modules.map((m) => ({
    module: m.module,
    label: moduleLabels[m.module] ?? m.module,
    totalCases: m.totalCases,
    passedCases: m.passedCases,
    remainingCases: Math.max(0, m.totalCases - m.passedCases),
    manualCases: m.manualCases,
    automatedCases: m.automatedCases,
    passRate: m.passRate,
  }));

  return (
    <div className="space-y-3">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 20, left: 8, bottom: 4 }}
            barSize={18}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="#e2e8f0"
            />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="module"
              width={84}
              tick={{ fill: '#0f172a', fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<ModuleTooltip />}
              cursor={{ fill: '#f1f5f9' }}
            />
            <Bar
              dataKey="passedCases"
              stackId="cases"
              radius={[0, 4, 4, 0]}
              className="cursor-pointer"
              onClick={(entry) => {
                const mod = (entry as unknown as { payload?: ChartDatum })?.payload?.module;
                if (mod) {
                  onSelectModule(mod);
                }
              }}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.module}
                  fill={entry.passedCases === entry.totalCases ? '#059669' : '#d97706'}
                />
              ))}
            </Bar>
            <Bar
              dataKey="remainingCases"
              stackId="cases"
              fill="#e2e8f0"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Drill-down Legend Pills */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {data.map((item) => (
          <button
            key={item.module}
            type="button"
            onClick={() => onSelectModule(item.module)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-[11px] font-mono text-slate-700 hover:text-orange-900 transition-colors cursor-pointer"
          >
            <span className="font-semibold">{item.module}</span>
            <span className="text-slate-400">
              {item.passedCases}/{item.totalCases}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
