'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coffee, Search, ShieldCheck, Menu, X, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F7F3EC]/95 dark:bg-[#1A1412]/95 backdrop-blur-md border-b border-[#DCC9B2]/40 dark:border-white/10 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-2.5 group shrink-0 min-h-[44px]"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#38251E] dark:bg-[#B77B4B] flex items-center justify-center text-[#F7F3EC] shadow-xs group-hover:bg-[#B77B4B] transition-colors">
            <Coffee className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-[#38251E] dark:text-[#F7F3EC] leading-tight">
              رُكن
            </span>
            <span className="text-[9px] sm:text-[10px] text-[#B77B4B] font-semibold tracking-wide -mt-0.5">
              قهوة اليوم المختصة
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className={`text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl transition-all ${
              isActive('/')
                ? 'bg-[#38251E] dark:bg-[#B77B4B] text-white shadow-xs'
                : 'text-[#38251E]/80 dark:text-[#F7F3EC]/80 hover:text-[#38251E] dark:hover:text-white hover:bg-[#DCC9B2]/20 dark:hover:bg-white/10'
            }`}
          >
            الرئيسية
          </Link>
          <Link
            href="/coffee"
            className={`text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl transition-all ${
              isActive('/coffee')
                ? 'bg-[#38251E] dark:bg-[#B77B4B] text-white shadow-xs'
                : 'text-[#38251E]/80 dark:text-[#F7F3EC]/80 hover:text-[#38251E] dark:hover:text-white hover:bg-[#DCC9B2]/20 dark:hover:bg-white/10'
            }`}
          >
            سجل المحاصيل
          </Link>
          <Link
            href="/track"
            className={`text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              isActive('/track') || isActive('/order')
                ? 'bg-[#B77B4B] text-white shadow-xs'
                : 'bg-[#DCC9B2]/30 dark:bg-white/10 hover:bg-[#DCC9B2]/50 text-[#38251E] dark:text-[#F7F3EC]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>تتبع الطلب</span>
          </Link>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-[#DCC9B2]/60 dark:border-white/15 hover:bg-white/60 dark:hover:bg-white/10 text-[#38251E] dark:text-[#F7F3EC] transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center mx-1"
            title={resolvedTheme === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
            aria-label="تبديل المظهر"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-[#38251E]" />
            )}
          </button>

          <div className="h-4 w-px bg-[#DCC9B2]/50 dark:bg-white/10 mx-1" aria-hidden="true" />
          <Link
            href="/staff/dashboard"
            className="text-xs text-[#38251E]/70 dark:text-[#F7F3EC]/70 hover:text-[#38251E] dark:hover:text-white p-2 rounded-xl hover:bg-[#DCC9B2]/20 dark:hover:bg-white/10 transition-colors flex items-center gap-1 font-medium"
            title="بوابة إدارة المقهى"
          >
            <ShieldCheck className="w-4 h-4 text-[#B77B4B]" />
            <span className="hidden lg:inline text-[11px]">الإدارة</span>
          </Link>
        </nav>

        {/* Mobile Action Buttons (Theme Toggle + Track Pill + Hamburger) */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-[#DCC9B2]/60 dark:border-white/15 bg-white/40 dark:bg-white/5 text-[#38251E] dark:text-[#F7F3EC] transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="تبديل المظهر"
            aria-label="تبديل المظهر"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[#38251E]" />
            )}
          </button>

          <Link
            href="/track"
            className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 transition-all ${
              isActive('/track') || isActive('/order')
                ? 'bg-[#B77B4B] text-white shadow-xs'
                : 'bg-[#DCC9B2]/40 dark:bg-white/10 text-[#38251E] dark:text-[#F7F3EC]'
            }`}
          >
            <Search className="w-3 h-3 text-[#B77B4B] group-hover:text-white" />
            <span>تتبع</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة الرئيسية'}
            aria-expanded={mobileMenuOpen}
            className="p-2 rounded-xl border border-[#DCC9B2] dark:border-white/15 hover:bg-white/60 dark:hover:bg-white/10 text-[#38251E] dark:text-[#F7F3EC] transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#DCC9B2]/40 dark:border-white/10 bg-[#F7F3EC] dark:bg-[#1A1412] px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top-2 duration-200 shadow-lg">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between p-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
              isActive('/')
                ? 'bg-[#38251E] dark:bg-[#B77B4B] text-white shadow-xs'
                : 'bg-white/60 dark:bg-white/5 text-[#38251E] dark:text-[#F7F3EC] border border-[#DCC9B2]/40 dark:border-white/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-[#B77B4B]" />
              <span>الرئيسية (قهوة اليوم)</span>
            </div>
            <ArrowLeft className="w-3.5 h-3.5 text-neutral-400" />
          </Link>

          <Link
            href="/coffee"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between p-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
              isActive('/coffee')
                ? 'bg-[#38251E] dark:bg-[#B77B4B] text-white shadow-xs'
                : 'bg-white/60 dark:bg-white/5 text-[#38251E] dark:text-[#F7F3EC] border border-[#DCC9B2]/40 dark:border-white/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-[#B77B4B]" />
              <span>سجل المحاصيل المختصة</span>
            </div>
            <ArrowLeft className="w-3.5 h-3.5 text-neutral-400" />
          </Link>

          <Link
            href="/track"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between p-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
              isActive('/track') || isActive('/order')
                ? 'bg-[#B77B4B] text-white shadow-xs'
                : 'bg-white/60 dark:bg-white/5 text-[#38251E] dark:text-[#F7F3EC] border border-[#DCC9B2]/40 dark:border-white/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#B77B4B]" />
              <span>تتبع حالة طلبك بالرقم المرجعي</span>
            </div>
            <ArrowLeft className="w-3.5 h-3.5 text-neutral-400" />
          </Link>

          <Link
            href="/staff/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-2xl text-xs font-semibold bg-[#DCC9B2]/20 dark:bg-white/5 text-[#38251E]/80 dark:text-[#F7F3EC]/80 border border-[#DCC9B2]/30 dark:border-white/10 mt-2"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#B77B4B]" />
              <span>بوابة طاقم العمل (الموظفين)</span>
            </div>
            <ArrowLeft className="w-3.5 h-3.5 text-neutral-400" />
          </Link>
        </div>
      )}
    </header>
  );
}
