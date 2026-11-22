import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OrderTrackerSearch from '@/components/OrderTrackerSearch';
import { Search } from 'lucide-react';

export default function TrackPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F3EC] dark:bg-[#1A1412] transition-colors">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 w-full py-16">
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#38251E] dark:bg-[#B77B4B] text-[#F7F3EC] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Search className="w-6 h-6 text-[#B77B4B] dark:text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#38251E] dark:text-[#F7F3EC] tracking-tight">تتبع طلبك</h1>
          <p className="text-xs sm:text-sm text-[#38251E]/70 dark:text-[#F7F3EC]/70 mt-2">
            يمكنك متابعة حالة إعداد طلبك لحظة بلحظة عن طريق إدخال الرقم المرجعي للطلب.
          </p>
        </div>

        <OrderTrackerSearch />
      </main>

      <Footer />
    </div>
  );
}
