import { Search, Menu } from 'lucide-react';

export default function ETHeader() {
  return (
    <header className="w-full bg-white border-b border-[var(--border-color)]">
      {/* Top Black Bar / Benchmarks Bar */}
      <div className="w-full border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-[11px] text-gray-600 h-10">
          <div className="flex items-center gap-4">
            <span className="font-bold">BENCHMARKS <span className="text-red-600">LIVE</span></span>
            <span className="font-semibold text-black">Sensex</span>
            <span className="text-green-600 font-bold">75,664.20 ↑1595.7</span>
          </div>
          
          <div className="flex-1 max-w-md mx-8 relative">
            <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
              <Search size={14} className="text-red-500" />
            </div>
            <input 
              type="text" 
              placeholder="Search Stock Quotes, News, Mutual Funds and more" 
              className="w-full pl-8 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs outline-none focus:border-gray-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="border border-gray-300 px-2 py-0.5 rounded text-gray-700 hover:bg-gray-50">My Watchlist</button>
            <button className="border border-gray-300 px-2 py-0.5 rounded text-gray-700 hover:bg-gray-50">Subscribe</button>
            <button className="font-semibold hover:text-red-600">Sign In</button>
          </div>
        </div>
      </div>

      {/* Main Logo Area */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col items-center relative">
        <div className="absolute right-4 top-4 text-xs font-semibold text-red-600 hover:underline cursor-pointer">
          Avail Free Trial of ETPrime
        </div>
        <div className="flex items-center gap-2 mb-2">
          {/* Mocking the ET LOGO */}
          <div className="bg-[#d1131a] text-white text-[28px] font-bold px-2 py-0.5 leading-none tracking-tighter">ET</div>
          <h1 className="font-serif-et text-[42px] font-black tracking-tight text-[#222]">THE ECONOMIC TIMES</h1>
        </div>
        <div className="text-[11px] text-gray-500 font-sans-et flex gap-2">
          <span>English Edition ▾</span>
          <span>|</span>
          <span>25 March, 2026, 11:52 AM IST</span>
          <span>|</span>
          <span className="font-bold text-gray-800">Today's ePaper</span>
        </div>
      </div>

      {/* Primary Navigation */}
      <div className="w-full border-b border-t border-gray-200 bg-[#fdeeee]">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-10">
          <button className="p-2 mr-2 hover:bg-red-100"><Menu size={18} className="text-[#222]" /></button>
          <nav className="flex items-center text-[13px] font-bold text-[#222] h-full overflow-x-auto no-scrollbar">
            <a href="#" className="flex items-center h-full px-3 text-[#d1131a] border-b-2 border-[#d1131a]">Home</a>
            <a href="#" className="flex items-center h-full px-3 hover:text-[#d1131a] whitespace-nowrap"><span className="bg-[#d1131a] text-white text-[10px] px-1 mr-1 rounded-sm">P</span>ETPrime</a>
            <a href="#" className="flex items-center h-full px-3 hover:text-[#d1131a]">Markets</a>
            <a href="#" className="flex items-center h-full px-3 hover:text-[#d1131a]">Masterclass</a>
            <a href="#" className="flex items-center h-full px-3 hover:text-[#d1131a]">News</a>
            <a href="#" className="flex items-center h-full px-3 hover:text-[#d1131a]">Industry</a>
            <a href="#" className="flex items-center h-full px-3 hover:text-[#d1131a]">Wealth</a>
            <a href="#" className="flex items-center h-full px-3 hover:text-[#d1131a]">Tech</a>
            <a href="#" className="flex items-center h-full px-3 hover:text-[#d1131a]">AI</a>
            <a href="#" className="flex items-center h-full px-3 hover:text-[#d1131a]">Careers</a>
          </nav>
        </div>
      </div>

      {/* Secondary Sub-nav */}
      <div className="w-full border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-8 gap-4 text-[12px] text-gray-700 overflow-x-auto no-scrollbar whitespace-nowrap">
          <span className="hover:text-red-600 cursor-pointer">News Live!</span>
          <span className="hover:text-red-600 cursor-pointer">Live Stream!</span>
          <span className="font-bold text-[#d1131a] hover:text-red-700 cursor-pointer">Assembly Elections</span>
          <span className="hover:text-red-600 cursor-pointer">ET MSME Awards</span>
          <span className="hover:text-red-600 cursor-pointer">Economy Dashboard</span>
          <span className="hover:text-red-600 cursor-pointer">AI Hackathon</span>
        </div>
      </div>
    </header>
  );
}
