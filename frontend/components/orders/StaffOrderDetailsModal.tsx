import type { StaffOrder } from '@/types/order';
import { X, XCircle } from 'lucide-react';

interface StaffOrderDetailsModalProps {
  order: StaffOrder | null;
  onClose: () => void;
  onPromptCancel: (order: StaffOrder) => void;
}

export default function StaffOrderDetailsModal({
  order,
  onClose,
  onPromptCancel,
}: StaffOrderDetailsModalProps) {
  if (!order) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#251D1A] rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 border border-[#DCC9B2]/60 dark:border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto mb-3 sm:hidden" />

        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[#38251E]/60 dark:text-[#F7F3EC]/60"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base sm:text-lg font-bold text-[#38251E] dark:text-[#F7F3EC] mb-1">
          تفاصيل الطلب: {order.orderNumber}
        </h3>
        <p className="text-[11px] text-[#38251E]/60 dark:text-[#F7F3EC]/60 mb-3">
          وقت الإنشاء: {new Date(order.createdAt).toLocaleString('ar-MA')}
        </p>

        <div className="space-y-2.5 text-xs bg-[#F7F3EC] dark:bg-[#1A1412] p-3.5 sm:p-4 rounded-2xl border border-[#DCC9B2]/30 dark:border-white/5 mb-5">
          <div className="flex justify-between py-1 border-b border-[#DCC9B2]/20 dark:border-white/5">
            <span className="text-[#38251E]/60 dark:text-[#F7F3EC]/60">اسم الزبون:</span>
            <span className="font-bold text-[#38251E] dark:text-[#F7F3EC]">{order.customerName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#DCC9B2]/20 dark:border-white/5">
            <span className="text-[#38251E]/60 dark:text-[#F7F3EC]/60">رقم الهاتف:</span>
            <a href={`tel:${order.customerPhone}`} className="font-mono text-[#B77B4B] font-bold" dir="ltr">
              {order.customerPhone}
            </a>
          </div>
          <div className="flex justify-between py-1 border-b border-[#DCC9B2]/20 dark:border-white/5">
            <span className="text-[#38251E]/60 dark:text-[#F7F3EC]/60">القهوة المطلوبة:</span>
            <span className="font-semibold text-[#38251E] dark:text-[#F7F3EC]">{order.coffeeName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#DCC9B2]/20 dark:border-white/5">
            <span className="text-[#38251E]/60 dark:text-[#F7F3EC]/60">الكمية:</span>
            <span className="font-bold text-[#38251E] dark:text-[#F7F3EC]">{order.quantity} كوب</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#DCC9B2]/20 dark:border-white/5">
            <span className="text-[#38251E]/60 dark:text-[#F7F3EC]/60">سعر الكوب:</span>
            <span className="font-semibold text-[#38251E] dark:text-[#F7F3EC]">{order.unitPrice} د.م</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#DCC9B2]/20 dark:border-white/5 font-bold text-sm text-[#B77B4B]">
            <span>المبلغ الإجمالي:</span>
            <span>{order.totalPrice} د.م</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#DCC9B2]/20 dark:border-white/5">
            <span className="text-[#38251E]/60 dark:text-[#F7F3EC]/60">حالة الطلب:</span>
            <span className={`font-bold ${order.status === 'Cancelled' ? 'text-red-600' : 'text-[#38251E] dark:text-[#F7F3EC]'}`}>
              {order.statusArabic}
            </span>
          </div>
          {order.cancellationReason && (
            <div className="pt-2 bg-red-50/60 dark:bg-red-950/30 p-2.5 rounded-xl border border-red-200/50">
              <span className="text-red-700 dark:text-red-400 font-semibold block mb-0.5">سبب إلغاء الطلب:</span>
              <p className="text-red-900 dark:text-red-200">
                {order.cancellationReason}
              </p>
            </div>
          )}
          {order.customerNote && (
            <div className="pt-2">
              <span className="text-[#38251E]/60 dark:text-[#F7F3EC]/60 block mb-1">ملاحظة الزبون الخاصة:</span>
              <p className="bg-white/80 dark:bg-white/5 p-2 rounded-xl text-[#38251E] dark:text-[#F7F3EC] italic">
                {order.customerNote}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          {(order.status === 'New' || order.status === 'Preparing') && (
            <button
              onClick={() => onPromptCancel(order)}
              className="flex-1 border border-red-300 dark:border-red-800/80 bg-red-50/60 dark:bg-red-950/30 hover:bg-red-100 text-red-700 dark:text-red-400 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
            >
              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>إلغاء الطلب</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 bg-[#38251E] dark:bg-[#B77B4B] hover:bg-[#B77B4B] text-white py-3 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer min-h-[44px]"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
