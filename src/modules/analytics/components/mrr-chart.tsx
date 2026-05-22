'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatBRL } from '../lib/analytics-helpers';
import type { MrrPoint } from '../types/analytics';

type MrrChartProps = {
  data: MrrPoint[];
};

export function MrrChart({ data }: MrrChartProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">
            Evolução do MRR
          </h3>
          <p className="text-xs text-zinc-500">
            Receita recorrente paga nos últimos 6 meses.
          </p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#52525b"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis
              stroke="#52525b"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tickFormatter={(value: number) =>
                value >= 100000
                  ? `R$${(value / 100000).toFixed(0)}k`
                  : `R$${(value / 100).toFixed(0)}`
              }
            />
            <Tooltip
              cursor={{ stroke: '#ef4444', strokeWidth: 1 }}
              contentStyle={{
                backgroundColor: '#09090b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(value) => {
                const numeric =
                  typeof value === 'number' ? value : Number(value ?? 0);
                return [formatBRL(numeric), 'MRR'];
              }}
              labelStyle={{ color: '#a1a1aa' }}
            />
            <Line
              type="monotone"
              dataKey="valueCents"
              stroke="#ef4444"
              strokeWidth={2.5}
              dot={{ fill: '#ef4444', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
