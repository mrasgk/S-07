'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coffee, LogOut } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';

interface Props {
  title?: string;
  subtitle?: string;
}

export default function StaffMobileHeader({ title, subtitle }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { info } = useToast();

  const getPageTitle = () => {
    if (title) return title;
    if (pathname.includes('/staff/dashboard')) return 'الرئيسية';
    if (pathname.includes('/staff/orders')) return 'الطلبات الحية';
    if (pathname.includes('/staff/coffees/new')) return 'إضافة محصول';
    if (pathname.includes('/staff/coffees')) return 'إدارة القهوة';
    if (pathname.includes('/staff/settings')) return 'الإعدادات';
    return 'لوحة الطاقم';
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
    <header className="lg:hidden sticky top-0 z-30 bg-[#38251E] text-[#F7F3EC] px-4 py-3 flex items-center justify-between border-b border-white/10 shadow-sm">
      <div className="flex items-center gap-2.5">
        <Link
          href="/staff/dashboard"
          className="w-9 h-9 rounded-xl bg-[#B77B4B] flex items-center justify-center text-white shrink-0 shadow-xs"
        >
          <Coffee className="w-5 h-5" />
        </Link>
        <div>
          <span className="font-bold text-sm tracking-tight block text-white leading-tight">
            {getPageTitle()}
          </span>
          <span className="text-[10px] text-[#DCC9B2] block leading-tight">
            رُكن — قهوة اليوم
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-red-300 transition-colors cursor-pointer"
          title="تسجيل الخروج"
          aria-label="تسجيل الخروج"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
