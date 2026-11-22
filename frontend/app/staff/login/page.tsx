'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import type { StaffUser } from '@/types/staff';
import { Coffee, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function StaffLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('يرجى ملء جميع الحقول.');
      return;
    }

    setLoading(true);

    try {
      await fetchApi<StaffUser>('/api/staff/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      router.push('/staff/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل تسجيل الدخول. يرجى التحقق من صحة البيانات.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC] flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Brand logo */}
      <Link href="/" className="flex flex-col items-center gap-2 mb-8 group">
        <div className="w-12 h-12 rounded-full bg-[#38251E] flex items-center justify-center text-[#F7F3EC] shadow-md group-hover:bg-[#B77B4B] transition-colors">
          <Coffee className="w-6 h-6" />
        </div>
        <span className="text-2xl font-extrabold text-[#38251E]">رُكن</span>
        <span className="text-xs text-[#B77B4B] font-medium tracking-wide -mt-1">بوابة فريق العمل والمقهى</span>
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#DCC9B2]/60 shadow-md w-full max-w-md">
        <h1 className="text-xl font-bold text-[#38251E] mb-1 text-center">تسجيل دخول الموظفين</h1>
        <p className="text-xs text-[#38251E]/60 mb-6 text-center">
          يرجى إدخال بيانات حساب الباريستا لإدارة الطلبات الواردة.
        </p>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#38251E] mb-1.5">
              اسم المستخدم
            </label>
            <div className="relative">
              <input
                type="text"
                required
                dir="ltr"
                placeholder="أدخل اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="w-full px-3.5 py-2.5 ps-10 rounded-xl border border-[#DCC9B2] focus:outline-none focus:ring-2 focus:ring-[#B77B4B] text-sm text-[#38251E] disabled:opacity-50"
              />
              <User className="w-4 h-4 text-[#38251E]/40 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#38251E] mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type="password"
                required
                dir="ltr"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full px-3.5 py-2.5 ps-10 rounded-xl border border-[#DCC9B2] focus:outline-none focus:ring-2 focus:ring-[#B77B4B] text-sm text-[#38251E] disabled:opacity-50"
              />
              <Lock className="w-4 h-4 text-[#38251E]/40 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#38251E] hover:bg-[#B77B4B] text-[#F7F3EC] py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 mt-2 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري التحقق...</span>
              </>
            ) : (
              <span>تسجيل الدخول</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
