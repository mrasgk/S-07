'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import type { DailyCoffee, UpdateCoffeePayload } from '@/types/coffee';
import { useToast } from '@/components/ToastProvider';
import StaffLayout from '@/components/StaffLayout';
import { ArrowRight, Loader2, Sparkles, MapPin, Flame } from 'lucide-react';

export default function EditCoffeePage() {
  const router = useRouter();
  const params = useParams();
  const coffeeId = params.id as string;
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [origin, setOrigin] = useState('');
  const [roastLevel, setRoastLevel] = useState('');
  const [tastingNotes, setTastingNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [availableQuantity, setAvailableQuantity] = useState<number | string>('');
  const [isAvailable, setIsAvailable] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadCoffee() {
      try {
        const data = await fetchApi<DailyCoffee>(`/api/staff/coffees/${coffeeId}`);
        if (!ignore) {
          setName(data.name);
          setDescription(data.description || '');
          setOrigin(data.origin || '');
          setRoastLevel(data.roastLevel || '');
          setTastingNotes(data.tastingNotes || '');
          setImageUrl(data.imageUrl || '');
          setPrice(data.price);
          setAvailableQuantity(data.availableQuantity);
          setIsAvailable(data.isAvailable);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'تعذر تحميل بيانات المحصول.';
          setError(msg);
          toastError(msg);
          setLoading(false);
        }
      }
    }

    if (coffeeId) {
      loadCoffee();
    }

    return () => {
      ignore = true;
    };
  }, [coffeeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numPrice = Number(price);
    const numQty = Number(availableQuantity);

    if (!name.trim() || !description.trim() || !origin.trim() || !roastLevel.trim() || !tastingNotes.trim()) {
      const msg = 'يرجى ملء جميع الحقول الإلزامية بدقة.';
      setError(msg);
      toastError(msg);
      return;
    }

    if (isNaN(numPrice) || numPrice <= 0) {
      const msg = 'يرجى إدخال سعر صحيح وموجب بالدرهم المغربي.';
      setError(msg);
      toastError(msg);
      return;
    }

    if (isNaN(numQty) || numQty < 0) {
      const msg = 'يرجى إدخال كمية مخزون صحيحة (صفر أو أكثر).';
      setError(msg);
      toastError(msg);
      return;
    }

    setSaving(true);

    try {
      const payload: UpdateCoffeePayload = {
        name: name.trim(),
        description: description.trim(),
        origin: origin.trim(),
        roastLevel: roastLevel.trim(),
        tastingNotes: tastingNotes.trim(),
        imageUrl: imageUrl.trim() || undefined,
        price: numPrice,
        availableQuantity: numQty,
        isAvailable,
      };

      await fetchApi<DailyCoffee>(`/api/staff/coffees/${coffeeId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      success('تم تحديث بيانات المحصول بنجاح.');
      router.push('/staff/coffees');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'تعذر حفظ تعديلات المحصول.';
      setError(msg);
      toastError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <StaffLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/staff/coffees"
            className="p-2 rounded-xl border border-[#DCC9B2] dark:border-white/10 hover:bg-white dark:hover:bg-white/5 text-[#38251E] dark:text-[#F7F3EC] transition-colors"
            title="رجوع للمحاصيل"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#38251E] dark:text-[#F7F3EC]">تعديل محصول القهوة</h1>
            <p className="text-xs text-[#38251E]/60 dark:text-[#F7F3EC]/60 mt-0.5">
              تحديث تفاصيل المحصول. لن يؤثر التعديل على الطلبات المكتملة مسبقاً.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-2xl text-xs">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white dark:bg-[#251D1A] rounded-3xl p-12 border border-[#DCC9B2]/60 dark:border-white/10 text-center animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#B77B4B] mb-2" />
            <p className="text-xs text-[#38251E]/60 dark:text-[#F7F3EC]/60">جاري تحميل بيانات المحصول...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#251D1A] rounded-3xl p-6 sm:p-8 border border-[#DCC9B2]/60 dark:border-white/10 shadow-sm space-y-5">
            {/* Coffee Name */}
            <div>
              <label className="block text-xs font-semibold text-[#38251E] dark:text-[#F7F3EC] mb-1.5">
                اسم المحصول <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCC9B2] dark:border-white/15 bg-white dark:bg-[#1A1412] text-xs sm:text-sm text-[#38251E] dark:text-[#F7F3EC] focus:outline-none focus:ring-2 focus:ring-[#B77B4B]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[#38251E] dark:text-[#F7F3EC] mb-1.5">
                الوصف التقديمي <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={saving}
                className="w-full px-3.5 py-2 rounded-xl border border-[#DCC9B2] dark:border-white/15 bg-white dark:bg-[#1A1412] text-xs sm:text-sm text-[#38251E] dark:text-[#F7F3EC] focus:outline-none focus:ring-2 focus:ring-[#B77B4B] resize-none"
              />
            </div>

            {/* Origin & Roast */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#38251E] dark:text-[#F7F3EC] mb-1.5">
                  المصدر / الدولة <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    disabled={saving}
                    className="w-full px-3.5 py-2.5 ps-9 rounded-xl border border-[#DCC9B2] dark:border-white/15 bg-white dark:bg-[#1A1412] text-xs sm:text-sm text-[#38251E] dark:text-[#F7F3EC] focus:outline-none focus:ring-2 focus:ring-[#B77B4B]"
                  />
                  <MapPin className="w-4 h-4 text-[#B77B4B] absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#38251E] dark:text-[#F7F3EC] mb-1.5">
                  مستوى التحميص <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={roastLevel}
                    onChange={(e) => setRoastLevel(e.target.value)}
                    disabled={saving}
                    className="w-full px-3.5 py-2.5 ps-9 rounded-xl border border-[#DCC9B2] dark:border-white/15 bg-white dark:bg-[#1A1412] text-xs sm:text-sm text-[#38251E] dark:text-[#F7F3EC] focus:outline-none focus:ring-2 focus:ring-[#B77B4B]"
                  />
                  <Flame className="w-4 h-4 text-[#B77B4B] absolute left-3 top-3" />
                </div>
              </div>
            </div>

            {/* Tasting Notes */}
            <div>
              <label className="block text-xs font-semibold text-[#38251E] dark:text-[#F7F3EC] mb-1.5">
                الإيحاءات والنوتات العطرية <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={tastingNotes}
                  onChange={(e) => setTastingNotes(e.target.value)}
                  disabled={saving}
                  className="w-full px-3.5 py-2.5 ps-9 rounded-xl border border-[#DCC9B2] dark:border-white/15 bg-white dark:bg-[#1A1412] text-xs sm:text-sm text-[#38251E] dark:text-[#F7F3EC] focus:outline-none focus:ring-2 focus:ring-[#B77B4B]"
                />
                <Sparkles className="w-4 h-4 text-[#B77B4B] absolute left-3 top-3" />
              </div>
            </div>

            {/* Price & Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#38251E] dark:text-[#F7F3EC] mb-1.5">
                  السعر بالدرهم المغربي (د.م) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={saving}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCC9B2] dark:border-white/15 bg-white dark:bg-[#1A1412] text-xs sm:text-sm text-[#38251E] dark:text-[#F7F3EC] focus:outline-none focus:ring-2 focus:ring-[#B77B4B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#38251E] dark:text-[#F7F3EC] mb-1.5">
                  الكمية المتاحة (عدد الأكواب) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={availableQuantity}
                  onChange={(e) => setAvailableQuantity(e.target.value)}
                  disabled={saving}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCC9B2] dark:border-white/15 bg-white dark:bg-[#1A1412] text-xs sm:text-sm text-[#38251E] dark:text-[#F7F3EC] focus:outline-none focus:ring-2 focus:ring-[#B77B4B]"
                />
              </div>
            </div>

            {/* Availability Checkbox */}
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  disabled={saving}
                  className="w-4 h-4 rounded border-[#DCC9B2] text-[#B77B4B] focus:ring-[#B77B4B]"
                />
                <span className="text-xs font-medium text-[#38251E] dark:text-[#F7F3EC]">
                  تفعيل المحصول للطلب المباشر في قائمة قهوة اليوم
                </span>
              </label>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-[#DCC9B2]/30 dark:border-white/10 flex items-center justify-end gap-3">
              <Link
                href="/staff/coffees"
                className="px-4 py-2.5 rounded-xl border border-[#DCC9B2] dark:border-white/15 hover:bg-[#F7F3EC] dark:hover:bg-white/5 text-xs font-semibold text-[#38251E] dark:text-[#F7F3EC] transition-colors"
              >
                إلغاء
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="bg-[#38251E] dark:bg-[#B77B4B] hover:bg-[#B77B4B] dark:hover:bg-[#8D5832] text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>حفظ التعديلات</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </StaffLayout>
  );
}
