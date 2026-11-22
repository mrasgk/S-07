'use client';

import React from 'react';
import StaffSidebar from './StaffSidebar';
import StaffBottomNav from './StaffBottomNav';
import StaffMobileHeader from './StaffMobileHeader';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F3EC] dark:bg-[#1A1412] text-[#38251E] dark:text-[#F7F3EC] transition-colors duration-200 flex flex-col">
      {/* Desktop Sidebar (lg and above) */}
      <StaffSidebar />

      {/* Mobile Top Header (hidden on lg) */}
      <StaffMobileHeader />

      {/* Main Container */}
      <div className="lg:ps-64 flex-1 flex flex-col min-w-0 w-full">
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 w-full pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation (hidden on lg) */}
      <StaffBottomNav />
    </div>
  );
}
