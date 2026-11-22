'use client';

import { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface CancelOrderModalProps {
  isOpen: boolean;
  orderNumber: string;
  customerName: string;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

const PRESET_REASONS = [
  'طلب العميل الإلغاء',
  'نفاد الكمية',
  'تعذر تحضير الطلب',
  'طلب مكرر',
  'سبب آخر',
];

export default function CancelOrderModal({
  isOpen,
  orderNumber,
  customerName,
  isLoading = false,
  onCancel,
  onConfirm,
}: CancelOrderModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSelectPreset = (preset: string) => {
    if (preset === 'سبب آخر') {
      setReason('');
    } else {
      setReason(preset);
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();

    if (!trimmed) {
      setError('يرجى تحديد أو كتابة سبب إلغاء هذا الطلب.');
      return;
    }

    if (trimmed.length > 500) {
      setError('سبب الإلغاء يجب ألا يتجاوز 500 حرف.');
      return;
    }

    setError('');
    await onConfirm(trimmed);
  };

  const remainingChars = 500 - reason.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={!isLoading ? onCancel : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-[#251D1A] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-red-200 dark:border-red-900/60 text-start relative overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-5 left-5 p-1.5 rounded-full hover:bg-[#F7F3EC] dark:hover:bg-white/10 text-[#38251E]/60 dark:text-[#F7F3EC]/60 transition-colors cursor-pointer disabled:opacity-40"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#38251E] dark:text-[#F7F3EC]">
              إلغاء الطلب
            </h3>
            <p className="text-xs text-[#38251E]/70 dark:text-[#F7F3EC]/70 mt-0.5">
              هل أنت متأكد من رغبتك في إلغاء هذا الطلب ({orderNumber}) الخاص بـ ({customerName})؟ سيتم استرجاع المخزون تلقائياً.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Preset Buttons */}
          <div>
            <label className="block text-xs font-semibold text-[#38251E] dark:text-[#F7F3EC] mb-1.5">
              أسباب شائعة للاختيار السريع:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_REASONS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => handleSelectPreset(preset)}
                  disabled={isLoading}
                  className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    reason === preset
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-[#F7F3EC] dark:bg-white/5 border-[#DCC9B2]/40 dark:border-white/10 text-[#38251E]/80 dark:text-[#F7F3EC]/80 hover:bg-[#DCC9B2]/30'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-[#38251E] dark:text-[#F7F3EC]">
                سبب الإلغاء <span className="text-red-500">*</span>
              </label>
              <span
                className={`text-[10px] ${
                  remainingChars < 50
                    ? 'text-red-500 font-bold'
                    : 'text-[#38251E]/50 dark:text-[#F7F3EC]/50'
                }`}
              >
                المتبقي: {remainingChars} حرف
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={500}
              placeholder="اكتب سبب إلغاء الطلب..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCC9B2] dark:border-white/15 bg-white dark:bg-[#1A1412] text-xs sm:text-sm text-[#38251E] dark:text-[#F7F3EC] focus:outline-none focus:ring-2 focus:ring-red-500 resize-none disabled:opacity-50"
            />
            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#DCC9B2]/30 dark:border-white/10">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="w-1/3 py-2.5 rounded-xl border border-[#DCC9B2] dark:border-white/15 hover:bg-[#F7F3EC] dark:hover:bg-white/5 text-xs font-semibold text-[#38251E] dark:text-[#F7F3EC] transition-colors cursor-pointer disabled:opacity-40"
            >
              تراجع
            </button>
            <button
              type="submit"
              disabled={isLoading || !reason.trim()}
              className="w-2/3 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>جاري الإلغاء وإعادة المخزون...</span>
                </>
              ) : (
                <span>تأكيد الإلغاء</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
