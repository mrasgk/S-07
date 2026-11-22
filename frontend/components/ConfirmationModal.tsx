'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, HelpCircle, X, Loader2 } from 'lucide-react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger' | 'warning';
  isLoading?: boolean;
  children?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  description,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  variant = 'primary',
  isLoading = false,
  children,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#DCC9B2]/60 text-start relative overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-5 left-5 p-1.5 rounded-full hover:bg-[#F7F3EC] text-[#38251E]/60 hover:text-[#38251E] transition-colors cursor-pointer disabled:opacity-40"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isDanger
                ? 'bg-red-50 text-red-600'
                : isWarning
                ? 'bg-amber-50 text-amber-600'
                : 'bg-[#F7F3EC] text-[#B77B4B]'
            }`}
          >
            {isDanger ? (
              <AlertCircle className="w-6 h-6" />
            ) : isWarning ? (
              <HelpCircle className="w-6 h-6" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>

          <div className="flex-1 pe-6">
            <h3 className="text-lg font-bold text-[#38251E] leading-snug">{title}</h3>
            <p className="text-xs sm:text-sm text-[#38251E]/70 mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {children && <div className="my-4">{children}</div>}

        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#DCC9B2]/30">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-xs ${
              isDanger
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-[#38251E] hover:bg-[#B77B4B] text-[#F7F3EC]'
            }`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{confirmLabel}</span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="py-3 px-5 rounded-xl border border-[#DCC9B2] hover:bg-[#F7F3EC] text-xs sm:text-sm font-medium text-[#38251E] transition-colors cursor-pointer disabled:opacity-40"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
