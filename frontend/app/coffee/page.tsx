import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { DailyCoffee } from '@/types/coffee';
import { Coffee, Sparkles } from 'lucide-react';
import Link from 'next/link';
import CoffeeCardWithModal from '@/components/coffee/CoffeeCardWithModal';

async function getAllCoffees(): Promise<DailyCoffee[]> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  try {
    const res = await fetch(`${API_BASE}/api/coffee`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function AllCoffeesPage() {
  const coffees = await getAllCoffees();

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F3EC] dark:bg-[#1A1412] transition-colors">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 w-full py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold px-3 py-1 bg-[#B77B4B]/15 text-[#B77B4B] rounded-full inline-flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>سجل المحاصيل المختصة</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#38251E] dark:text-[#F7F3EC] tracking-tight">
            محاصيل قهوة رُكن
          </h1>
          <p className="text-xs sm:text-sm text-[#38251E]/70 dark:text-[#F7F3EC]/70 mt-2 leading-relaxed">
            استكشف تاريخ المحاصيل المختصة التي نقدمها في رُكن، منتقاة بعناية من أفضل المزارع حول العالم.
          </p>
        </div>

        {coffees.length === 0 ? (
          <div className="bg-white dark:bg-[#251D1A] rounded-3xl p-16 text-center border border-[#DCC9B2]/50 dark:border-white/10 shadow-sm max-w-md mx-auto">
            <Coffee className="w-12 h-12 text-[#DCC9B2] dark:text-white/20 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#38251E] dark:text-[#F7F3EC]">لا توجد محاصيل معروضة حالياً</h3>
            <p className="text-xs text-[#38251E]/60 dark:text-[#F7F3EC]/60 mt-1">يرجى العودة للصفحة الرئيسية لمعرفة قهوة اليوم.</p>
            <Link
              href="/"
              className="inline-block mt-4 bg-[#38251E] dark:bg-[#B77B4B] hover:bg-[#B77B4B] dark:hover:bg-[#38251E] text-[#F7F3EC] px-5 py-2.5 rounded-xl text-xs font-medium transition-colors"
            >
              الذهاب لقهوة اليوم
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coffees.map((c) => (
              <CoffeeCardWithModal key={c.id} coffee={c} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
