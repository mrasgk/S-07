'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function OrderTrackerSearch() {
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = orderNumber.trim();
    if (!clean) {
      setError('يرجى إدخال رقم الطلب.');
      return;
    }
    router.push(`/order/${encodeURIComponent(clean)}`);
  };

  return (
    <div id="track-section" className="bg-white dark:bg-[#251D1A] rounded-2xl p-6 sm:p-8 border border-[#DCC9B2]/60 dark:border-white/10 shadow-sm max-w-xl mx-auto my-12">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-[#38251E] dark:text-[#F7F3EC]">تتبع حالة طلبك</h3>
        <p className="text-xs text-[#38251E]/70 dark:text-[#F7F3EC]/70 mt-1">
          أدخل رقم الطلب المرجعي الخاص بك للاطلاع على مراحل تحضير قهوتك في الوقت الفعلي.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            dir="ltr"
            placeholder="RUKN-20261122-XXXXXX"
            value={orderNumber}
            onChange={(e) => {
              setOrderNumber(e.target.value);
              setError('');
            }}
            className="w-full px-4 py-3 rounded-xl border border-[#DCC9B2] dark:border-white/15 bg-white dark:bg-[#1A1412] focus:outline-none focus:ring-2 focus:ring-[#B77B4B] text-center font-mono text-sm tracking-wider uppercase text-[#38251E] dark:text-[#F7F3EC] placeholder:text-[#38251E]/30 dark:placeholder:text-white/20"
          />
        </div>
        <button
          type="submit"
          className="bg-[#38251E] dark:bg-[#B77B4B] hover:bg-[#B77B4B] dark:hover:bg-[#38251E] text-[#F7F3EC] px-6 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>تتبع</span>
        </button>
      </form>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
