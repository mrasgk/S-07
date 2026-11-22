import type { StaffOrder, OrderStatus } from '@/types/order';
import { Phone, Eye, FileText, Flame, CheckCircle2, XCircle } from 'lucide-react';

interface StaffOrderCardProps {
  order: StaffOrder;
  isActioning: boolean;
  onSelect: (order: StaffOrder) => void;
  onStatusChange: (order: StaffOrder, newStatus: OrderStatus) => void;
}

export default function StaffOrderCard({
  order: o,
  isActioning,
  onSelect,
  onStatusChange,
}: StaffOrderCardProps) {
  return (
    <div className="bg-white dark:bg-[#251D1A] rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#DCC9B2]/60 dark:border-white/10 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow relative overflow-hidden">
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#DCC9B2]/30 dark:border-white/10 mb-2.5">
          <div>
            <span className="font-mono text-sm font-bold text-[#38251E] dark:text-[#F7F3EC] block">
              {o.orderNumber}
            </span>
            <span className="text-[10px] text-[#38251E]/50 dark:text-[#F7F3EC]/50 block">
              {new Date(o.createdAt).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                o.status === 'New'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : o.status === 'Preparing'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  : o.status === 'Ready'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : o.status === 'Completed'
                  ? 'bg-[#B77B4B]/15 text-[#B77B4B] border border-[#B77B4B]/30'
                  : o.status === 'Cancelled'
                  ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {o.statusArabic}
            </span>
            <button
              onClick={() => onSelect(o)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-[#B77B4B] hover:bg-[#F7F3EC] dark:hover:bg-white/5 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
              title="تفاصيل الطلب"
              aria-label="تفاصيل الطلب"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Customer Info */}
        <div className="space-y-1 mb-2.5 text-xs">
          <div className="font-semibold text-sm text-[#38251E] dark:text-[#F7F3EC] truncate">
            {o.customerName}
          </div>
          <a
            href={`tel:${o.customerPhone}`}
            dir="ltr"
            className="inline-flex items-center gap-1.5 text-xs text-[#B77B4B] hover:underline font-mono"
          >
            <Phone className="w-3 h-3" />
            <span>{o.customerPhone}</span>
          </a>
        </div>

        {/* Coffee & Price Summary */}
        <div className="bg-[#F7F3EC] dark:bg-[#1A1412] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl mb-2.5 space-y-1 text-xs border border-[#DCC9B2]/20 dark:border-white/5">
          <div className="flex justify-between items-center font-medium text-[#38251E] dark:text-[#F7F3EC]">
            <span className="truncate pe-2">{o.coffeeName}</span>
            <span className="font-bold shrink-0">{o.quantity} كوب</span>
          </div>
          <div className="flex justify-between items-center text-[11px] text-[#38251E]/70 dark:text-[#F7F3EC]/70 pt-1 border-t border-[#DCC9B2]/30 dark:border-white/5">
            <span>المجموع:</span>
            <span className="font-bold text-[#B77B4B]">{o.totalPrice} د.م</span>
          </div>
        </div>

        {o.customerNote && (
          <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 p-2 rounded-xl mb-2.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span className="line-clamp-2 text-[11px]">{o.customerNote}</span>
          </div>
        )}
      </div>

      {/* Status action buttons */}
      <div className="pt-2.5 border-t border-[#DCC9B2]/30 dark:border-white/10 mt-1 space-y-2">
        {o.status === 'New' && (
          <div className="flex gap-2">
            <button
              onClick={() => onStatusChange(o, 'Preparing')}
              disabled={isActioning}
              className="flex-1 bg-[#B77B4B] hover:bg-[#38251E] text-white py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              <Flame className="w-4 h-4" />
              <span>بدء التحضير</span>
            </button>
            <button
              onClick={() => onStatusChange(o, 'Cancelled')}
              disabled={isActioning}
              className="px-3 bg-red-50/60 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800/80 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
              title="إلغاء الطلب"
            >
              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>إلغاء الطلب</span>
            </button>
          </div>
        )}

        {o.status === 'Preparing' && (
          <div className="flex gap-2">
            <button
              onClick={() => onStatusChange(o, 'Ready')}
              disabled={isActioning}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تأكيد الجاهزية</span>
            </button>
            <button
              onClick={() => onStatusChange(o, 'Cancelled')}
              disabled={isActioning}
              className="px-3 bg-red-50/60 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800/80 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
              title="إلغاء الطلب"
            >
              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>إلغاء الطلب</span>
            </button>
          </div>
        )}

        {o.status === 'Ready' && (
          <div className="space-y-1.5">
            <div className="text-center py-1 text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>الطلب جاهز للاستلام</span>
            </div>
            <button
              onClick={() => onStatusChange(o, 'Completed')}
              disabled={isActioning}
              className="w-full bg-[#38251E] dark:bg-[#B77B4B] hover:bg-[#B77B4B] text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>تأكيد التسليم</span>
            </button>
          </div>
        )}

        {o.status === 'Completed' && (
          <div className="text-center py-2 text-xs text-neutral-500 font-medium">
            تم تسليم الطلب
          </div>
        )}

        {o.status === 'Cancelled' && (
          <div className="bg-red-50/70 dark:bg-red-950/30 border border-red-200/60 dark:border-red-900/40 p-2.5 rounded-xl mb-2.5 text-xs">
            <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400 font-semibold mb-0.5">
              <XCircle className="w-3.5 h-3.5" />
              <span>طلب ملغي</span>
            </div>
            {o.cancellationReason && (
              <p className="text-[11px] text-red-900 dark:text-red-200 line-clamp-2">
                سبب الإلغاء: {o.cancellationReason}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
