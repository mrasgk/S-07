'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PriceDisplay } from '@/components/MadSymbol';
import { fetchApi } from '@/lib/api';
import { createOrderHubConnection } from '@/lib/signalr';
import * as signalR from '@microsoft/signalr';
import type { StaffSummary, AnalyticsResponse } from '@/types/dashboard';
import type { DailyCoffee } from '@/types/coffee';
import type { StaffOrder } from '@/types/order';
import { useToast } from '@/components/ToastProvider';
import StaffLayout from '@/components/StaffLayout';
import RevenueAreaChart from '@/components/charts/RevenueAreaChart';
import OrdersBarChart from '@/components/charts/OrdersBarChart';
import OrderStatusDonutChart from '@/components/charts/OrderStatusDonutChart';
import DashboardStatsGrid from '@/components/dashboard/DashboardStatsGrid';
import DashboardTodayCoffee from '@/components/dashboard/DashboardTodayCoffee';
import DashboardRecentOrders from '@/components/dashboard/DashboardRecentOrders';
import {
  ArrowLeft,
  Calendar,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';

export default function StaffDashboardPage() {
  const router = useRouter();
  const { error: toastError } = useToast();
  const [summary, setSummary] = useState<StaffSummary | null>(null);
  const [todayCoffee, setTodayCoffee] = useState<DailyCoffee | null>(null);
  const [recentOrders, setRecentOrders] = useState<StaffOrder[]>([]);
  const [currentUser, setCurrentUser] = useState<{ username: string } | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | 'month'>('7d');
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [sum, coffee, recent, me, anal] = await Promise.all([
        fetchApi<StaffSummary>('/api/staff/dashboard/summary'),
        fetchApi<DailyCoffee>('/api/coffee/today').catch(() => null),
        fetchApi<StaffOrder[]>('/api/staff/dashboard/recent-orders?count=5'),
        fetchApi<{ username: string }>('/api/staff/auth/me'),
        fetchApi<AnalyticsResponse>(`/api/staff/dashboard/analytics?period=${selectedPeriod}`).catch(() => null)
      ]);

      setSummary(sum);
      setTodayCoffee(coffee);
      setRecentOrders(recent);
      setCurrentUser(me);
      if (anal) setAnalytics(anal);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'تعذر تحميل بيانات اللوحة.';
      if (msg.includes('تسجيل الدخول') || msg.includes('401')) {
        router.push('/staff/login');
      } else {
        toastError(msg === 'Failed to fetch' ? 'تعذر الاتصال بخادم الـ API. تأكد من تشغيل الباك إند.' : msg);
      }
    } finally {
      setLoading(false);
    }
  }, [router, toastError, selectedPeriod]);

  // Load analytics specifically when period toggle changes
  const handlePeriodChange = async (period: '7d' | '30d' | 'month') => {
    setSelectedPeriod(period);
    setAnalyticsLoading(true);
    try {
      const anal = await fetchApi<AnalyticsResponse>(`/api/staff/dashboard/analytics?period=${period}`);
      setAnalytics(anal);
    } catch {
      // Handled silently
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function init() {
      try {
        const [sum, coffee, recent, me, anal] = await Promise.all([
          fetchApi<StaffSummary>('/api/staff/dashboard/summary'),
          fetchApi<DailyCoffee>('/api/coffee/today').catch(() => null),
          fetchApi<StaffOrder[]>('/api/staff/dashboard/recent-orders?count=5'),
          fetchApi<{ username: string }>('/api/staff/auth/me'),
          fetchApi<AnalyticsResponse>(`/api/staff/dashboard/analytics?period=${selectedPeriod}`).catch(() => null)
        ]);

        if (!ignore) {
          setSummary(sum);
          setTodayCoffee(coffee);
          setRecentOrders(recent);
          setCurrentUser(me);
          if (anal) setAnalytics(anal);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'تعذر تحميل بيانات اللوحة.';
          if (msg.includes('تسجيل الدخول') || msg.includes('401')) {
            router.push('/staff/login');
          } else {
            toastError(msg === 'Failed to fetch' ? 'تعذر الاتصال بخادم الـ API. يرجى التأكد من تشغيل السيرفر.' : msg);
            setLoading(false);
          }
        }
      }
    }

    init();

    return () => {
      ignore = true;
    };
  }, [router, toastError, selectedPeriod]);

  // Real-time updates via SignalR
  useEffect(() => {
    let isDisposed = false;
    const connection = createOrderHubConnection();

    connection.on('OrderCreated', () => {
      if (!isDisposed) loadData();
    });

    connection.on('StaffOrderStatusChanged', () => {
      if (!isDisposed) loadData();
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
        // Silent retry
      }
    };

    start();

    return () => {
      isDisposed = true;
      if (connection.state === signalR.HubConnectionState.Connected) {
        connection.stop().catch(() => {});
      }
    };
  }, [loadData]);

  const currentDateArabic = new Intl.DateTimeFormat('ar-MA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <StaffLayout>
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-[#DCC9B2]/40 dark:border-white/10 w-full">
        <div>
          {/* Refined Date Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B77B4B]/10 dark:bg-[#B77B4B]/20 border border-[#B77B4B]/25 text-[#B77B4B] text-[11px] sm:text-xs font-semibold mb-2 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#B77B4B]" />
            <span>{currentDateArabic}</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-[#38251E] dark:text-[#F7F3EC] tracking-tight">
            مرحباً، {currentUser?.username || 'زميلنا الباريستا'}
          </h1>
          <p className="text-[11px] sm:text-xs text-[#38251E]/70 dark:text-[#F7F3EC]/70 mt-1">
            لوحة الإدارة التحليلية: ملخص المبيعات، ومتابعة الإيرادات والطلبات الحية.
          </p>
        </div>

        <div className="flex items-center gap-2 mt-1 sm:mt-0">
          <button
            onClick={loadData}
            className="p-2 sm:p-2.5 rounded-xl border border-[#DCC9B2] dark:border-white/15 hover:bg-white dark:hover:bg-white/10 text-[#38251E] dark:text-[#F7F3EC] transition-colors cursor-pointer"
            title="تحديث البيانات"
            aria-label="تحديث البيانات"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/staff/orders"
            className="flex-1 sm:flex-none text-center bg-[#38251E] dark:bg-[#B77B4B] hover:bg-[#B77B4B] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <span>إدارة الطلبات الحية</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <DashboardStatsGrid summary={summary} loading={loading} />

      {/* Date Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#251D1A] rounded-2xl p-3.5 sm:p-4 border border-[#DCC9B2]/60 dark:border-white/10 shadow-xs mb-6 w-full">
        <div>
          <h2 className="text-sm font-bold text-[#38251E] dark:text-[#F7F3EC]">تحليلات الأداء والإيرادات</h2>
          <p className="text-[11px] text-[#38251E]/60 dark:text-[#F7F3EC]/60">اختر الفترة الزمنية لعرض الإحصاءات والرسوم البيانية المباشرة</p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#F7F3EC] dark:bg-[#1A1412] p-1 rounded-xl border border-[#DCC9B2]/30 dark:border-white/10 self-start sm:self-auto">
          <button
            onClick={() => handlePeriodChange('7d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedPeriod === '7d'
                ? 'bg-[#B77B4B] text-white shadow-xs'
                : 'text-[#38251E]/70 dark:text-[#F7F3EC]/70 hover:text-[#38251E] dark:hover:text-white'
            }`}
          >
            آخر 7 أيام
          </button>
          <button
            onClick={() => handlePeriodChange('30d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedPeriod === '30d'
                ? 'bg-[#B77B4B] text-white shadow-xs'
                : 'text-[#38251E]/70 dark:text-[#F7F3EC]/70 hover:text-[#38251E] dark:hover:text-white'
            }`}
          >
            آخر 30 يومًا
          </button>
          <button
            onClick={() => handlePeriodChange('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedPeriod === 'month'
                ? 'bg-[#B77B4B] text-white shadow-xs'
                : 'text-[#38251E]/70 dark:text-[#F7F3EC]/70 hover:text-[#38251E] dark:hover:text-white'
            }`}
          >
            هذا الشهر
          </button>
        </div>
      </div>

      {/* Main Charts Row: Area Revenue Chart (8 cols) & Orders Status Donut Chart (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 mb-6 w-full">
        {/* Revenue Area Chart Card */}
        <div className="lg:col-span-8 bg-white dark:bg-[#251D1A] rounded-3xl p-4 sm:p-6 border border-[#DCC9B2]/60 dark:border-white/10 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#DCC9B2]/30 dark:border-white/10 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B77B4B]" />
                <h3 className="text-sm sm:text-base font-bold text-[#38251E] dark:text-[#F7F3EC]">
                  الإيرادات
                </h3>
              </div>
              <p className="text-[11px] text-[#38251E]/60 dark:text-[#F7F3EC]/60 mt-0.5">
                متابعة الإيرادات اليومية خلال الفترة المحددة بالدرهم المغربي.
              </p>
            </div>

            <div className="bg-[#F7F3EC] dark:bg-[#1A1412] px-3 py-1 rounded-xl border border-[#DCC9B2]/30 dark:border-white/10 text-xs font-bold text-[#38251E] dark:text-[#F7F3EC] self-start sm:self-auto flex items-center gap-1.5">
              <span>إجمالي الفترة:</span>
              <PriceDisplay amount={analytics?.totalRevenue.toLocaleString() ?? 0} weight="semibold" className="text-[#B77B4B]" />
            </div>
          </div>

          <RevenueAreaChart
            data={analytics?.dailyData ?? []}
            loading={loading || analyticsLoading}
          />
        </div>

        {/* Order Status Distribution Donut Chart */}
        <div className="lg:col-span-4 bg-white dark:bg-[#251D1A] rounded-3xl p-4 sm:p-6 border border-[#DCC9B2]/60 dark:border-white/10 shadow-xs flex flex-col justify-between">
          <div className="pb-3 border-b border-[#DCC9B2]/30 dark:border-white/10 mb-3">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-[#B77B4B]" />
              <h3 className="text-sm sm:text-base font-bold text-[#38251E] dark:text-[#F7F3EC]">
                توزيع حالات الطلبات
              </h3>
            </div>
            <p className="text-[11px] text-[#38251E]/60 dark:text-[#F7F3EC]/60 mt-0.5">
              نسب الطلبات حسب الحالة التشغيلية
            </p>
          </div>

          <OrderStatusDonutChart
            data={analytics?.statusDistribution ?? []}
            totalOrders={analytics?.totalOrders ?? summary?.totalOrders ?? 0}
            loading={loading || analyticsLoading}
          />
        </div>
      </div>

      {/* Orders Bar Chart (Volume per day) */}
      <div className="bg-white dark:bg-[#251D1A] rounded-3xl p-4 sm:p-6 border border-[#DCC9B2]/60 dark:border-white/10 shadow-xs mb-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#DCC9B2]/30 dark:border-white/10 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#B77B4B]" />
              <h3 className="text-sm sm:text-base font-bold text-[#38251E] dark:text-[#F7F3EC]">
                حجم الطلبات اليومية
              </h3>
            </div>
            <p className="text-[11px] text-[#38251E]/60 dark:text-[#F7F3EC]/60 mt-0.5">
              عدد الطلبات المكتملة والمجهزة يومياً خلال الفترة
            </p>
          </div>

          <div className="bg-[#F7F3EC] dark:bg-[#1A1412] px-3 py-1 rounded-xl border border-[#DCC9B2]/30 dark:border-white/10 text-xs font-bold text-[#38251E] dark:text-[#F7F3EC] self-start sm:self-auto">
            مجموع الطلبات: {analytics?.totalOrders ?? 0} طلب
          </div>
        </div>

        <OrdersBarChart
          data={analytics?.dailyData ?? []}
          loading={loading || analyticsLoading}
        />
      </div>

      {/* Operational Section: Active Coffee & Recent Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start w-full">
        <DashboardTodayCoffee coffee={todayCoffee} loading={loading} />
        <DashboardRecentOrders orders={recentOrders} loading={loading} />
      </div>
    </StaffLayout>
  );
}
