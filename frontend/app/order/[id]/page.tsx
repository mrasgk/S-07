'use client';

import { Suspense, useEffect, useState, use } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { CustomerOrder, OrderStatus } from '@/types/order';
import { fetchApi } from '@/lib/api';
import { createOrderHubConnection } from '@/lib/signalr';
import * as signalR from '@microsoft/signalr';
import { AlertCircle, Copy, Check, Radio, RotateCcw, ArrowRight, XCircle } from 'lucide-react';
import OrderTrackingTimeline from '@/components/OrderTrackingTimeline';
import CancelOrderModal from '@/components/CancelOrderModal';
import { useToast } from '@/components/ToastProvider';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

function TrackingContent({ params }: PageProps) {
  const resolvedParams = use(params);
  const orderNumber = decodeURIComponent(resolvedParams.id);
  const { success, error: toastError } = useToast();

  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchApi<CustomerOrder>(`/api/orders/${orderNumber}`);
      setOrder(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'تعذر تحميل بيانات الطلب.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderNumber) return;
    let ignore = false;

    async function fetchOrder() {
      try {
        const data = await fetchApi<CustomerOrder>(`/api/orders/${orderNumber}`);
        if (!ignore) {
          setOrder(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'تعذر العثور على الطلب.';
          setError(msg);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchOrder();

    return () => {
      ignore = true;
    };
  }, [orderNumber]);

  useEffect(() => {
    if (!orderNumber) return;

    let isDisposed = false;
    const connection = createOrderHubConnection();

    connection.on('OrderStatusUpdated', (updatedPayload: { orderNumber: string; status: OrderStatus; statusArabic: string; cancellationReason?: string }) => {
      if (updatedPayload.orderNumber.toUpperCase() === orderNumber.toUpperCase()) {
        setOrder(prev => prev ? {
          ...prev,
          status: updatedPayload.status,
          statusArabic: updatedPayload.statusArabic,
          cancellationReason: updatedPayload.cancellationReason ?? prev.cancellationReason
        } : null);
      }
    });

    connection.onreconnected(() => {
      if (isDisposed) return;
      setIsLiveConnected(true);
      connection.invoke('JoinOrderTracking', orderNumber).catch(() => {});
      loadOrder();
    });

    connection.onclose(() => {
      if (!isDisposed) setIsLiveConnected(false);
    });

    const startConnection = async () => {
      try {
        await connection.start();
        if (isDisposed) {
          await connection.stop();
          return;
        }
        setIsLiveConnected(true);
        await connection.invoke('JoinOrderTracking', orderNumber);
      } catch {
        // Fallback silently to REST polling without breaking UX
        if (!isDisposed) setIsLiveConnected(false);
      }
    };

    startConnection();

    return () => {
      isDisposed = true;
      if (connection.state === signalR.HubConnectionState.Connected) {
        connection.stop().catch(() => {});
      }
    };
  }, [orderNumber]);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancelOrder = async (reason: string) => {
    if (!order) return;
    try {
      setIsCancelling(true);
      const updated = await fetchApi<CustomerOrder>(`/api/orders/${order.orderNumber}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
      setOrder(updated);
      setCancelModalOpen(false);
      success('تم إلغاء الطلب بنجاح.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'تعذر إلغاء الطلب.';
      toastError(msg);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full py-12">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-xs text-[#38251E]/60 hover:text-[#38251E] flex items-center gap-1.5 font-medium transition-colors">
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة إلى الصفحة الرئيسية</span>
        </Link>

        {isLiveConnected && (
          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>تحديث حي متصل</span>
          </span>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-[#DCC9B2]/50 text-center shadow-sm">
          <Radio className="w-8 h-8 text-[#B77B4B] animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-[#38251E]">جاري استرجاع تفاصيل طلبك...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-3xl p-8 border border-red-200 text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#38251E] mb-1">تعذر العثور على الطلب</h3>
          <p className="text-xs text-red-600 mb-6">{error}</p>
          <button
            onClick={loadOrder}
            className="bg-[#38251E] hover:bg-[#B77B4B] text-[#F7F3EC] px-6 py-2.5 rounded-xl text-xs font-medium inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      ) : order && (
        <div className="bg-white dark:bg-[#251D1A] rounded-3xl p-5 sm:p-9 border border-[#DCC9B2]/60 dark:border-white/10 shadow-sm">
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DCC9B2]/30 dark:border-white/10">
            <div>
              <span className="text-[11px] font-medium text-[#38251E]/60 dark:text-[#F7F3EC]/60 block mb-1">
                الرقم المرجعي للطلب
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-lg sm:text-2xl font-extrabold text-[#38251E] dark:text-[#F7F3EC] tracking-wider select-all break-all">
                  {order.orderNumber}
                </span>
                <button
                  onClick={handleCopy}
                  title="نسخ رقم الطلب"
                  className="p-1.5 rounded-lg hover:bg-[#F7F3EC] dark:hover:bg-white/10 text-[#38251E]/70 dark:text-[#F7F3EC]/70 hover:text-[#38251E] transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center border border-[#DCC9B2]/40 dark:border-white/10"
                  aria-label="نسخ رقم الطلب"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                {order.queuePosition !== undefined && order.queuePosition > 0 && (order.status === 'New' || order.status === 'Preparing') && (
                  <span className="text-xs px-2.5 py-1 bg-[#38251E] dark:bg-[#B77B4B] text-white font-bold rounded-lg shadow-2xs">
                    طابور الانتظار: #{order.queuePosition}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              {(order.status === 'New' || order.status === 'Preparing') && (
                <button
                  onClick={() => setCancelModalOpen(true)}
                  className="text-xs px-3 py-1.5 font-semibold rounded-xl border border-red-300 dark:border-red-900 bg-red-50/70 dark:bg-red-950/40 hover:bg-red-100 text-red-700 dark:text-red-400 transition-colors cursor-pointer flex items-center gap-1.5 min-h-[36px]"
                  title="إلغاء الطلب"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>إلغاء الطلب</span>
                </button>
              )}
              <span
                className={`text-xs px-3.5 py-1.5 font-bold rounded-full border ${
                  order.status === 'Completed'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : order.status === 'Cancelled'
                    ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                    : 'bg-[#B77B4B]/15 text-[#B77B4B] border-[#B77B4B]/30'
                }`}
              >
                {order.statusArabic}
              </span>
              <button
                onClick={loadOrder}
                title="تحديث الحالة"
                className="p-2 rounded-xl hover:bg-[#F7F3EC] dark:hover:bg-white/10 text-[#38251E]/70 dark:text-[#F7F3EC]/70 hover:text-[#38251E] transition-colors cursor-pointer border border-[#DCC9B2]/40 dark:border-white/10 min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="تحديث الحالة"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Animated 4-Stage Order Tracking Timeline */}
          <OrderTrackingTimeline
            status={order.status}
            statusArabic={order.statusArabic}
            cancellationReason={order.cancellationReason}
          />

          {/* Order Details Card */}
          <div className="mt-6 bg-[#F7F3EC]/70 dark:bg-[#1A1412] rounded-2xl p-4 sm:p-5 border border-[#DCC9B2]/40 dark:border-white/10 space-y-3 text-xs">
            <h4 className="font-bold text-xs text-[#38251E] dark:text-[#F7F3EC] pb-2 border-b border-[#DCC9B2]/30 dark:border-white/10">
              تفاصيل الفاتورة والطلب
            </h4>
            <div className="flex justify-between items-center">
              <span className="text-[#38251E]/70 dark:text-[#F7F3EC]/70">نوع القهوة:</span>
              <span className="font-bold text-[#38251E] dark:text-[#F7F3EC]">{order.coffeeName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#38251E]/70 dark:text-[#F7F3EC]/70">سعر الكوب:</span>
              <span className="font-semibold text-[#38251E] dark:text-[#F7F3EC]">{order.unitPrice} د.م</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#38251E]/70 dark:text-[#F7F3EC]/70">الكمية:</span>
              <span className="font-semibold text-[#38251E] dark:text-[#F7F3EC]">{order.quantity} كوب</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#38251E]/70 dark:text-[#F7F3EC]/70">وقت الطلب:</span>
              <span className="font-mono text-[#38251E]/90 dark:text-[#F7F3EC]/90" dir="ltr">
                {new Date(order.createdAt).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2.5 border-t border-[#DCC9B2]/30 dark:border-white/10 font-bold text-sm text-[#B77B4B]">
              <span>المبلغ الإجمالي:</span>
              <span>{order.totalPrice} د.م</span>
            </div>
          </div>

          {/* Cancellation Modal */}
          <CancelOrderModal
            isOpen={cancelModalOpen}
            orderNumber={order.orderNumber}
            customerName="طلبك"
            isLoading={isCancelling}
            onCancel={() => setCancelModalOpen(false)}
            onConfirm={handleCancelOrder}
          />
        </div>
      )}
    </div>
  );
}

export default function OrderTrackingPage({ params }: PageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F3EC] dark:bg-[#1A1412] transition-colors">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={
          <div className="p-16 text-center text-sm text-[#38251E] dark:text-[#F7F3EC]">
            <Radio className="w-8 h-8 text-[#B77B4B] animate-spin mx-auto mb-3" />
            جاري استرجاع تفاصيل طلبك...
          </div>
        }>
          <TrackingContent params={params} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
