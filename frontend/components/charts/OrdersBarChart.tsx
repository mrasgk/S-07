'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import type { RevenueDataPoint } from '@/types/dashboard';

interface OrdersBarChartProps {
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
      <div className="bg-[#1A1412] dark:bg-[#1A1412] text-[#F7F3EC] p-3 rounded-xl shadow-xl border border-[#DCC9B2]/20 text-xs min-w-[130px] dir-rtl text-right">
        <p className="text-[#F7F3EC]/70 text-[11px] mb-1 font-medium">{dataPoint.dayName} ({dataPoint.date})</p>
        <p className="text-base font-bold text-[#38251E] dark:text-[#F7F3EC]">{dataPoint.ordersCount} طلبات</p>
        <p className="text-[11px] text-[#B77B4B] mt-0.5">{dataPoint.totalRevenue.toLocaleString()} د.م إيرادات</p>
      </div>
    );
  }
  return null;
}

export default function OrdersBarChart({ data, loading = false }: OrdersBarChartProps) {
  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-sm text-[#38251E]/50 dark:text-[#F7F3EC]/50">
        جاري تحميل عدد الطلبات...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-sm text-[#38251E]/50 dark:text-[#F7F3EC]/50">
        لا توجد بيانات طلبات متاحة
      </div>
    );
  }

  return (
    <div className="w-full h-64 sm:h-72 dir-ltr">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
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
            allowDecimals={false}
            tick={{ fontSize: 11, fill: 'currentColor' }}
            className="text-[#38251E]/60 dark:text-[#F7F3EC]/60"
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="ordersCount"
            fill="#38251E"
            radius={[6, 6, 0, 0]}
            className="fill-[#38251E] dark:fill-[#B77B4B]/80 hover:opacity-85 transition-opacity"
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
