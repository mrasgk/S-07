'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { DailyCoffee } from '@/types/coffee';
import type { CreateOrderPayload, CustomerOrder } from '@/types/order';
import { fetchApi } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import { PriceDisplay } from '@/components/MadSymbol';
import {
  Sparkles,
  X,
  Plus,
  Minus,
  Loader2,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';

interface PreorderModalProps {
  coffee: DailyCoffee;
  isOpen: boolean;
  onClose: () => void;
}

export default function PreorderModal({ coffee, isOpen, onClose }: PreorderModalProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<CustomerOrder | null>(null);

  const totalPrice = coffee.price * quantity;

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setCreatedOrder(null);
      setQuantity(1);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerNote('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || customerName.trim().length < 2) {
      toastError('يرجى إدخال اسم عميل صحيح (حرفين على الأقل).');
      return;
    }

    const phoneRegex = /^(?:(?:\+|00)212|0)[5-7]\d{8}$/;
    const cleanPhone = customerPhone.trim().replace(/\s+/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      toastError('يرجى إدخال رقم هاتف مغربي صالح (مثال: 0612345678).');
      return;
    }

    if (quantity <= 0 || quantity > coffee.availableQuantity) {
      toastError(`الكمية المتاحة حالياً هي ${coffee.availableQuantity} كوب فقط.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateOrderPayload = {
        dailyCoffeeId: coffee.id,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        quantity,
        customerNote: customerNote.trim() || undefined
      };

      const result = await fetchApi<CustomerOrder>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setCreatedOrder(result);
      success(`تم استلام طلبك بنجاح! رقم الطلب: ${result.orderNumber}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'تعذر إتمام طلبك. يرجى المحاولة لاحقاً.';
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-[#251D1A] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#DCC9B2]/60 dark:border-white/10 text-start relative overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute top-5 left-5 p-1.5 rounded-full hover:bg-[#F7F3EC] dark:hover:bg-white/10 text-[#38251E]/60 dark:text-[#F7F3EC]/60 hover:text-[#38251E] dark:hover:text-white transition-colors cursor-pointer disabled:opacity-40"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {createdOrder ? (
          /* Success View inside Popup */
          <div className="text-center py-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 rounded-full inline-block mb-2">
              تم استلام طلبك بنجاح
            </span>
            <h3 className="text-xl font-bold text-[#38251E] dark:text-[#F7F3EC]">شكراً لك، {customerName}!</h3>
            <p className="text-xs text-[#38251E]/70 dark:text-[#F7F3EC]/70 mt-1">
              تم حجز قهوتك وسيبدأ الباريستا بتحضيرها قريباً.
            </p>

            <div className="bg-[#F7F3EC] dark:bg-[#1A1412] rounded-2xl p-4 my-5 text-start space-y-2 text-xs border border-[#DCC9B2]/40 dark:border-white/10">
              <div className="flex justify-between items-center pb-2 border-b border-[#DCC9B2]/30 dark:border-white/10">
                <span className="text-[#38251E]/60 dark:text-[#F7F3EC]/60">الرقم المرجعي:</span>
                <span className="font-mono font-bold text-[#38251E] dark:text-[#F7F3EC] tracking-wider select-all">
                  {createdOrder.orderNumber}
                </span>
              </div>
              {createdOrder.queuePosition !== undefined && createdOrder.queuePosition > 0 && (
                <div className="flex justify-between items-center pb-2 border-b border-[#DCC9B2]/30 dark:border-white/10 text-amber-900 dark:text-amber-200 bg-amber-50/60 dark:bg-amber-950/40 p-2 rounded-xl">
                  <span className="font-semibold">دورك في طابور التحضير:</span>
                  <span className="font-bold text-sm bg-[#B77B4B] text-white px-2 py-0.5 rounded-lg">
                    #{createdOrder.queuePosition}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-[#38251E]/60 dark:text-[#F7F3EC]/60">المحصول:</span>
                <span className="font-semibold text-[#38251E] dark:text-[#F7F3EC]">{createdOrder.coffeeName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#38251E]/60 dark:text-[#F7F3EC]/60">الكمية:</span>
                <span className="font-semibold text-[#38251E] dark:text-[#F7F3EC]">{createdOrder.quantity} كوب</span>
              </div>
              <div className="flex justify-between items-center font-bold text-sm text-[#B77B4B] pt-2 border-t border-[#DCC9B2]/30 dark:border-white/10">
                <span>المجموع:</span>
                <PriceDisplay amount={createdOrder.totalPrice} weight="semibold" className="text-[#B77B4B]" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => router.push(`/order/${createdOrder.orderNumber}`)}
                className="flex-1 bg-[#38251E] dark:bg-[#B77B4B] hover:bg-[#B77B4B] dark:hover:bg-[#38251E] text-[#F7F3EC] py-3 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>الانتقال لصفحة التتبع المباشر</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-3 rounded-xl border border-[#DCC9B2] dark:border-white/15 hover:bg-[#F7F3EC] dark:hover:bg-white/10 text-xs font-semibold text-[#38251E] dark:text-[#F7F3EC] transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        ) : (
          /* Order Form inside Popup */
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#B77B4B]" />
              <span className="text-xs font-semibold text-[#B77B4B]">حجز قهوة مختصة</span>
            </div>
            <h3 className="text-xl font-bold text-[#38251E] dark:text-[#F7F3EC]">{coffee.name}</h3>
            <p className="text-xs text-[#38251E]/70 dark:text-[#F7F3EC]/70 mt-1 mb-5">
              أدخل بياناتك لتأكيد طلب قهوتك واستلامها طازجة بدون انتظار.
            </p>

            {/* Coffee Summary Card in Modal */}
            <div className="bg-[#F7F3EC] dark:bg-[#1A1412] rounded-2xl p-3.5 mb-5 border border-[#DCC9B2]/40 dark:border-white/10 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-[#38251E]/60 dark:text-[#F7F3EC]/60 block">سعر الكوب الواحد</span>
                <PriceDisplay amount={coffee.price} weight="semibold" className="font-bold text-[#B77B4B] text-sm" />
              </div>
              <div className="text-end">
                <span className="text-[10px] text-[#38251E]/60 dark:text-[#F7F3EC]/60 block">المتوفر في المخزون</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{coffee.availableQuantity} كوب</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Customer Name */}
              <div>
                <label className="block text-xs font-medium text-[#38251E] dark:text-[#F7F3EC] mb-1.5">
                  الاسم الكامل <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: يوسف العلمي"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCC9B2] dark:border-white/15 bg-white dark:bg-[#1A1412] focus:outline-none focus:ring-2 focus:ring-[#B77B4B] text-xs sm:text-sm text-[#38251E] dark:text-[#F7F3EC] placeholder:text-[#38251E]/30 dark:placeholder:text-white/20 disabled:opacity-50"
                />
              </div>

              {/* Customer Phone */}
              <div>
                <label className="block text-xs font-medium text-[#38251E] dark:text-[#F7F3EC] mb-1.5">
                  رقم الهاتف (واتساب / اتصال) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  placeholder="0612345678"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCC9B2] dark:border-white/15 bg-white dark:bg-[#1A1412] focus:outline-none focus:ring-2 focus:ring-[#B77B4B] text-xs sm:text-sm text-[#38251E] dark:text-[#F7F3EC] placeholder:text-[#38251E]/30 dark:placeholder:text-white/20 text-start font-mono disabled:opacity-50"
                />
                <span className="text-[10px] text-[#38251E]/60 dark:text-[#F7F3EC]/60 mt-1 block">
                  يقبل الأرقام المغربية بصيغة (06XXXXXXXX أو 07XXXXXXXX).
                </span>
              </div>

              {/* Quantity selector */}
              <div>
                <label className="block text-xs font-medium text-[#38251E] dark:text-[#F7F3EC] mb-1.5">
                  عدد الأكواب
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-[#DCC9B2] dark:border-white/15 rounded-xl overflow-hidden bg-white dark:bg-[#1A1412]">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || isSubmitting}
                      className="px-3 py-2 text-[#38251E] dark:text-[#F7F3EC] hover:bg-[#F7F3EC] dark:hover:bg-white/10 transition-colors disabled:opacity-30 cursor-pointer"
                      aria-label="إنقاص الكمية"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 py-2 font-bold text-xs text-[#38251E] dark:text-[#F7F3EC] min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(coffee.availableQuantity, q + 1))}
                      disabled={quantity >= coffee.availableQuantity || isSubmitting}
                      className="px-3 py-2 text-[#38251E] dark:text-[#F7F3EC] hover:bg-[#F7F3EC] dark:hover:bg-white/10 transition-colors disabled:opacity-30 cursor-pointer"
                      aria-label="زيادة الكمية"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[11px] text-[#38251E]/60 dark:text-[#F7F3EC]/60">
                    كوب واحد أو أكثر
                  </span>
                </div>
              </div>

              {/* Optional Note */}
              <div>
                <label className="block text-xs font-medium text-[#38251E] dark:text-[#F7F3EC] mb-1.5">
                  ملاحظة خاصة للباريستا (اختياري)
                </label>
                <textarea
                  rows={2}
                  maxLength={200}
                  placeholder="أي تفضيل خاص بقهوتك..."
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCC9B2] dark:border-white/15 bg-white dark:bg-[#1A1412] focus:outline-none focus:ring-2 focus:ring-[#B77B4B] text-xs text-[#38251E] dark:text-[#F7F3EC] placeholder:text-[#38251E]/30 dark:placeholder:text-white/20 disabled:opacity-50 resize-none"
                />
              </div>

              {/* Price Calculation Bar */}
              <div className="bg-[#F7F3EC] dark:bg-[#1A1412] p-3 rounded-2xl flex items-center justify-between text-xs font-semibold text-[#38251E] dark:text-[#F7F3EC] border border-[#DCC9B2]/30 dark:border-white/10">
                <span>المجموع الكلي:</span>
                <PriceDisplay amount={totalPrice} weight="semibold" className="text-base font-bold text-[#B77B4B]" />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="w-1/3 py-2.5 rounded-xl border border-[#DCC9B2] dark:border-white/15 hover:bg-[#F7F3EC] dark:hover:bg-white/10 text-xs font-semibold text-[#38251E] dark:text-[#F7F3EC] transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 bg-[#38251E] dark:bg-[#B77B4B] hover:bg-[#B77B4B] dark:hover:bg-[#38251E] text-[#F7F3EC] py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري التأكيد...</span>
                    </>
                  ) : (
                    <span>تأكيد الحجز الآن</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
