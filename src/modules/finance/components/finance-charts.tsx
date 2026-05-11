'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import type { FinanceMonthlyData } from '@/modules/finance/queries/get-finance-reports';

// -------------------------------------------------------
// Tipos internos para tooltips
// -------------------------------------------------------

type TooltipEntry = {
  name: string;
  value: number;
  color: string;
};

type AreaTooltipInternalProps = {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
};

type PieTooltipInternalProps = {
  active?: boolean;
  payload?: { name: string; value: number }[];
};

// -------------------------------------------------------
// Tooltip — gráfico de área
// -------------------------------------------------------

const AreaTooltip = ({ active, payload, label }: AreaTooltipInternalProps) => {
  if (!active || !payload?.length) return null;

  return (
    <div className='rounded-xl border border-white/10 bg-zinc-900 p-4 text-sm shadow-2xl'>
      <p className='mb-3 font-semibold text-white'>{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className='flex items-center gap-2 py-0.5'>
          <span
            className='h-2.5 w-2.5 shrink-0 rounded-full'
            style={{ backgroundColor: entry.color }}
          />
          <span className='text-zinc-400'>{entry.name}:</span>
          <span className='ml-auto font-semibold text-white'>
            {entry.value.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </span>
        </div>
      ))}
    </div>
  );
};

// -------------------------------------------------------
// Gráfico de área — evolução 6 meses
// -------------------------------------------------------

type FinanceAreaChartProps = {
  data: FinanceMonthlyData[];
};

export const FinanceAreaChart = ({ data }: FinanceAreaChartProps) => {
  return (
    <ResponsiveContainer width='100%' height={300}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id='gradProjected' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor='#ef4444' stopOpacity={0.15} />
            <stop offset='95%' stopColor='#ef4444' stopOpacity={0} />
          </linearGradient>
          <linearGradient id='gradRealized' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor='#10b981' stopOpacity={0.25} />
            <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray='3 3'
          stroke='rgba(255,255,255,0.06)'
          vertical={false}
        />
        <XAxis
          dataKey='month'
          tick={{ fill: '#71717a', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          dy={8}
        />
        <YAxis
          tick={{ fill: '#71717a', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={72}
          tickFormatter={(v: number) =>
            v === 0
              ? 'R$0'
              : `R$${v.toLocaleString('pt-BR', { notation: 'compact' })}`
          }
        />
        <Tooltip content={<AreaTooltip />} />
        <Legend
          iconType='circle'
          iconSize={8}
          wrapperStyle={{ fontSize: 12, color: '#a1a1aa', paddingTop: 16 }}
        />
        <Area
          type='monotone'
          dataKey='projected'
          name='Prevista'
          stroke='#ef4444'
          strokeWidth={2}
          strokeDasharray='5 3'
          fill='url(#gradProjected)'
          dot={false}
          activeDot={{
            r: 5,
            fill: '#ef4444',
            stroke: '#18181b',
            strokeWidth: 2,
          }}
        />
        <Area
          type='monotone'
          dataKey='realized'
          name='Realizada'
          stroke='#10b981'
          strokeWidth={2.5}
          fill='url(#gradRealized)'
          dot={{ r: 4, fill: '#10b981', stroke: '#18181b', strokeWidth: 2 }}
          activeDot={{
            r: 6,
            fill: '#10b981',
            stroke: '#18181b',
            strokeWidth: 2,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// -------------------------------------------------------
// Tooltip — gráfico de rosca
// -------------------------------------------------------

const PieTooltip = ({ active, payload }: PieTooltipInternalProps) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className='rounded-xl border border-white/10 bg-zinc-900 p-3 text-sm shadow-2xl'>
      <p className='font-semibold text-white'>{item.name}</p>
      <p className='text-zinc-400'>
        {item.value} fatura{item.value !== 1 ? 's' : ''}
      </p>
    </div>
  );
};

// -------------------------------------------------------
// Gráfico de rosca — adimplência
// -------------------------------------------------------

type FinanceDonutChartProps = {
  paid: number;
  pending: number;
  overdue: number;
};

type DonutEntry = {
  key: 'paid' | 'pending' | 'overdue';
  name: string;
  color: string;
};

const STATUS_CONFIG: DonutEntry[] = [
  { key: 'paid', name: 'Pagas', color: '#10b981' },
  { key: 'pending', name: 'Pendentes', color: '#f59e0b' },
  { key: 'overdue', name: 'Vencidas', color: '#ef4444' },
];

export const FinanceDonutChart = ({
  paid,
  pending,
  overdue,
}: FinanceDonutChartProps) => {
  const values: Record<DonutEntry['key'], number> = { paid, pending, overdue };

  const data = STATUS_CONFIG.map((s) => ({
    name: s.name,
    value: values[s.key],
    color: s.color,
  })).filter((d) => d.value > 0);

  const total = paid + pending + overdue;

  if (total === 0) {
    return (
      <div className='flex h-64 items-center justify-center text-sm text-zinc-500'>
        Nenhuma fatura no período selecionado.
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center gap-5'>
      {/* Rosca com total centralizado */}
      <div className='relative'>
        <ResponsiveContainer width={220} height={220}>
          <PieChart>
            <Pie
              data={data}
              cx='50%'
              cy='50%'
              innerRadius={72}
              outerRadius={100}
              paddingAngle={3}
              dataKey='value'
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} stroke='transparent' />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Valor central */}
        <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center'>
          <span className='text-3xl font-bold text-white'>{total}</span>
          <span className='text-xs text-zinc-400'>faturas</span>
        </div>
      </div>

      {/* Legenda em cards */}
      <div className='w-full space-y-2'>
        {data.map((entry) => (
          <div
            key={entry.name}
            className='flex items-center justify-between rounded-lg bg-zinc-900 px-4 py-2.5 text-sm'
          >
            <div className='flex items-center gap-2'>
              <span
                className='h-3 w-3 shrink-0 rounded-full'
                style={{ backgroundColor: entry.color }}
              />
              <span className='text-zinc-300'>{entry.name}</span>
            </div>
            <div className='flex items-center gap-3'>
              <span className='font-semibold text-white'>{entry.value}</span>
              <span className='w-10 text-right text-xs text-zinc-500'>
                {Math.round((entry.value / total) * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
