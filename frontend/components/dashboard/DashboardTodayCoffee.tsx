import Link from 'next/link';
import type { DailyCoffee } from '@/types/coffee';
import { Sparkles, Edit3, Coffee, Plus } from 'lucide-react';

interface DashboardTodayCoffeeProps {
  coffee: DailyCoffee | null;
  loading: boolean;
}

export default function DashboardTodayCoffee({ coffee, loading }: DashboardTodayCoffeeProps) {
  return (
    <div className="lg:col-span-5 bg-white dark:bg-[#251D1A] rounded-3xl p-4 sm:p-6 border border-[#DCC9B2]/60 dark:border-white/10 shadow-xs">
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#DCC9B2]/30 dark:border-white/10 mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#B77B4B]" />
          <h2 className="text-sm sm:text-base font-bold text-[#38251E] dark:text-[#F7F3EC]">محصول اليوم النشط</h2>
        </div>

        {coffee && (
          <Link
            href={`/staff/coffees/${coffee.id}/edit`}
            className="text-xs text-[#B77B4B] hover:underline flex items-center gap-1 font-semibold"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>تعديل</span>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="space-y-3 py-4 animate-pulse">
          <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-2/3" />
          <div className="h-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg w-full" />
          <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
        </div>
      ) : coffee ? (
        <div className="space-y-3.5">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-bold text-[#38251E] dark:text-[#F7F3EC] truncate">
                {coffee.name}
              </h3>
              <span
                className={`shrink-0 text-[10px] px-2.5 py-0.5 rounded-full font-bold ${coffee.isAvailable && coffee.availableQuantity > 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                  }`}
              >
                {coffee.isAvailable && coffee.availableQuantity > 0 ? 'متاح للطلب' : 'غير متوفر'}
              </span>
            </div>
            <p className="text-xs text-[#38251E]/70 dark:text-[#F7F3EC]/70 mt-1 line-clamp-2 leading-relaxed">
              {coffee.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-[#F7F3EC] dark:bg-[#1A1412] p-3 rounded-2xl border border-[#DCC9B2]/30 dark:border-white/5">
            <div>
              <span className="text-[10px] text-[#38251E]/50 dark:text-[#F7F3EC]/50 block">المصدر</span>
              <span className="font-semibold text-[#38251E] dark:text-[#F7F3EC] truncate block">{coffee.origin || 'غير محدد'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#38251E]/50 dark:text-[#F7F3EC]/50 block">التحميص</span>
              <span className="font-semibold text-[#38251E] dark:text-[#F7F3EC] truncate block">{coffee.roastLevel || 'غير محدد'}</span>
            </div>
            <div className="pt-1.5 border-t border-[#DCC9B2]/20 dark:border-white/5">
              <span className="text-[10px] text-[#38251E]/50 dark:text-[#F7F3EC]/50 block">سعر الكوب</span>
              <span className="font-bold text-[#B77B4B]">{coffee.price} د.م</span>
            </div>
            <div className="pt-1.5 border-t border-[#DCC9B2]/20 dark:border-white/5">
              <span className="text-[10px] text-[#38251E]/50 dark:text-[#F7F3EC]/50 block">المخزون المتبقي</span>
              <span className="font-bold text-[#38251E] dark:text-[#F7F3EC]">{coffee.availableQuantity} كوب</span>
            </div>
          </div>

          <Link
            href="/staff/coffees"
            className="w-full text-center py-2.5 px-4 rounded-xl border border-[#DCC9B2] dark:border-white/10 hover:bg-[#F7F3EC] dark:hover:bg-white/5 text-xs font-semibold text-[#38251E] dark:text-[#F7F3EC] transition-colors block"
          >
            استعراض جميع المحاصيل
          </Link>
        </div>
      ) : (
        <div className="text-center py-6">
          <Coffee className="w-8 h-8 text-[#DCC9B2] dark:text-white/20 mx-auto mb-2" />
          <p className="text-xs font-medium text-[#38251E]/70 dark:text-[#F7F3EC]/70">لم يتم تحديد قهوة اليوم بعد</p>
          <Link
            href="/staff/coffees/new"
            className="mt-3 inline-flex items-center gap-1.5 text-xs bg-[#B77B4B] text-white px-3.5 py-2 rounded-xl font-medium hover:bg-[#38251E] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة محصول جديد</span>
          </Link>
        </div>
      )}
    </div>
  );
}