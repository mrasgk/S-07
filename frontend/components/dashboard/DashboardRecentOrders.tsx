import Link from 'next/link';
import type { StaffOrder } from '@/types/order';
import { ArrowLeft } from 'lucide-react';

interface DashboardRecentOrdersProps {
  orders: StaffOrder[];
  loading: boolean;
}

export default function DashboardRecentOrders({ orders, loading }: DashboardRecentOrdersProps) {
  return (
    <div className="lg:col-span-7 bg-white dark:bg-[#251D1A] rounded-3xl p-4 sm:p-6 border border-[#DCC9B2]/60 dark:border-white/10 shadow-xs">
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#DCC9B2]/30 dark:border-white/10 mb-3 sm:mb-4">
        <h2 className="text-sm sm:text-base font-bold text-[#38251E] dark:text-[#F7F3EC]">أحدث 5 طلبات</h2>
        <Link
          href="/staff/orders"
          className="text-xs text-[#B77B4B] hover:underline font-semibold flex items-center gap-1"
        >
          <span>عرض الكل</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2.5 py-2 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-14 bg-neutral-100 dark:bg-neutral-800 rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8 text-[#38251E]/50 dark:text-[#F7F3EC]/50 text-xs">
          لا توجد أي طلبات مسجلة حتى الآن.
        </div>
      ) : (
        <div className="space-y-2.5">
          {orders.map((order) => (
            <Link
              key={order.id}
              href="/staff/orders"
              className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F3EC]/60 dark:bg-[#1A1412]/60 border border-[#DCC9B2]/30 dark:border-white/5 hover:border-[#B77B4B]/40 transition-colors block"
            >
              <div className="min-w-0 pe-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#38251E] dark:text-[#F7F3EC]">
                    {order.orderNumber}
                  </span>
                  <span className="text-xs font-medium text-[#38251E]/80 dark:text-[#F7F3EC]/80 truncate">
                    {order.customerName}
                  </span>
                </div>
                <div className="text-[11px] text-[#38251E]/60 dark:text-[#F7F3EC]/60 truncate mt-0.5">
                  {order.coffeeName} ({order.quantity} كوب) • {order.totalPrice} د.م
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${order.status === 'New'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : order.status === 'Preparing'
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    }`}
                >
                  {order.statusArabic}
                </span>
                <ArrowLeft className="w-3.5 h-3.5 text-neutral-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
