'use client';

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { EnrollmentsPoint } from '../types/analytics';

type EnrollmentsChartProps = {
  data: EnrollmentsPoint[];
};

export function EnrollmentsChart({ data }: EnrollmentsChartProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">
            Matrículas vs cancelamentos
          </h3>
          <p className="text-xs text-zinc-500">
            Entradas (verde), saídas (vermelho) e saldo líquido (azul).
          </p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
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
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#09090b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#a1a1aa' }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              iconType="circle"
            />
            <Bar
              name="Entradas"
              dataKey="entries"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              name="Saídas"
              dataKey="exits"
              fill="#ef4444"
              radius={[6, 6, 0, 0]}
            />
            <Line
              name="Saldo líquido"
              type="monotone"
              dataKey="net"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
