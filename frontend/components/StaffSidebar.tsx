'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Coffee,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: 'الرئيسية', href: '/staff/dashboard', icon: LayoutDashboard },
  { name: 'الطلبات', href: '/staff/orders', icon: ClipboardList },
  { name: 'إدارة القهوة', href: '/staff/coffees', icon: Coffee },
  { name: 'الإعدادات', href: '/staff/settings', icon: Settings },
];

export default function StaffSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { info } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await fetchApi('/api/staff/auth/logout', { method: 'POST' });
      info('تم تسجيل الخروج بنجاح.');
    } catch {
      // Ignore
    } finally {
      router.push('/staff/login');
    }
  };

  return (
    <aside
      className={`hidden lg:flex fixed top-0 bottom-0 start-0 z-50 bg-[#38251E] text-[#F7F3EC] flex-col justify-between transition-all duration-300 border-e border-white/10 shadow-xl
        ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Brand & Toggle */}
      <div>
        <div className="p-5 flex items-center justify-between border-b border-white/10 h-20">
          <Link
            href="/staff/dashboard"
            className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}
          >
            <div className="w-10 h-10 rounded-2xl bg-[#B77B4B] flex items-center justify-center shrink-0 shadow-sm text-white">
              <Coffee className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="whitespace-nowrap">
                <span className="font-bold text-lg tracking-tight block">رُكن</span>
                <span className="text-[10px] text-[#DCC9B2] block -mt-1 font-normal">لوحة إدارة الطاقم</span>
              </div>
            )}
          </Link>

          {/* Collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
            title={isCollapsed ? 'توسيع القائمة' : 'تصغير القائمة'}
          >
            {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/staff/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#B77B4B] text-white shadow-sm'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-medium text-red-300 hover:bg-red-950/40 hover:text-red-200 transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title="تسجيل الخروج"
        >
          <LogOut className="w-5 h-5 shrink-0 text-red-400" />
          {!isCollapsed && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  );
}
