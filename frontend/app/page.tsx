import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CoffeeCardWithModal from '@/components/coffee/CoffeeCardWithModal';
import type { DailyCoffee } from '@/types/coffee';
import { Coffee, Sparkles, Clock, Award, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';

async function getTopCoffees(): Promise<DailyCoffee[]> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  try {
    const res = await fetch(`${API_BASE}/api/coffee`, { cache: 'no-store' });
    if (!res.ok) return [];
    const allCoffees: DailyCoffee[] = await res.json();
    return allCoffees.slice(0, 4);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const topCoffees = await getTopCoffees();

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F3EC] dark:bg-[#1A1412] transition-colors">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        {/* Hero Section */}
        <section className="pt-12 sm:pt-20 pb-16 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B77B4B]/15 text-[#B77B4B] text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>محصول استثنائي جديد كل صباح</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#38251E] dark:text-[#F7F3EC] tracking-tight leading-tight sm:leading-tight mb-6">
            قهوتك اليوم، <br className="hidden sm:inline" />
            <span className="text-[#B77B4B]">بتفاصيل مختلفة.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#38251E]/75 dark:text-[#F7F3EC]/75 leading-relaxed max-w-2xl mx-auto mb-8 font-normal">
            في مقهى <span className="font-semibold text-[#38251E] dark:text-[#F7F3EC]">رُكن</span> نؤمن أن لكل محصول قصة. ننتقي يومياً سلالة فريدة من مزارع القهوة المختصة حول العالم، ونحمصها بعناية فائقة لتصلك بأعلى درجات النقاء والانتعاش.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#coffees-section"
              className="w-full sm:w-auto bg-[#38251E] dark:bg-[#B77B4B] hover:bg-[#B77B4B] dark:hover:bg-[#38251E] text-[#F7F3EC] px-8 py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Coffee className="w-4 h-4" />
              <span>اطلب قهوتك الآن</span>
            </a>
            <Link
              href="/coffee"
              className="w-full sm:w-auto border border-[#DCC9B2] dark:border-white/15 hover:bg-white/60 dark:hover:bg-white/10 text-[#38251E] dark:text-[#F7F3EC] px-6 py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Coffee className="w-4 h-4 text-[#B77B4B]" />
              <span>استكشف سجل المحاصيل</span>
            </Link>
            <Link
              href="/track"
              className="w-full sm:w-auto bg-[#DCC9B2]/30 dark:bg-white/10 hover:bg-[#DCC9B2]/60 dark:hover:bg-white/15 text-[#38251E] dark:text-[#F7F3EC] px-6 py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Search className="w-4 h-4 text-[#B77B4B]" />
              <span>تتبع طلبك</span>
            </Link>
          </div>
        </section>

        {/* Top 4 Ordered Coffees Section */}
        {topCoffees.length > 0 && (
          <section id="coffees-section" className="py-14 border-t border-[#DCC9B2]/40 dark:border-white/10 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-semibold px-3 py-1 bg-[#B77B4B]/15 text-[#B77B4B] rounded-full inline-flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>المحاصيل الأكثر طلباً</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#38251E] dark:text-[#F7F3EC] tracking-tight">
                  أفضل 4 محاصيل مختارة
                </h2>
                <p className="text-xs sm:text-sm text-[#38251E]/70 dark:text-[#F7F3EC]/70 mt-1">
                  اكتشف أشهر المحاصيل المفضلة لدى زوار رُكن واحجز قهوتك مباشرة عبر النافذة السريعة.
                </p>
              </div>

              <Link
                href="/coffee"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#B77B4B] hover:text-[#38251E] dark:hover:text-white hover:underline transition-colors shrink-0 self-start sm:self-auto bg-white/70 dark:bg-white/5 px-4 py-2.5 rounded-xl border border-[#DCC9B2]/60 dark:border-white/10 shadow-xs"
              >
                <span>استعراض جميع المحاصيل</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {topCoffees.map((c) => (
                <CoffeeCardWithModal key={c.id} coffee={c} />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/coffee"
                className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold bg-white dark:bg-[#251D1A] text-[#38251E] dark:text-[#F7F3EC] py-3 px-5 rounded-xl border border-[#DCC9B2] dark:border-white/10 shadow-xs"
              >
                <span>استعراض جميع المحاصيل</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>
        )}

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 border-t border-[#DCC9B2]/40 dark:border-white/10 scroll-mt-20">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-semibold text-[#B77B4B] tracking-wider uppercase">بساطة التجربة</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#38251E] dark:text-[#F7F3EC] mt-1">كيف يعمل رُكن؟</h2>
            <p className="text-xs sm:text-sm text-[#38251E]/70 dark:text-[#F7F3EC]/70 mt-2">
              ثلاث خطوات سهلة تفصلك عن الاستمتاع بقهوة مختصة محضرة خصيصاً لك.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white dark:bg-[#251D1A] rounded-3xl p-6 sm:p-8 border border-[#DCC9B2]/50 dark:border-white/10 shadow-sm text-center relative group hover:border-[#B77B4B]/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#F7F3EC] dark:bg-[#1A1412] text-[#B77B4B] flex items-center justify-center mx-auto mb-4 font-bold text-lg group-hover:scale-105 transition-transform">
                1
              </div>
              <h3 className="text-base font-bold text-[#38251E] dark:text-[#F7F3EC] mb-2 flex items-center justify-center gap-2">
                <Coffee className="w-4 h-4 text-[#B77B4B]" />
                <span>اختر قهوتك</span>
              </h3>
              <p className="text-xs text-[#38251E]/70 dark:text-[#F7F3EC]/70 leading-relaxed">
                اطلع على تفاصيل محصول اليوم، منشأ الحبوب، مستوى التحميص، والإيحاءات المتفردة.
              </p>
            </div>

            <div className="bg-white dark:bg-[#251D1A] rounded-3xl p-6 sm:p-8 border border-[#DCC9B2]/50 dark:border-white/10 shadow-sm text-center relative group hover:border-[#B77B4B]/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#F7F3EC] dark:bg-[#1A1412] text-[#B77B4B] flex items-center justify-center mx-auto mb-4 font-bold text-lg group-hover:scale-105 transition-transform">
                2
              </div>
              <h3 className="text-base font-bold text-[#38251E] dark:text-[#F7F3EC] mb-2 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-[#B77B4B]" />
                <span>أكّد طلبك المسبق</span>
              </h3>
              <p className="text-xs text-[#38251E]/70 dark:text-[#F7F3EC]/70 leading-relaxed">
                حدد الكمية وضع رقمك المرجعي لضمان حجز كوبك قبل نفاد الكمية المحدودة لليوم.
              </p>
            </div>

            <div className="bg-white dark:bg-[#251D1A] rounded-3xl p-6 sm:p-8 border border-[#DCC9B2]/50 dark:border-white/10 shadow-sm text-center relative group hover:border-[#B77B4B]/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#F7F3EC] dark:bg-[#1A1412] text-[#B77B4B] flex items-center justify-center mx-auto mb-4 font-bold text-lg group-hover:scale-105 transition-transform">
                3
              </div>
              <h3 className="text-base font-bold text-[#38251E] dark:text-[#F7F3EC] mb-2 flex items-center justify-center gap-2">
                <Award className="w-4 h-4 text-[#B77B4B]" />
                <span>استلمها طازجة</span>
              </h3>
              <p className="text-xs text-[#38251E]/70 dark:text-[#F7F3EC]/70 leading-relaxed">
                توجه إلى المقهى واستلم قهوتك محضرة بحرفية وجاهزة لك في الوقت المحدد دون أدنى انتظار.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
