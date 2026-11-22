'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import type { StatusDistributionPoint } from '@/types/dashboard';

interface OrderStatusDonutChartProps {
  data: StatusDistributionPoint[];
  totalOrders: number;
  loading?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: StatusDistributionPoint }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-[#1A1412] text-[#F7F3EC] p-2.5 rounded-xl shadow-xl border border-[#DCC9B2]/20 text-xs min-w-[120px] dir-rtl text-right">
        <p className="font-bold flex items-center gap-1.5" style={{ color: item.color }}>
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
          {item.statusArabic}
        </p>
        <p className="text-sm font-semibold mt-1">{item.count} طلبات</p>
      </div>
    );
  }
  return null;
}

export default function OrderStatusDonutChart({
  data,
  totalOrders,
  loading = false
}: OrderStatusDonutChartProps) {
  if (loading) {
    return (
      <div className="w-full h-56 flex items-center justify-center text-sm text-[#38251E]/50 dark:text-[#F7F3EC]/50">
        جاري تحميل توزيع الحالات...
      </div>
    );
  }

  // Fallback if data is empty or all counts are 0
  const hasOrders = totalOrders > 0 && data.some((d) => d.count > 0);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full h-52 flex items-center justify-center">
        {hasOrders ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                dataKey="count"
                nameKey="statusArabic"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-36 h-36 rounded-full border-4 border-dashed border-[#DCC9B2]/40 dark:border-white/10 flex items-center justify-center text-xs text-[#38251E]/40 dark:text-[#F7F3EC]/40">
            لا توجد طلبات
          </div>
        )}

        {/* Center Total Count */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-[#38251E] dark:text-[#F7F3EC]">
            {totalOrders}
          </span>
          <span className="text-[10px] text-[#38251E]/60 dark:text-[#F7F3EC]/60 font-medium">
            طلب
          </span>
        </div>
      </div>

      {/* Textual Legend */}
      <div className="grid grid-cols-2 gap-2 w-full mt-3 pt-3 border-t border-[#DCC9B2]/20 dark:border-white/10 text-xs">
        {data.map((item) => (
          <div key={item.status} className="flex items-center justify-between p-1.5 rounded-lg bg-[#F7F3EC]/50 dark:bg-white/5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[#38251E]/80 dark:text-[#F7F3EC]/80 text-[11px] font-medium truncate">
                {item.statusArabic}
              </span>
            </div>
            <span className="font-bold text-[#38251E] dark:text-[#F7F3EC] text-xs">
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
