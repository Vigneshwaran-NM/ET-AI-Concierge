import { MessageSquare, Plus, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ETSidebarLeft({ chats, activeChat, setActiveChat }) {
  return (
    <div className="w-full font-sans-et bg-white h-full border-r border-[#e0e0e0] pr-4 flex flex-col pt-4">
      <div className="border-b-2 border-black mb-3 pb-1 flex justify-between items-center">
        <h2 className="text-[16px] font-bold text-[#222] uppercase">Recent Sessions</h2>
      </div>

      <button className="mb-4 w-full flex items-center justify-center gap-2 bg-[#d1131a] text-white py-2 rounded-sm hover:bg-red-700 transition-colors text-sm font-bold shadow-sm">
        <Plus size={16} />
        New AI Consultation
      </button>

      <div className="flex-1 overflow-y-auto pr-1">
        <ul className="space-y-0 text-[13px] font-semibold text-[#222]">
          {chats.map(chat => (
            <li key={chat.id}>
              <button
                onClick={() => setActiveChat(chat.id)}
                className={cn(
                  "w-full text-left py-2.5 border-b border-gray-100 flex items-start gap-2 hover:text-[#d1131a] transition-colors",
                  activeChat === chat.id ? "text-[#d1131a]" : "text-[#444]"
                )}
              >
                <div className="mt-0.5">
                  <div className={cn("w-1.5 h-1.5 rounded-full", activeChat === chat.id ? "bg-[#d1131a]" : "bg-gray-300")} />
                </div>
                <span className="leading-tight">{chat.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Mock ad / promo */}
      <div className="mt-6 border border-gray-200 p-3 bg-gray-50 mb-4">
        <p className="text-[10px] text-gray-500 text-center uppercase mb-1">Advertisement</p>
        <div className="bg-blue-900 text-white p-3 text-center rounded-sm">
          <p className="font-bold text-sm mb-1">ET Wealth Edition</p>
          <p className="text-xs mb-2">Unlock premium financial tools.</p>
          <button className="text-xs bg-white text-blue-900 px-3 py-1 font-bold rounded hover:bg-gray-100">Know More</button>
        </div>
      </div>
    </div>
  );
}
