import type { StaffSummary } from '@/types/dashboard';
import { PriceDisplay } from '@/components/MadSymbol';
import {
  ShoppingBag,
  Clock,
  Flame,
  CheckCircle2,
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface DashboardStatsGridProps {
  summary: StaffSummary | null;
  loading: boolean;
}

export default function DashboardStatsGrid({ summary, loading }: DashboardStatsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6 w-full">
      {/* Total Orders */}
      <div className="bg-white dark:bg-[#251D1A] rounded-2xl p-3.5 sm:p-4 border border-[#DCC9B2]/60 dark:border-white/10 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#38251E]/10 dark:bg-white/10 text-[#38251E] dark:text-[#F7F3EC] flex items-center justify-center shrink-0">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] text-[#38251E]/60 dark:text-[#F7F3EC]/60 block font-medium truncate">إجمالي الطلبات</span>
          <span className="text-lg sm:text-xl font-black text-[#38251E] dark:text-[#F7F3EC] block">
            {loading ? '-' : summary?.totalOrders ?? 0}
          </span>
        </div>
      </div>

      {/* New Orders */}
      <div className="bg-white dark:bg-[#251D1A] rounded-2xl p-3.5 sm:p-4 border border-blue-200/60 dark:border-blue-900/40 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] text-[#38251E]/60 dark:text-[#F7F3EC]/60 block font-medium truncate">طلبات جديدة</span>
          <span className="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400 block">
            {loading ? '-' : summary?.newOrders ?? 0}
          </span>
        </div>
      </div>

      {/* In Preparation */}
      <div className="bg-white dark:bg-[#251D1A] rounded-2xl p-3.5 sm:p-4 border border-amber-200/60 dark:border-amber-900/40 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Flame className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] text-[#38251E]/60 dark:text-[#F7F3EC]/60 block font-medium truncate">قيد التحضير</span>
          <span className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 block">
            {loading ? '-' : summary?.preparingOrders ?? 0}
          </span>
        </div>
      </div>

      {/* Ready for Pickup */}
      <div className="bg-white dark:bg-[#251D1A] rounded-2xl p-3.5 sm:p-4 border border-emerald-200/60 dark:border-emerald-900/40 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] text-[#38251E]/60 dark:text-[#F7F3EC]/60 block font-medium truncate">جاهزة للاستلام</span>
          <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 block">
            {loading ? '-' : summary?.readyOrders ?? 0}
          </span>
        </div>
      </div>

      {/* Cancelled Orders */}
      <div className="bg-white dark:bg-[#251D1A] rounded-2xl p-3.5 sm:p-4 border border-red-200/60 dark:border-red-900/40 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] text-[#38251E]/60 dark:text-[#F7F3EC]/60 block font-medium truncate">طلبات ملغية</span>
          <span className="text-lg sm:text-xl font-black text-red-600 dark:text-red-400 block">
            {loading ? '-' : summary?.cancelledOrders ?? 0}
          </span>
        </div>
      </div>

      {/* Today's Revenue */}
      <div className="bg-white dark:bg-[#251D1A] rounded-2xl p-3.5 sm:p-4 border border-[#B77B4B]/40 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#B77B4B]/15 text-[#B77B4B] flex items-center justify-center shrink-0">
          <DollarSign className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] text-[#38251E]/60 dark:text-[#F7F3EC]/60 block font-medium truncate">إيرادات اليوم</span>
          <span className="text-lg sm:text-xl font-black text-[#B77B4B] block">
            {loading ? '-' : <PriceDisplay amount={summary?.todayRevenue ?? 0} weight="semibold" />}
          </span>
        </div>
      </div>

      {/* Total Accumulated Revenue */}
      <div className="bg-white dark:bg-[#251D1A] rounded-2xl p-3.5 sm:p-4 border border-emerald-500/30 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] text-[#38251E]/60 dark:text-[#F7F3EC]/60 block font-medium truncate">إجمالي الإيرادات</span>
          <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 block">
            {loading ? '-' : <PriceDisplay amount={summary?.totalRevenue ?? 0} weight="semibold" />}
          </span>
        </div>
      </div>
    </div>
  );
}
