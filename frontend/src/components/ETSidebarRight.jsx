import { Lock, TrendingUp, Play } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ETSidebarRight({ isPanelOpen }) {
  if (!isPanelOpen) return null;

  return (
    <div className="w-[300px] flex-shrink-0 font-sans-et bg-white h-full border-l border-[#e0e0e0] pl-4 pt-4 hidden lg:flex flex-col">
      {/* Risk Profile widget */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-[#d1131a] mb-2 font-bold text-sm uppercase">
          <div className="w-2 h-2 rounded-full bg-[#d1131a] animate-pulse"></div>
          ETPrime : Invest Smarter
        </div>
        <div className="border border-[#e0e0e0] p-3 rounded-sm shadow-sm relative overflow-hidden">
          <div className="text-sm font-bold text-[#222] mb-1">Risk Appetite</div>
          <div className="text-xs text-gray-600 mb-2">Aggressive Growth</div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#d1131a] w-4/5 h-full"></div>
          </div>
          <div className="mt-3 bg-[#fdeeee] text-[#d1131a] text-xs font-bold text-center py-1.5 rounded cursor-pointer hover:bg-red-200">
            Start Free Trial @ ₹0
          </div>
        </div>
      </div>

      {/* Analytics Widget / Investment Ideas */}
      <div className="mb-6">
        <div className="flex items-center justify-between border-b-2 border-black mb-3 pb-1">
          <h2 className="text-[16px] font-bold text-[#d1131a] flex items-center gap-1">
            <Play size={12} fill="#d1131a" />
            Investment Ideas <ChevronRightIcon />
          </h2>
          <div className="text-xs text-[#d1131a] flex items-center gap-1 cursor-pointer">
            <Lock size={10} /> Unlock for free
          </div>
        </div>
        <ul className="space-y-4">
          <li className="flex gap-3 items-start border-b border-gray-100 pb-3">
            <div className="w-16 h-12 bg-gray-200 flex-shrink-0 relative">
               <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=100&q=80" alt="Stocks" className="w-full h-full object-cover grayscale" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#222] leading-snug hover:text-[#d1131a] cursor-pointer">These 10 banking stocks have an upside potential of up to 26%</p>
              <p className="text-[11px] text-gray-500 mt-1">AI Suggestion</p>
            </div>
          </li>
          <li className="flex gap-3 items-start border-b border-gray-100 pb-3">
            <div className="w-16 h-12 bg-gray-200 flex-shrink-0 relative">
               <img src="https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=100&q=80" alt="Crypto" className="w-full h-full object-cover grayscale" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#222] leading-snug hover:text-[#d1131a] cursor-pointer">Reduce Crypto Exposure by 15%</p>
              <p className="text-[11px] text-gray-500 mt-1">Portfolio Rebalancing</p>
            </div>
          </li>
        </ul>
      </div>

      <div className="border border-[#e0e0e0] p-1 bg-white mb-6">
         <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&q=80" alt="Ad" className="w-full h-auto" />
      </div>
    </div>
  );
}

function ChevronRightIcon() {
  return <path d="m9 18 6-6-6-6" />;
}
