import { Coffee } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#38251E] text-[#F7F3EC] py-12 px-4 sm:px-6 mt-20 border-t border-[#38251E]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-start">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-[#B77B4B]" />
            <span className="text-xl font-bold">رُكن</span>
          </div>
          <p className="text-xs text-[#DCC9B2] max-w-sm leading-relaxed">
            مفهوم معاصر لتقديم محصول قهوة مختصة جديد كل يوم في المغرب. نحمص بحرفية ونعدّ بعناية.
          </p>
        </div>

        <div className="text-xs text-[#DCC9B2]/80 flex flex-col items-center md:items-end gap-1">
          <p>
            صنع باحترافية لعشاق القهوة المختصة
          </p>
          <p>(S-07) رُكن — جميع الحقوق محفوظة {new Date().getFullYear()}</p>
          <p className="text-[10px] text-[#DCC9B2]/50 mt-1">
            رمز الدرهم المغربي: <a href="https://madsymbol.com" target="_blank" rel="noopener noreferrer" className="hover:underline">المهدي العروسي (madsymbol.com)</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
