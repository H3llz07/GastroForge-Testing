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
import type { CountBreakdownItem, PyramidLevel } from '../../domain/qa-types';

export interface PyramidChartItem extends CountBreakdownItem {
  level: PyramidLevel;
  label: string;
}

interface PyramidDistributionChartProps {
  levels: PyramidChartItem[];
  onSelectLevel: (level: PyramidLevel) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: PyramidChartItem }>;
}

const PyramidTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;

  return (
    <div className="rounded-lg bg-slate-900 text-slate-100 p-3 shadow-xl border border-slate-700 text-xs space-y-1">
      <div className="font-semibold text-white">{item.label}</div>
      <div className="font-mono text-emerald-300">
        {item.passedCases}/{item.totalCases} casos aprobados
      </div>
      <div className="text-[11px] text-orange-300">
        Click para filtrar en Catálogo
      </div>
    </div>
  );
};

export const PyramidDistributionChart: React.FC<PyramidDistributionChartProps> = ({
  levels,
  onSelectLevel,
}) => {
  return (
    <div className="space-y-3">
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={levels}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            barSize={26}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />
            <XAxis
              dataKey="level"
              tick={{ fill: '#0f172a', fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 600 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<PyramidTooltip />}
              cursor={{ fill: '#f1f5f9' }}
            />
            <Bar
              dataKey="totalCases"
              radius={[6, 6, 0, 0]}
              className="cursor-pointer"
              onClick={(entry) => {
                const lvl = (entry as unknown as { payload?: PyramidChartItem })?.payload?.level;
                if (lvl) {
                  onSelectLevel(lvl);
                }
              }}
            >
              {levels.map((entry) => (
                <Cell
                  key={entry.level}
                  fill={entry.passedCases === entry.totalCases ? '#0f172a' : '#c2410c'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {levels.map((item) => (
          <button
            key={item.level}
            type="button"
            onClick={() => onSelectLevel(item.level)}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-[11px] font-mono text-slate-700 transition-colors cursor-pointer"
          >
            <span className="font-semibold">{item.level}</span>
            <span className="text-slate-500">
              {item.passedCases}/{item.totalCases}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
