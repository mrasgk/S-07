'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import type { RevenueDataPoint } from '@/types/dashboard';

interface RevenueAreaChartProps {
  data: RevenueDataPoint[];
  loading?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: RevenueDataPoint }>;
  label?: string;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    return (
      <div className="bg-[#1A1412] dark:bg-[#1A1412] text-[#F7F3EC] p-3 rounded-xl shadow-xl border border-[#DCC9B2]/20 text-xs min-w-[150px] dir-rtl text-right">
        <p className="text-[#F7F3EC]/70 text-[11px] mb-1 font-medium">{dataPoint.dayName} ({dataPoint.date})</p>
        <p className="text-base font-bold text-[#B77B4B]">{dataPoint.totalRevenue.toLocaleString()} د.م</p>
        <p className="text-[11px] text-[#F7F3EC]/60 mt-0.5">{dataPoint.ordersCount} طلبات</p>
      </div>
    );
  }
  return null;
}

export default function RevenueAreaChart({ data, loading = false }: RevenueAreaChartProps) {
  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-sm text-[#38251E]/50 dark:text-[#F7F3EC]/50">
        جاري تحميل بيانات الإيرادات...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-sm text-[#38251E]/50 dark:text-[#F7F3EC]/50">
        لا توجد بيانات إيرادات متاحة في هذه الفترة
      </div>
    );
  }

  return (
    <div className="w-full h-64 sm:h-72 dir-ltr">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
        >
          <defs>
            <linearGradient id="revenueCaramelGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#B77B4B" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#B77B4B" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-[#DCC9B2]/30 dark:text-white/10" />
          <XAxis
            dataKey="dayName"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: 'currentColor' }}
            className="text-[#38251E]/60 dark:text-[#F7F3EC]/60"
            dy={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: 'currentColor' }}
            className="text-[#38251E]/60 dark:text-[#F7F3EC]/60"
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="totalRevenue"
            stroke="#B77B4B"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#revenueCaramelGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
