'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import type { StaffUser, ChangePasswordPayload } from '@/types/staff';
import { useToast } from '@/components/ToastProvider';
import { useTheme } from '@/components/ThemeProvider';
import StaffLayout from '@/components/StaffLayout';
import {
  Sun,
  Moon,
  Laptop,
  Lock,
  User,
  ShieldCheck,
  Info,
  CheckCircle2,
  Loader2,
  Coffee,
  LogOut
} from 'lucide-react';

export default function StaffSettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { success, error: toastError, info } = useToast();

  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loadingUser, setLoadingUser] = useState(true);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadUser() {
      try {
        const user = await fetchApi<StaffUser>('/api/staff/auth/me');
        if (!ignore) {
          setCurrentUser(user);
          setLoadingUser(false);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'تعذر تحميل بيانات المستخدم.';
          if (msg.includes('تسجيل الدخول') || msg.includes('401')) {
            router.push('/staff/login');
          } else {
            setLoadingUser(false);
          }
        }
      }
    }

    loadUser();

    return () => {
      ignore = true;
    };
  }, [router]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      const msg = 'يرجى ملء جميع حقول كلمة المرور.';
      setPasswordError(msg);
      toastError(msg);
      return;
    }

    if (newPassword.length < 6) {
      const msg = 'يجب ألا تقل كلمة المرور الجديدة عن 6 أحرف.';
      setPasswordError(msg);
      toastError(msg);
      return;
    }

    if (newPassword !== confirmPassword) {
      const msg = 'كلمة المرور الجديدة وتأكيدها غير متطابقين.';
      setPasswordError(msg);
      toastError(msg);
      return;
    }

    setSavingPassword(true);

    try {
      const payload: ChangePasswordPayload = {
        currentPassword,
        newPassword,
      };

      await fetchApi('/api/staff/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      success('تم تغيير كلمة المرور بنجاح.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل تغيير كلمة المرور.';
      setPasswordError(msg);
      toastError(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetchApi('/api/staff/auth/logout', { method: 'POST' });
      info('تم تسجيل الخروج بنجاح.');
    } finally {
      router.push('/staff/login');
    }
  };

  return (
    <StaffLayout>
      <div className="w-full space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-[#38251E] dark:text-[#F7F3EC] tracking-tight">
            إعدادات النظام والحساب
          </h1>
          <p className="text-[11px] sm:text-xs text-[#38251E]/70 dark:text-[#F7F3EC]/70 mt-0.5">
            تخصيص مظهر لوحة الإدارة، إدارة أمان الحساب، ومعلومات تطبيق رُكن.
          </p>
        </div>

        {/* Section A: Appearance */}
        <section className="bg-white dark:bg-[#251D1A] rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-[#DCC9B2]/60 dark:border-white/10 shadow-xs space-y-4">
          <div className="border-b border-[#DCC9B2]/30 dark:border-white/10 pb-3 sm:pb-4">
            <h2 className="text-sm sm:text-base font-bold text-[#38251E] dark:text-[#F7F3EC] flex items-center gap-2">
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-[#B77B4B]" />
              <span>المظهر والعرض (Theme)</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-[#38251E]/60 dark:text-[#F7F3EC]/60 mt-0.5">
              اختر السمة البصرية المفضلة. يتم حفظ تفضيلك وتطبيقه تلقائياً.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 pt-1">
            {/* Light Theme */}
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-start transition-all cursor-pointer flex sm:flex-col justify-between items-center sm:items-start min-h-[56px] sm:h-28 ${
                theme === 'light'
                  ? 'border-[#B77B4B] bg-[#F7F3EC] dark:bg-white/10 ring-2 ring-[#B77B4B]'
                  : 'border-[#DCC9B2]/60 dark:border-white/10 hover:border-[#B77B4B]/50'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:justify-between sm:w-full">
                <Sun className="w-5 h-5 text-amber-600" />
                <span className="font-bold text-xs sm:text-sm text-[#38251E] dark:text-[#F7F3EC] sm:hidden">فاتح</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-sm block text-[#38251E] dark:text-[#F7F3EC]">فاتح</span>
                <span className="text-[11px] text-[#38251E]/60 dark:text-[#F7F3EC]/60 block mt-0.5">سمة الإسبريسو والكريمة</span>
              </div>
              {theme === 'light' && <CheckCircle2 className="w-4 h-4 text-[#B77B4B]" />}
            </button>

            {/* Dark Theme */}
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-start transition-all cursor-pointer flex sm:flex-col justify-between items-center sm:items-start min-h-[56px] sm:h-28 ${
                theme === 'dark'
                  ? 'border-[#B77B4B] bg-[#F7F3EC] dark:bg-white/10 ring-2 ring-[#B77B4B]'
                  : 'border-[#DCC9B2]/60 dark:border-white/10 hover:border-[#B77B4B]/50'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:justify-between sm:w-full">
                <Moon className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-xs sm:text-sm text-[#38251E] dark:text-[#F7F3EC] sm:hidden">داكن</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-sm block text-[#38251E] dark:text-[#F7F3EC]">داكن</span>
                <span className="text-[11px] text-[#38251E]/60 dark:text-[#F7F3EC]/60 block mt-0.5">سمة داكنة مريحة للعين</span>
              </div>
              {theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-[#B77B4B]" />}
            </button>

            {/* System Theme */}
            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-start transition-all cursor-pointer flex sm:flex-col justify-between items-center sm:items-start min-h-[56px] sm:h-28 ${
                theme === 'system'
                  ? 'border-[#B77B4B] bg-[#F7F3EC] dark:bg-white/10 ring-2 ring-[#B77B4B]'
                  : 'border-[#DCC9B2]/60 dark:border-white/10 hover:border-[#B77B4B]/50'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:justify-between sm:w-full">
                <Laptop className="w-5 h-5 text-[#B77B4B]" />
                <span className="font-bold text-xs sm:text-sm text-[#38251E] dark:text-[#F7F3EC] sm:hidden">تلقائي</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-sm block text-[#38251E] dark:text-[#F7F3EC]">حسب إعدادات الجهاز</span>
                <span className="text-[11px] text-[#38251E]/60 dark:text-[#F7F3EC]/60 block mt-0.5">تتبع إعدادات الجهاز تلقائياً</span>
              </div>
              {theme === 'system' && <CheckCircle2 className="w-4 h-4 text-[#B77B4B]" />}
            </button>
          </div>
        </section>

        {/* Section B: Account & Password */}
        <section className="bg-white dark:bg-[#251D1A] rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-[#DCC9B2]/60 dark:border-white/10 shadow-xs space-y-5">
          <div className="border-b border-[#DCC9B2]/30 dark:border-white/10 pb-3 sm:pb-4">
            <h2 className="text-sm sm:text-base font-bold text-[#38251E] dark:text-[#F7F3EC] flex items-center gap-2">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#B77B4B]" />
              <span>الحساب وأمان تسجيل الدخول</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-[#38251E]/60 dark:text-[#F7F3EC]/60 mt-0.5">
              بيانات حساب الباريستا الحالي وتعديل كلمة المرور الخاصة بك.
            </p>
          </div>

          <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F7F3EC] dark:bg-[#1A1412] border border-[#DCC9B2]/30 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#B77B4B] text-white flex items-center justify-center font-bold text-sm">
                {currentUser?.username?.[0]?.toUpperCase() || 'R'}
              </div>
              <div>
                <span className="font-bold text-xs sm:text-sm text-[#38251E] dark:text-[#F7F3EC] block">
                  {loadingUser ? 'جاري التحميل...' : currentUser?.username}
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#38251E]/60 dark:text-[#F7F3EC]/60 block -mt-0.5">
                  طاقم العمل المعتمد
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>حساب نشط</span>
            </div>
          </div>

          {passwordError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 pt-1">
            <h3 className="text-xs font-bold text-[#38251E] dark:text-[#F7F3EC]">تغيير كلمة المرور:</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#38251E] dark:text-[#F7F3EC] mb-1.5">
                  كلمة المرور الحالية <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={savingPassword}
                    className="w-full px-3.5 py-2.5 ps-9 rounded-xl border border-[#DCC9B2] dark:border-white/15 bg-white dark:bg-[#1A1412] text-xs text-[#38251E] dark:text-[#F7F3EC] focus:outline-none focus:ring-2 focus:ring-[#B77B4B] min-h-[44px]"
                  />
                  <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#38251E] dark:text-[#F7F3EC] mb-1.5">
                  كلمة المرور الجديدة <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={savingPassword}
                    className="w-full px-3.5 py-2.5 ps-9 rounded-xl border border-[#DCC9B2] dark:border-white/15 bg-white dark:bg-[#1A1412] text-xs text-[#38251E] dark:text-[#F7F3EC] focus:outline-none focus:ring-2 focus:ring-[#B77B4B] min-h-[44px]"
                  />
                  <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#38251E] dark:text-[#F7F3EC] mb-1.5">
                  تأكيد كلمة المرور <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={savingPassword}
                    className="w-full px-3.5 py-2.5 ps-9 rounded-xl border border-[#DCC9B2] dark:border-white/15 bg-white dark:bg-[#1A1412] text-xs text-[#38251E] dark:text-[#F7F3EC] focus:outline-none focus:ring-2 focus:ring-[#B77B4B] min-h-[44px]"
                  />
                  <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3.5" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={savingPassword}
                className="w-full sm:w-auto bg-[#38251E] dark:bg-[#B77B4B] hover:bg-[#B77B4B] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
              >
                {savingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>تحديث كلمة المرور</span>
              </button>
            </div>
          </form>
        </section>

        {/* Section C: About Application & Logout */}
        <section className="bg-white dark:bg-[#251D1A] rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-[#DCC9B2]/60 dark:border-white/10 shadow-xs space-y-4">
          <div className="border-b border-[#DCC9B2]/30 dark:border-white/10 pb-3 sm:pb-4">
            <h2 className="text-sm sm:text-base font-bold text-[#38251E] dark:text-[#F7F3EC] flex items-center gap-2">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-[#B77B4B]" />
              <span>حول تطبيق رُكن (S-07)</span>
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#38251E]/70 dark:text-[#F7F3EC]/70">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-[#B77B4B]" />
                <span className="font-bold text-[#38251E] dark:text-[#F7F3EC]">رُكن — قهوة اليوم المختصة</span>
              </div>
              <p>منظومة حجز مسبق وإدارة عمليات الباريستا في مقاهي القهوة المختصة بالمغرب.</p>
            </div>

            <div className="text-start sm:text-end">
              <span className="font-mono font-semibold text-[#B77B4B] block">الإصدار 1.0.0</span>
              <span className="text-[10px] text-neutral-400 block">S-07 Production Standard</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#DCC9B2]/30 dark:border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer min-h-[44px]"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج من الحساب</span>
            </button>
          </div>
        </section>
      </div>
    </StaffLayout>
  );
}
