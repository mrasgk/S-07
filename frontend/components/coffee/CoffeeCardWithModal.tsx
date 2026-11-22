'use client';

import { useState } from 'react';
import type { DailyCoffee } from '@/types/coffee';
import PreorderModal from './PreorderModal';
import {
  Coffee,
  Flame,
  MapPin,
} from 'lucide-react';

interface CoffeeCardProps {
  coffee: DailyCoffee;
}

export default function CoffeeCardWithModal({ coffee }: CoffeeCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isAvailable = coffee.isAvailable && coffee.availableQuantity > 0;

  return (
    <>
      {/* Coffee Card */}
      <div className="bg-white dark:bg-[#251D1A] rounded-3xl p-6 border border-[#DCC9B2]/60 dark:border-white/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                isAvailable
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
              }`}
            >
              {isAvailable ? `متاح (${coffee.availableQuantity} كوب)` : 'محصول غير متاح'}
            </span>
            <span className="text-xs font-bold text-[#B77B4B]">{coffee.price} د.م</span>
          </div>

          <h3 className="text-xl font-bold text-[#38251E] dark:text-[#F7F3EC] mb-2">{coffee.name}</h3>
          <p className="text-xs text-[#38251E]/75 dark:text-[#F7F3EC]/75 leading-relaxed mb-4 line-clamp-3">
            {coffee.description}
          </p>

          <div className="space-y-2 mb-6">
            {coffee.origin && (
              <div className="flex items-center gap-2 text-xs text-[#38251E]/80 dark:text-[#F7F3EC]/80">
                <MapPin className="w-3.5 h-3.5 text-[#B77B4B]" />
                <span>المنشأ: {coffee.origin}</span>
              </div>
            )}
            {coffee.roastLevel && (
              <div className="flex items-center gap-2 text-xs text-[#38251E]/80 dark:text-[#F7F3EC]/80">
                <Flame className="w-3.5 h-3.5 text-[#B77B4B]" />
                <span>التحميص: {coffee.roastLevel}</span>
              </div>
            )}
            {coffee.tastingNotes && (
              <div className="flex items-center gap-2 text-xs text-[#38251E]/80 dark:text-[#F7F3EC]/80">
                <Coffee className="w-3.5 h-3.5 text-[#B77B4B]" />
                <span>الإيحاءات: {coffee.tastingNotes}</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          disabled={!isAvailable}
          className="w-full bg-[#38251E] dark:bg-[#B77B4B] hover:bg-[#B77B4B] dark:hover:bg-[#38251E] text-[#F7F3EC] py-2.5 rounded-xl text-xs font-semibold text-center transition-colors block cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
        >
          {isAvailable ? 'طلب قهوة اليوم' : 'غير متوفر للطلب'}
        </button>
      </div>

      {/* Pop-up Modal to fill order information */}
      <PreorderModal
        coffee={coffee}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
