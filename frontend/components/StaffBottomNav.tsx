'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ClipboardList, Coffee, Settings } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: 'الرئيسية', href: '/staff/dashboard', icon: LayoutDashboard },
  { name: 'الطلبات', href: '/staff/orders', icon: ClipboardList },
  { name: 'القهوة', href: '/staff/coffees', icon: Coffee },
  { name: 'الإعدادات', href: '/staff/settings', icon: Settings },
];

export default function StaffBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="التنقل السفلي للطاقم"
      className="lg:hidden fixed bottom-0 start-0 end-0 z-40 bg-[#38251E] text-[#F7F3EC] border-t border-white/10 shadow-2xl pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/staff/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center min-w-[64px] min-h-[48px] py-1 px-1 rounded-2xl transition-all relative ${
                isActive
                  ? 'text-[#B77B4B] font-bold'
                  : 'text-[#F7F3EC]/70 hover:text-white'
              }`}
            >
              {/* Active Indicator Top Bar */}
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-[#B77B4B] rounded-full" />
              )}
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              </div>
              <span className="text-[11px] mt-1 leading-none tracking-tight">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
