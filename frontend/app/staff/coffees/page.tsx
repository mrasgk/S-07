'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import type { DailyCoffee, CreateCoffeePayload, UpdateCoffeePayload } from '@/types/coffee';
import { useToast } from '@/components/ToastProvider';
import ConfirmationModal from '@/components/ConfirmationModal';
import StaffLayout from '@/components/StaffLayout';
import { PriceDisplay } from '@/components/MadSymbol';
import {
  Plus,
  Edit,
  Eye,
  CheckCircle2,
  XCircle,
  MapPin,
  Flame,
  Coffee,
  Package,
  Sparkles,
  Trash2,
  X,
  Loader2
} from 'lucide-react';

export default function StaffCoffeesPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [coffees, setCoffees] = useState<DailyCoffee[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal for Create/Edit Coffee
  const [coffeeModal, setCoffeeModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    coffeeId?: string;
    name: string;
    description: string;
    origin: string;
    roastLevel: string;
    tastingNotes: string;
    imageUrl: string;
    price: number | string;
    availableQuantity: number | string;
    isAvailable: boolean;
    submitting: boolean;
    error: string | null;
  }>({
    isOpen: false,
    mode: 'create',
    name: '',
    description: '',
    origin: '',
    roastLevel: '',
    tastingNotes: '',
    imageUrl: '',
    price: 30,
    availableQuantity: 50,
    isAvailable: true,
    submitting: false,
    error: null,
  });

  // Modal for Delete Confirmation
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    coffeeId: string;
    coffeeName: string;
  }>({
    isOpen: false,
    coffeeId: '',
    coffeeName: '',
  });

  // Modal for Inventory quick adjustment
  const [inventoryModal, setInventoryModal] = useState<{
    isOpen: boolean;
    coffeeId: string;
    coffeeName: string;
    currentQuantity: number;
    newQuantity: number;
  }>({
    isOpen: false,
    coffeeId: '',
    coffeeName: '',
    currentQuantity: 0,
    newQuantity: 0,
  });

  const loadCoffees = async () => {
    try {
      const data = await fetchApi<DailyCoffee[]>('/api/staff/coffees');
      setCoffees(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'تعذر تحميل قائمة المحاصيل.';
      if (msg.includes('تسجيل الدخول') || msg.includes('401')) {
        router.push('/staff/login');
      } else {
        toastError(msg === 'Failed to fetch' ? 'تعذر الاتصال بخادم الـ API.' : msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function init() {
      try {
        const data = await fetchApi<DailyCoffee[]>('/api/staff/coffees');
        if (!ignore) {
          setCoffees(data);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'تعذر تحميل قائمة المحاصيل.';
          if (msg.includes('تسجيل الدخول') || msg.includes('401')) {
            router.push('/staff/login');
          } else {
            toastError(msg === 'Failed to fetch' ? 'تعذر الاتصال بخادم الـ API.' : msg);
            setLoading(false);
          }
        }
      }
    }

    init();

    return () => {
      ignore = true;
    };
  }, [router, toastError]);

  const toggleAvailability = async (coffee: DailyCoffee) => {
    try {
      setActionLoading(coffee.id);
      await fetchApi<DailyCoffee>(`/api/staff/coffees/${coffee.id}/availability`, {
        method: 'PATCH',
        body: JSON.stringify({ isAvailable: !coffee.isAvailable }),
      });
      await loadCoffees();
      success(coffee.isAvailable ? 'تم إيقاف تفعيل المحصول.' : 'تم تفعيل المحصول بنجاح.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل تغيير حالة التوفر.';
      toastError(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const updateInventorySubmit = async () => {
    try {
      setActionLoading(inventoryModal.coffeeId);
      await fetchApi<DailyCoffee>(`/api/staff/coffees/${inventoryModal.coffeeId}/inventory`, {
        method: 'PATCH',
        body: JSON.stringify({ availableQuantity: inventoryModal.newQuantity }),
      });
      await loadCoffees();
      success('تم تحديث كمية المخزون المتاحة بنجاح.');
      setInventoryModal((prev) => ({ ...prev, isOpen: false }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل تحديث المخزون.';
      toastError(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const openCreateModal = () => {
    setCoffeeModal({
      isOpen: true,
      mode: 'create',
      name: '',
      description: '',
      origin: '',
      roastLevel: '',
      tastingNotes: '',
      imageUrl: '',
      price: 30,
      availableQuantity: 50,
      isAvailable: true,
      submitting: false,
      error: null,
    });
  };

  const openEditModal = (coffee: DailyCoffee) => {
    setCoffeeModal({
      isOpen: true,
      mode: 'edit',
      coffeeId: coffee.id,
      name: coffee.name,
      description: coffee.description || '',
      origin: coffee.origin || '',
      roastLevel: coffee.roastLevel || '',
      tastingNotes: coffee.tastingNotes || '',
      imageUrl: coffee.imageUrl || '',
      price: coffee.price,
      availableQuantity: coffee.availableQuantity,
      isAvailable: coffee.isAvailable,
      submitting: false,
      error: null,
    });
  };

  const handleCoffeeFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = Number(coffeeModal.price);
    const numQty = Number(coffeeModal.availableQuantity);

    if (
      !coffeeModal.name.trim() ||
      !coffeeModal.description.trim() ||
      !coffeeModal.origin.trim() ||
      !coffeeModal.roastLevel.trim() ||
      !coffeeModal.tastingNotes.trim()
    ) {
      const msg = 'يرجى ملء كافة الحقول الإلزامية بدقة.';
      setCoffeeModal((prev) => ({ ...prev, error: msg }));
      toastError(msg);
      return;
    }

    if (isNaN(numPrice) || numPrice <= 0) {
      const msg = 'يرجى إدخال سعر صحيح بالدرهم المغربي.';
      setCoffeeModal((prev) => ({ ...prev, error: msg }));
      toastError(msg);
      return;
    }

    if (isNaN(numQty) || numQty < 0) {
      const msg = 'يرجى إدخال كمية مخزون صحيحة.';
      setCoffeeModal((prev) => ({ ...prev, error: msg }));
      toastError(msg);
      return;
    }

    setCoffeeModal((prev) => ({ ...prev, submitting: true, error: null }));

    try {
      const payload: CreateCoffeePayload = {
        name: coffeeModal.name.trim(),
        description: coffeeModal.description.trim(),
        origin: coffeeModal.origin.trim(),
        roastLevel: coffeeModal.roastLevel.trim(),
        tastingNotes: coffeeModal.tastingNotes.trim(),
        imageUrl: coffeeModal.imageUrl.trim() || undefined,
        price: numPrice,
        availableQuantity: numQty,
        isAvailable: coffeeModal.isAvailable,
      };

      if (coffeeModal.mode === 'create') {
        await fetchApi<DailyCoffee>('/api/staff/coffees', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        success('تمت إضافة محصول القهوة بنجاح.');
      } else {
        await fetchApi<DailyCoffee>(`/api/staff/coffees/${coffeeModal.coffeeId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        success('تم تحديث تفاصيل المحصول بنجاح.');
      }

      setCoffeeModal((prev) => ({ ...prev, isOpen: false }));
      await loadCoffees();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'تعذر حفظ بيانات المحصول.';
      setCoffeeModal((prev) => ({ ...prev, error: msg, submitting: false }));
      toastError(msg);
    }
  };

  const handleDeleteCoffee = async () => {
    try {
      setActionLoading(deleteModal.coffeeId);
      await fetchApi(`/api/staff/coffees/${deleteModal.coffeeId}`, {
        method: 'DELETE',
      });
      success('تم حذف أو تعطيل المحصول بنجاح.');
      setDeleteModal((prev) => ({ ...prev, isOpen: false }));
      await loadCoffees();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل حذف المحصول.';
      toastError(msg);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <StaffLayout>
      <div className="w-full">
        {/* Header (Full width) */}
        <div className="flex items-center justify-between gap-3 mb-5 sm:mb-8 pb-4 sm:pb-6 border-b border-[#DCC9B2]/40 dark:border-white/10 w-full">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-[#38251E] dark:text-[#F7F3EC] tracking-tight">
              إدارة محاصيل القهوة
            </h1>
            <p className="text-[11px] sm:text-xs text-[#38251E]/70 dark:text-[#F7F3EC]/70 mt-0.5">
              إضافة وتعديل محاصيل قهوة اليوم، التحكم بالأسعار، وضبط المخزون المتوفر.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="bg-[#38251E] dark:bg-[#B77B4B] hover:bg-[#B77B4B] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors shadow-xs shrink-0 min-h-[44px] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة محصول جديد</span>
          </button>
        </div>

        {/* Coffee Grid (Takes full width) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 animate-pulse w-full">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-white dark:bg-[#251D1A] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#DCC9B2]/40 dark:border-white/10" />
            ))}
          </div>
        ) : coffees.length === 0 ? (
          <div className="bg-white dark:bg-[#251D1A] rounded-2xl sm:rounded-3xl p-10 sm:p-16 text-center border border-[#DCC9B2]/50 dark:border-white/10 shadow-xs w-full">
            <Coffee className="w-10 h-10 text-[#DCC9B2] dark:text-white/20 mx-auto mb-2.5" />
            <h3 className="text-sm sm:text-base font-bold text-[#38251E] dark:text-[#F7F3EC]">لا توجد محاصيل مسجلة</h3>
            <p className="text-xs text-[#38251E]/60 dark:text-[#F7F3EC]/60 mt-1">
              قم بإضافة محصولك الأول ليتمكن الزبائن من حجزه عبر الموقع.
            </p>
            <button
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-1.5 text-xs bg-[#B77B4B] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-[#38251E] transition-colors min-h-[44px] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة محصول قهوة</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
            {coffees.map((coffee) => {
              const isProcessing = actionLoading === coffee.id;

              return (
                <div
                  key={coffee.id}
                  className="bg-white dark:bg-[#251D1A] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#DCC9B2]/60 dark:border-white/10 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow relative overflow-hidden"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2.5 mb-2.5">
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-[#38251E] dark:text-[#F7F3EC] truncate">
                          {coffee.name}
                        </h3>
                        <div className="mt-0.5">
                          <PriceDisplay amount={coffee.price} weight="semibold" className="text-[11px] font-bold text-[#B77B4B]" />
                        </div>
                      </div>

                      <button
                        onClick={() => toggleAvailability(coffee)}
                        disabled={isProcessing}
                        className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 min-h-[32px] ${
                          coffee.isAvailable
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border border-neutral-200 dark:border-neutral-700'
                        }`}
                        title={coffee.isAvailable ? 'تعطيل المحصول' : 'تفعيل المحصول'}
                      >
                        {coffee.isAvailable ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>مفعّل</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-neutral-400" />
                            <span>معطّل</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-[#38251E]/70 dark:text-[#F7F3EC]/70 leading-relaxed mb-3 line-clamp-2">
                      {coffee.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#F7F3EC] dark:bg-[#1A1412] p-2.5 rounded-xl mb-3 border border-[#DCC9B2]/20 dark:border-white/5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-[#B77B4B] shrink-0" />
                        <span className="truncate text-[#38251E] dark:text-[#F7F3EC]">{coffee.origin || 'غير محدد'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Flame className="w-3.5 h-3.5 text-[#B77B4B] shrink-0" />
                        <span className="truncate text-[#38251E] dark:text-[#F7F3EC]">{coffee.roastLevel || 'غير محدد'}</span>
                      </div>
                    </div>

                    {coffee.tastingNotes && (
                      <div className="text-[11px] text-[#38251E]/60 dark:text-[#F7F3EC]/60 mb-3 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#B77B4B] shrink-0" />
                        <span className="truncate">{coffee.tastingNotes}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#DCC9B2]/30 dark:border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#38251E]/60 dark:text-[#F7F3EC]/60">المخزون المتوفر:</span>
                      <button
                        onClick={() =>
                          setInventoryModal({
                            isOpen: true,
                            coffeeId: coffee.id,
                            coffeeName: coffee.name,
                            currentQuantity: coffee.availableQuantity,
                            newQuantity: coffee.availableQuantity,
                          })
                        }
                        className="font-bold text-[#38251E] dark:text-[#F7F3EC] bg-[#F7F3EC] dark:bg-[#1A1412] px-2.5 py-1.5 rounded-lg border border-[#DCC9B2]/40 dark:border-white/10 hover:border-[#B77B4B] transition-colors cursor-pointer flex items-center gap-1.5 min-h-[36px]"
                        title="تعديل المخزون السريع"
                      >
                        <Package className="w-3.5 h-3.5 text-[#B77B4B]" />
                        <span>{coffee.availableQuantity} كوب</span>
                      </button>
                    </div>

                    {/* Edit and Delete Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(coffee)}
                        className="flex-1 py-2 px-3 rounded-xl border border-[#DCC9B2] dark:border-white/15 hover:bg-[#F7F3EC] dark:hover:bg-white/5 text-xs font-semibold text-[#38251E] dark:text-[#F7F3EC] flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
                      >
                        <Edit className="w-3.5 h-3.5 text-[#B77B4B]" />
                        <span>تعديل</span>
                      </button>

                      <button
                        onClick={() =>
                          setDeleteModal({
                            isOpen: true,
                            coffeeId: coffee.id,
                            coffeeName: coffee.name,
                          })
                        }
                        className="p-2.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/30 hover:bg-red-100 text-red-600 dark:text-red-400 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                        title="حذف المحصول"
                        aria-label="حذف المحصول"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <Link
                        href="/"
                        target="_blank"
                        className="p-2.5 rounded-xl border border-[#DCC9B2] dark:border-white/15 hover:bg-[#F7F3EC] dark:hover:bg-white/5 text-neutral-500 hover:text-[#38251E] dark:hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        title="معاينة في المتجر"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CRUD Popup Modal for Adding & Editing Coffee */}
      {coffeeModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto"
          onClick={() => !coffeeModal.submitting && setCoffeeModal((p) => ({ ...p, isOpen: false }))}
        >
          <div
            className="bg-white dark:bg-[#251D1A] rounded-3xl max-w-2xl w-full p-5 sm:p-7 border border-[#DCC9B2]/60 dark:border-white/10 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => !coffeeModal.submitting && setCoffeeModal((p) => ({ ...p, isOpen: false }))}
              className="absolute top-5 left-5 p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[#38251E]/60 dark:text-[#F7F3EC]/60 cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg sm:text-xl font-bold text-[#38251E] dark:text-[#F7F3EC] mb-1">
              {coffeeModal.mode === 'create' ? 'إضافة محصول قهوة جديد' : 'تعديل محصول القهوة'}
            </h3>
            <p className="text-xs text-[#38251E]/60 dark:text-[#F7F3EC]/60 mb-5">
              {coffeeModal.mode === 'create'
                ? 'أدخل بيانات المحصول الجديد لإتاحته للزبائن في قائمة قهوة اليوم.'
                : 'تعديل تفاصيل المحصول. لن يؤثر التعديل على الطلبات السابقة.'}
            </p>

            {coffeeModal.error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs">
                {coffeeModal.error}
              </div>
            )}

            <form onSubmit={handleCoffeeFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#38251E] dark:text-[#F7F3EC] mb-1.5">
                  اسم المحصول <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: يرقاشيفي الإثيوبية — معالجة مجففة"
                  value={coffeeModal.name}
                  onChange={(e) => setCoffeeModal((p) => ({ ...p, name: e.target.value }))}
                  disabled={coffeeModal.submitting}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCC9B2] dark:border-white/15 bg-white dark:bg-[#1A1412] text-xs sm:text-sm text-[#38251E] dark:text-[#F7F3EC] focus:outline-none focus:ring-2 focus:ring-[#B77B4B] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#38251E] dark:text-[#F7F3EC] mb-1.5">
                  الوصف التقديمي <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="اكتب وصفاً مميزاً يعرف الزبون بقصة هذا المحصول وفرادته..."
                  value={coffeeModal.description}
                  onChange={(e) => setCoffeeModal((p) => ({ ...p, description: e.target.value }))}
                  disabled={coffeeModal.submitting}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCC9B2] dark:border-white/15 bg-white dark:bg-[#1A1412] text-xs sm:text-sm text-[#38251E] dark:text-[#F7F3EC] focus:outline-none focus:ring-2 focus:ring-[#B77B4B] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#38251E] dark:text-[#F7F3EC] mb-1.5">
                    المصدر / الدولة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: إثيوبيا، غوجي"
                    value={coffeeModal.origin}
                    onChange={(e) => setCoffeeModal((p) => ({ ...p, origin: e.target.value }))}
                    disabled={coffeeModal.submitting}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCC9B2] dark:border-white/15 bg-white dark:bg-[#1A1412] text-xs sm:text-sm text-[#38251E] dark:text-[#F7F3EC] focus:outline-none focus:ring-2 focus:ring-[#B77B4B] min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#38251E] dark:text-[#F7F3EC] mb-1.5">
                    مستوى التحميص <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: تحميص متوسط خفيف"
                    value={coffeeModal.roastLevel}
                    onChange={(e) => setCoffeeModal((p) => ({ ...p, roastLevel: e.target.value }))}
                    disabled={coffeeModal.submitting}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCC9B2] dark:border-white/15 bg-white dark:bg-[#1A1412] text-xs sm:text-sm text-[#38251E] dark:text-[#F7F3EC] focus:outline-none focus:ring-2 focus:ring-[#B77B4B] min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#38251E] dark:text-[#F7F3EC] mb-1.5">
                  الإيحاءات والنوتات العطرية <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: زهور الياسمين، مشمش، عسل جبلي"
                  value={coffeeModal.tastingNotes}
                  onChange={(e) => setCoffeeModal((p) => ({ ...p, tastingNotes: e.target.value }))}
                  disabled={coffeeModal.submitting}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCC9B2] dark:border-white/15 bg-white dark:bg-[#1A1412] text-xs sm:text-sm text-[#38251E] dark:text-[#F7F3EC] focus:outline-none focus:ring-2 focus:ring-[#B77B4B] min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#38251E] dark:text-[#F7F3EC] mb-1.5">
                    السعر بالدرهم (د.م) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={coffeeModal.price}
                    onChange={(e) => setCoffeeModal((p) => ({ ...p, price: e.target.value }))}
                    disabled={coffeeModal.submitting}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCC9B2] dark:border-white/15 bg-white dark:bg-[#1A1412] text-xs sm:text-sm text-[#38251E] dark:text-[#F7F3EC] focus:outline-none focus:ring-2 focus:ring-[#B77B4B] min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#38251E] dark:text-[#F7F3EC] mb-1.5">
                    الكمية المتاحة (أكواب) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={coffeeModal.availableQuantity}
                    onChange={(e) => setCoffeeModal((p) => ({ ...p, availableQuantity: e.target.value }))}
                    disabled={coffeeModal.submitting}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCC9B2] dark:border-white/15 bg-white dark:bg-[#1A1412] text-xs sm:text-sm text-[#38251E] dark:text-[#F7F3EC] focus:outline-none focus:ring-2 focus:ring-[#B77B4B] min-h-[44px]"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={coffeeModal.isAvailable}
                    onChange={(e) => setCoffeeModal((p) => ({ ...p, isAvailable: e.target.checked }))}
                    disabled={coffeeModal.submitting}
                    className="w-4 h-4 rounded border-[#DCC9B2] text-[#B77B4B] focus:ring-[#B77B4B]"
                  />
                  <span className="text-xs font-medium text-[#38251E] dark:text-[#F7F3EC]">
                    تفعيل المحصول فوراً وإتاحته للطلب في قائمة قهوة اليوم
                  </span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#DCC9B2]/30 dark:border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCoffeeModal((p) => ({ ...p, isOpen: false }))}
                  disabled={coffeeModal.submitting}
                  className="px-4 py-2.5 rounded-xl border border-[#DCC9B2] dark:border-white/15 hover:bg-[#F7F3EC] dark:hover:bg-white/5 text-xs font-semibold text-[#38251E] dark:text-[#F7F3EC] transition-colors cursor-pointer min-h-[44px]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={coffeeModal.submitting}
                  className="bg-[#38251E] dark:bg-[#B77B4B] hover:bg-[#B77B4B] text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-xs min-h-[44px]"
                >
                  {coffeeModal.submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{coffeeModal.mode === 'create' ? 'حفظ المحصول' : 'حفظ التعديلات'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="تأكيد حذف محصول القهوة"
        description={`هل أنت متأكد من رغبتك في حذف محصول (${deleteModal.coffeeName})؟ إذا كان المحصول مرتبطاً بطلبات سابقة، فسيتم تعطيله وإخفاؤه للحفاظ على سجل المبيعات بأمان.`}
        confirmLabel="نعم، احذف المحصول"
        cancelLabel="تراجع"
        variant="danger"
        isLoading={actionLoading === deleteModal.coffeeId}
        onConfirm={handleDeleteCoffee}
        onCancel={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Quick Inventory Adjustment Modal */}
      <ConfirmationModal
        isOpen={inventoryModal.isOpen}
        title="تحديث مخزون القهوة المتاح"
        description={`تعديل كمية الأكواب المتاحة للطلب من محصول (${inventoryModal.coffeeName}).`}
        confirmLabel="حفظ الكمية"
        cancelLabel="إلغاء"
        isLoading={actionLoading === inventoryModal.coffeeId}
        onConfirm={updateInventorySubmit}
        onCancel={() => setInventoryModal((prev) => ({ ...prev, isOpen: false }))}
      >
        <div className="space-y-3 py-2">
          <label className="block text-xs font-medium text-[#38251E] dark:text-[#F7F3EC]">
            الكمية المتاحة (عدد الأكواب):
          </label>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setInventoryModal((p) => ({ ...p, newQuantity: Math.max(0, p.newQuantity - 5) }))}
              className="w-11 h-11 rounded-xl bg-[#F7F3EC] dark:bg-[#1A1412] text-[#38251E] dark:text-[#F7F3EC] font-bold text-base flex items-center justify-center border border-[#DCC9B2]/30 dark:border-white/10 cursor-pointer"
            >
              -5
            </button>
            <input
              type="number"
              min={0}
              max={10000}
              value={inventoryModal.newQuantity}
              onChange={(e) => setInventoryModal((p) => ({ ...p, newQuantity: parseInt(e.target.value) || 0 }))}
              className="flex-1 text-center font-bold text-lg py-2.5 rounded-xl border border-[#DCC9B2] dark:border-white/15 bg-white dark:bg-[#1A1412] text-[#38251E] dark:text-[#F7F3EC]"
            />
            <button
              type="button"
              onClick={() => setInventoryModal((p) => ({ ...p, newQuantity: p.newQuantity + 5 }))}
              className="w-11 h-11 rounded-xl bg-[#F7F3EC] dark:bg-[#1A1412] text-[#38251E] dark:text-[#F7F3EC] font-bold text-base flex items-center justify-center border border-[#DCC9B2]/30 dark:border-white/10 cursor-pointer"
            >
              +5
            </button>
          </div>
        </div>
      </ConfirmationModal>
    </StaffLayout>
  );
}
