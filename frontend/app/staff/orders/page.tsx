'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { createOrderHubConnection } from '@/lib/signalr';
import * as signalR from '@microsoft/signalr';
import type { StaffOrder, OrderStatus } from '@/types/order';
import { useToast } from '@/components/ToastProvider';
import ConfirmationModal from '@/components/ConfirmationModal';
import CancelOrderModal from '@/components/CancelOrderModal';
import StaffLayout from '@/components/StaffLayout';
import StaffOrderCard from '@/components/orders/StaffOrderCard';
import StaffOrderDetailsModal from '@/components/orders/StaffOrderDetailsModal';
import {
  Search,
  RefreshCw,
  X,
  Clock,
} from 'lucide-react';

export default function StaffOrdersPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<StaffOrder | null>(null);

  // Cancellation Modal state
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean;
    orderId: string;
    orderNumber: string;
    customerName: string;
  }>({
    isOpen: false,
    orderId: '',
    orderNumber: '',
    customerName: '',
  });

  // Regular Confirmation Modal (e.g. for Completed)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    orderId: string;
    orderNumber: string;
    targetStatus: OrderStatus;
    title: string;
    description: string;
    variant: 'primary' | 'danger' | 'warning';
  }>({
    isOpen: false,
    orderId: '',
    orderNumber: '',
    targetStatus: 'Completed',
    title: '',
    description: '',
    variant: 'primary',
  });

  const loadOrders = async () => {
    try {
      const url = statusFilter === 'All'
        ? '/api/staff/orders'
        : `/api/staff/orders?status=${statusFilter}`;

      const data = await fetchApi<StaffOrder[]>(url);
      setOrders(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'تعذر تحميل الطلبات.';
      if (msg.includes('تسجيل الدخول') || msg.includes('401')) {
        router.push('/staff/login');
      } else {
        toastError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function init() {
      try {
        const url = statusFilter === 'All'
          ? '/api/staff/orders'
          : `/api/staff/orders?status=${statusFilter}`;

        const data = await fetchApi<StaffOrder[]>(url);
        if (!ignore) {
          setOrders(data);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'تعذر تحميل الطلبات.';
          if (msg.includes('تسجيل الدخول') || msg.includes('401')) {
            router.push('/staff/login');
          } else {
            setLoading(false);
          }
        }
      }
    }

    init();

    return () => {
      ignore = true;
    };
  }, [statusFilter, router]);

  // SignalR live updates
  useEffect(() => {
    let isDisposed = false;
    const connection = createOrderHubConnection();

    connection.on('OrderCreated', () => {
      if (!isDisposed) loadOrders();
    });

    connection.on('StaffOrderStatusChanged', () => {
      if (!isDisposed) loadOrders();
    });

    const start = async () => {
      try {
        await connection.start();
        if (isDisposed) {
          connection.stop().catch(() => {});
          return;
        }
        await connection.invoke('JoinStaffDashboard');
      } catch {
        // silent
      }
    };

    start();

    return () => {
      isDisposed = true;
      if (connection.state === signalR.HubConnectionState.Connected) {
        connection.stop().catch(() => {});
      }
    };
  }, [statusFilter]);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setActionLoading(orderId);
      await fetchApi<StaffOrder>(`/api/staff/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      await loadOrders();
      success('تم تحديث حالة الطلب بنجاح.');
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'تعذر تحديث حالة الطلب.';
      toastError(msg);
    } finally {
      setActionLoading(null);
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const handleCancelOrder = async (reason: string) => {
    const { orderId } = cancelModal;
    if (!orderId) return;

    try {
      setActionLoading(orderId);
      await fetchApi<StaffOrder>(`/api/staff/orders/${orderId}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
      await loadOrders();
      success('تم إلغاء الطلب بنجاح.');
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, status: 'Cancelled', cancellationReason: reason } : null);
      }
      setCancelModal({ isOpen: false, orderId: '', orderNumber: '', customerName: '' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'تعذر إلغاء الطلب.';
      toastError(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const promptStatusChange = (order: StaffOrder, newStatus: OrderStatus) => {
    if (newStatus === 'Cancelled') {
      setCancelModal({
        isOpen: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
      });
      return;
    }

    if (newStatus === 'Completed') {
      setConfirmModal({
        isOpen: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        targetStatus: newStatus,
        title: 'تأكيد تسليم الطلب',
        description: `تأكيد تسليم الطلب رقم ${order.orderNumber} للزبون وإتمام الفاتورة؟`,
        variant: 'primary',
      });
      return;
    }

    handleStatusUpdate(order.id, newStatus);
  };

  // Filter orders by search query & date
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        !searchQuery.trim() ||
        o.orderNumber.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        o.customerPhone.includes(searchQuery.trim());

      const matchesDate =
        !dateFilter ||
        new Date(o.createdAt).toISOString().slice(0, 10) === dateFilter;

      return matchesSearch && matchesDate;
    });
  }, [orders, searchQuery, dateFilter]);

  return (
    <StaffLayout>
      {/* Header and Refresh */}
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-[#DCC9B2]/40 dark:border-white/10">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-[#38251E] dark:text-[#F7F3EC] tracking-tight">
            إدارة الطلبات الحية
          </h1>
          <p className="text-[11px] sm:text-xs text-[#38251E]/70 dark:text-[#F7F3EC]/70 mt-0.5">
            متابعة فورية للطلبات، بدء التحضير، وتسليم قهوة اليوم للزبائن.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="p-2.5 rounded-xl border border-[#DCC9B2] dark:border-white/15 hover:bg-white dark:hover:bg-white/10 text-[#38251E] dark:text-[#F7F3EC] transition-colors cursor-pointer shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
          title="تحديث قائمة الطلبات"
          aria-label="تحديث قائمة الطلبات"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#251D1A] rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-[#DCC9B2]/60 dark:border-white/10 shadow-xs mb-5 space-y-3">
        {/* Horizontally scrollable status filters for mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none -mx-1 px-1">
          {[
            { id: 'All', label: 'الكل' },
            { id: 'New', label: 'جديدة' },
            { id: 'Preparing', label: 'قيد التحضير' },
            { id: 'Ready', label: 'جاهزة للاستلام' },
            { id: 'Completed', label: 'تم التسليم' },
            { id: 'Cancelled', label: 'ملغية' },
          ].map((tab) => {
            const isSelected = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[40px] flex items-center shrink-0 ${
                  isSelected
                    ? 'bg-[#38251E] dark:bg-[#B77B4B] text-white shadow-xs'
                    : 'bg-[#F7F3EC] dark:bg-[#1A1412] text-[#38251E]/70 dark:text-[#F7F3EC]/70 hover:bg-[#DCC9B2]/40 dark:hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & Date Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2.5 border-t border-[#DCC9B2]/30 dark:border-white/10">
          <div className="sm:col-span-8 relative">
            <input
              type="text"
              placeholder="البحث بالرقم، الاسم، أو الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2.5 ps-10 rounded-xl border border-[#DCC9B2] dark:border-white/15 bg-white dark:bg-[#1A1412] text-xs sm:text-sm text-[#38251E] dark:text-[#F7F3EC] focus:outline-none focus:ring-2 focus:ring-[#B77B4B]"
            />
            <Search className="w-4 h-4 text-[#38251E]/40 dark:text-white/40 absolute left-3.5 top-3" />
          </div>

          <div className="sm:col-span-4 relative flex items-center gap-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#DCC9B2] dark:border-white/15 bg-white dark:bg-[#1A1412] text-xs text-[#38251E] dark:text-[#F7F3EC] focus:outline-none focus:ring-2 focus:ring-[#B77B4B]"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs text-red-500 shrink-0"
                title="إلغاء فلتر التاريخ"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders List or Loading */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-52 bg-white dark:bg-[#251D1A] rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#DCC9B2]/40 dark:border-white/10" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-[#251D1A] rounded-2xl sm:rounded-3xl p-10 sm:p-16 text-center border border-[#DCC9B2]/50 dark:border-white/10 shadow-xs">
          <Clock className="w-10 h-10 text-[#DCC9B2] dark:text-white/20 mx-auto mb-2.5" />
          <h3 className="text-sm sm:text-base font-bold text-[#38251E] dark:text-[#F7F3EC]">لا توجد طلبات مطابقة</h3>
          <p className="text-xs text-[#38251E]/60 dark:text-[#F7F3EC]/60 mt-1">
            لم نجد أي طلبات تطابق معايير البحث أو التصفية المحددة.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {filteredOrders.map((o) => (
            <StaffOrderCard
              key={o.id}
              order={o}
              isActioning={actionLoading === o.id}
              onSelect={setSelectedOrder}
              onStatusChange={promptStatusChange}
            />
          ))}
        </div>
      )}

      {/* Order Details Sheet/Modal */}
      <StaffOrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onPromptCancel={(orderToCancel) => {
          setSelectedOrder(null);
          promptStatusChange(orderToCancel, 'Cancelled');
        }}
      />

      {/* Cancellation Modal with Reason Input */}
      <CancelOrderModal
        isOpen={cancelModal.isOpen}
        orderNumber={cancelModal.orderNumber}
        customerName={cancelModal.customerName}
        isLoading={actionLoading === cancelModal.orderId}
        onCancel={() => setCancelModal({ isOpen: false, orderId: '', orderNumber: '', customerName: '' })}
        onConfirm={handleCancelOrder}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmLabel="تأكيد التسليم"
        cancelLabel="تراجع"
        variant={confirmModal.variant}
        isLoading={actionLoading === confirmModal.orderId}
        onConfirm={() => handleStatusUpdate(confirmModal.orderId, confirmModal.targetStatus)}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </StaffLayout>
  );
}
