'use client';

import { useEffect, useRef, useState } from 'react';
import type { OrderStatus } from '@/types/order';
import { Clock, Coffee, Sparkles, Check, XCircle, CheckCircle2 } from 'lucide-react';

interface OrderTimelineProps {
  status: OrderStatus;
  statusArabic: string;
  cancellationReason?: string;
}

const STAGES: Array<{
  id: OrderStatus;
  title: string;
  Icon: typeof Clock;
}> = [
    {
      id: 'New',
      title: 'جديد',
      Icon: Clock,
    },
    {
      id: 'Preparing',
      title: 'قيد التحضير',
      Icon: Coffee,
    },
    {
      id: 'Ready',
      title: 'جاهز للاستلام',
      Icon: Sparkles,
    },
    {
      id: 'Completed',
      title: 'تم التسليم',
      Icon: CheckCircle2,
    },
  ];

const STATUS_RANK: Record<OrderStatus, number> = {
  New: 0,
  Preparing: 1,
  Ready: 2,
  Completed: 3,
  Cancelled: -1,
};

export default function OrderTrackingTimeline({
  status,
  cancellationReason,
}: OrderTimelineProps) {
  const isCancelled = status === 'Cancelled';
  const isCompleted = status === 'Completed';
  const currentRank = STATUS_RANK[status] ?? 0;

  // Track previous rank to only animate during live transitions
  const isInitialMount = useRef(true);
  const [justAdvanced, setJustAdvanced] = useState(false);
  const prevRankRef = useRef(currentRank);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevRankRef.current = currentRank;
      return;
    }

    if (currentRank > prevRankRef.current && !isCancelled) {
      setJustAdvanced(true);
      const timer = setTimeout(() => {
        setJustAdvanced(false);
      }, 1000);
      prevRankRef.current = currentRank;
      return () => clearTimeout(timer);
    }

    prevRankRef.current = currentRank;
  }, [currentRank, isCancelled]);

  // Terminal Cancelled View
  if (isCancelled) {
    return (
      <div className="w-full my-6">
        <div className="bg-red-50/90 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-3xl p-6 sm:p-7 max-w-lg mx-auto text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <XCircle className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-red-100 dark:bg-red-900/70 text-red-800 dark:text-red-200 rounded-full inline-block mb-2">
            تم إلغاء الطلب
          </span>
          <h3 className="text-base sm:text-lg font-bold text-red-900 dark:text-red-200 mb-1">
            نعتذر، تم إلغاء هذا الطلب
          </h3>
          <p className="text-xs text-red-700/90 dark:text-red-300/90 leading-relaxed mb-4">
            لم يتم إكمال تجهيز هذا الطلب. إذا كان لديك أي استفسار، يرجى التحدث مع فريق الباريستا مباشرة.
          </p>

          {cancellationReason && (
            <div className="bg-white/90 dark:bg-[#1A1412] p-3.5 rounded-2xl border border-red-200/70 dark:border-red-900/50 text-start text-xs shadow-2xs">
              <span className="text-[10px] text-red-700 dark:text-red-400 font-bold block mb-1">
                سبب الإلغاء:
              </span>
              <p className="text-red-950 dark:text-red-100 font-medium leading-relaxed">
                {cancellationReason}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Percentage for progress line across the 4 steps (0%, 33.3%, 66.6%, 100%)
  const progressRatio = isCompleted ? 1 : Math.min(1, Math.max(0, currentRank / (STAGES.length - 1)));
  const progressPercent = progressRatio * 100;

  return (
    <div className="w-full my-6">
      {/* Visual Timeline Track */}
      <div className="relative max-w-lg mx-auto px-4 sm:px-6">
        {/* Continuous Inactive Background Line (RTL right-to-left) */}
        <div
          className="absolute top-5 sm:top-5.5 left-7 right-7 sm:left-9 sm:right-9 h-1 bg-[#DCC9B2]/60 dark:bg-white/15 rounded-full -translate-y-1/2 z-0"
          aria-hidden="true"
        />

        {/* Continuous Active Caramel Progress Line (RTL from right) */}
        <div
          className="absolute top-5 sm:top-5.5 right-7 sm:right-9 h-1 bg-[#B77B4B] rounded-full -translate-y-1/2 z-0 transition-all duration-700 ease-out"
          style={{ width: `calc(${progressRatio} * (100% - ${windowWidthFallbackOffset()}))` }}
          aria-hidden="true"
        />

        {/* 4 Stage Nodes: Right (New) -> Left (Delivered) */}
        <div className="relative z-10 flex items-start justify-between w-full">
          {STAGES.map((stage, index) => {
            const isStepCompleted = isCompleted || currentRank > index;
            const isCurrent = !isCompleted && currentRank === index;
            const isUpcoming = !isStepCompleted && !isCurrent;
            const shouldAnimate = justAdvanced && isStepCompleted && index === currentRank - 1;

            const IconComponent = stage.Icon;

            return (
              <div
                key={stage.id}
                className="flex flex-col items-center group relative min-w-[56px] sm:min-w-[72px]"
              >
                {/* Node Circle */}
                <div
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 relative ${isStepCompleted
                    ? 'bg-[#B77B4B] text-white shadow-sm ring-2 ring-[#B77B4B]/20'
                    : isCurrent
                      ? 'bg-[#38251E] dark:bg-[#251D1A] text-white shadow-md ring-4 ring-[#B77B4B]/35 scale-105'
                      : 'bg-[#F7F3EC] dark:bg-[#1A1412] text-[#38251E]/60 dark:text-[#F7F3EC]/60 border-2 border-[#DCC9B2]/80 dark:border-white/20'
                    }`}
                >
                  {isStepCompleted ? (
                    /* Completed Stage: Filled Caramel with Animated White Checkmark */
                    <div
                      className={`flex items-center justify-center ${shouldAnimate ? 'animate-in zoom-in-50 fade-in duration-500' : ''
                        }`}
                    >
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5]" />
                    </div>
                  ) : (
                    /* Current or Upcoming Stage: Original Icon */
                    <div
                      className={`flex items-center justify-center ${isCurrent
                        ? 'text-[#F7F3EC]'
                        : 'text-[#38251E]/60 dark:text-[#F7F3EC]/60'
                        }`}
                    >
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  )}

                  {/* Restrained pulse indicator on Current Stage */}
                  {isCurrent && (
                    <span
                      className="absolute -inset-1 rounded-full bg-[#B77B4B]/25 animate-ping -z-10 motion-reduce:hidden"
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Step Arabic Title - High contrast and legible */}
                <span
                  className={`text-[11px] sm:text-xs mt-2 font-semibold text-center transition-colors duration-300 ${isCurrent
                    ? 'text-[#38251E] dark:text-[#F7F3EC] font-bold'
                    : isStepCompleted
                      ? 'text-[#B77B4B] font-semibold'
                      : 'text-[#38251E]/70 dark:text-[#F7F3EC]/70 font-medium'
                    }`}
                >
                  {stage.title}
                </span>

                {/* Subtitle helper */}
                <span
                  className={`text-[9px] sm:text-[10px] mt-0.5 text-center hidden sm:block ${isCurrent
                    ? 'text-[#B77B4B] font-bold'
                    : isStepCompleted
                      ? 'text-[#B77B4B]/80 font-medium'
                      : 'text-[#38251E]/50 dark:text-[#F7F3EC]/50'
                    }`}
                >
                  {isStepCompleted ? 'مكتمل' : isCurrent ? 'الآن' : 'قريباً'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Notification Card */}
      <div className="mt-8 max-w-lg mx-auto">
        <StatusNotificationCard status={status} />
      </div>
    </div>
  );
}

function windowWidthFallbackOffset(): string {
  // 56px total margins (28px on each side) to match node centers
  return '56px';
}

function StatusNotificationCard({ status }: { status: OrderStatus }) {
  if (status === 'New') {
    return (
      <div className="bg-[#B77B4B]/10 dark:bg-[#B77B4B]/15 border border-[#B77B4B]/30 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 text-start transition-all shadow-2xs">
        <div className="w-10 h-10 rounded-xl bg-[#B77B4B] text-white flex items-center justify-center shrink-0 shadow-xs">
          <Clock className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-sm text-[#38251E] dark:text-[#F7F3EC]">
            تم تسجيل طلبك بنجاح
          </h4>
          <p className="text-xs text-[#38251E]/75 dark:text-[#F7F3EC]/75 mt-0.5 leading-relaxed">
            طلبك الآن في قائمة الانتظار لدى الباريستا.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'Preparing') {
    return (
      <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 text-start transition-all shadow-2xs">
        <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Coffee className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-sm text-amber-950 dark:text-amber-100">
            طلبك قيد التحضير
          </h4>
          <p className="text-xs text-amber-800/80 dark:text-amber-200/80 mt-0.5 leading-relaxed">
            يتم الآن تحضير قهوتك بكل عناية.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'Ready') {
    return (
      <div className="bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 text-start transition-all shadow-2xs">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
            قهوتك جاهزة!
          </h4>
          <p className="text-xs text-emerald-800/85 dark:text-emerald-200/85 mt-0.5 leading-relaxed">
            طلبك جاهز للاستلام. تفضل بزيارتنا.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'Completed') {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 text-start transition-all shadow-2xs">
        <div className="w-10 h-10 rounded-xl bg-[#B77B4B] text-white flex items-center justify-center shrink-0 shadow-xs">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-sm text-[#38251E] dark:text-[#F7F3EC]">
            تم تسليم طلبك بنجاح!
          </h4>
          <p className="text-xs text-[#38251E]/75 dark:text-[#F7F3EC]/75 mt-0.5 leading-relaxed">
            نتمنى لك تجربة قهوة رائعة.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
