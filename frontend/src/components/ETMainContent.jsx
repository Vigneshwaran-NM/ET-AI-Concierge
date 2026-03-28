import { useState, useRef, useEffect } from 'react';
import { Send, Mic } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function ETMainContent({ messages, isTyping, onSendMessage }) {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 font-sans-et bg-white h-full flex flex-col relative overflow-hidden px-4 md:px-6 pt-4">
      {/* Title Header styled as an article headline */}
      {messages.length === 0 && (
        <div className="mb-6 border-b border-gray-300 pb-4">
          <h1 className="font-serif-et text-[32px] md:text-[42px] font-bold leading-tight text-[#111] mb-2 tracking-tight">
            Cannons and trumpets clash as AI takes over portfolio management
          </h1>
          <p className="text-[16px] text-gray-700 leading-relaxed font-serif-et">
            The Economic Times introduces your personal AI Financial Companion. 
            Ask about your portfolio, markets, or mutual funds to get instant insights.
          </p>
        </div>
      )}

      {/* Main Chat/Article Feed */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto mb-[100px] scroll-smooth no-scrollbar"
      >
        <div className="max-w-3xl space-y-8 pb-8 pt-2">
          {messages.map((msg) => (
            <div key={msg.id} className={cn(
              "flex w-full gap-4",
              msg.isAi ? "flex-col" : "flex-row-reverse"
            )}>
              {msg.isAi ? (
                <div className="w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-[#d1131a] text-white text-[10px] font-bold px-1 py-0.5">ET AI</div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-300 flex-1">{msg.timestamp}</span>
                  </div>
                  <div 
                    className="prose prose-sm font-sans-et text-[15px] leading-relaxed text-[#222]" 
                    dangerouslySetInnerHTML={{ __html: msg.content }} 
                  />
                </div>
              ) : (
                <div className="bg-gray-100 p-4 border-l-4 border-black inline-block mt-4 max-w-[80%]">
                  <p className="font-serif-et text-lg italic text-[#222]">“{msg.content}”</p>
                  <p className="text-xs text-gray-500 font-bold uppercase mt-2 text-right">User Query • {msg.timestamp}</p>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
             <div className="w-full flex-col">
              <div className="flex items-center gap-2 mb-2">
                 <div className="bg-[#d1131a] text-white text-[10px] font-bold px-1 py-0.5">ET AI</div>
                 <span className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-300 flex-1">Processing...</span>
              </div>
              <div className="flex gap-1 py-2">
                <motion.div className="w-2 h-2 rounded-full bg-red-600" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} />
                <motion.div className="w-2 h-2 rounded-full bg-red-600" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} />
                <motion.div className="w-2 h-2 rounded-full bg-red-600" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} />
              </div>
             </div>
          )}
        </div>
      </div>

      {/* Input Area locked to bottom but styled firmly like ET */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-black/20 px-4 md:px-8 py-4 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
           <div className="flex-1 relative border border-black p-1 bg-white focus-within:ring-1 focus-within:ring-black">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your query or analyze portfolio..."
                className="w-full resize-none outline-none font-sans-et text-sm p-2 text-[#222]"
                rows={1}
              />
           </div>
           <button className="bg-white border border-gray-300 p-3 hover:bg-gray-50 text-gray-600">
             <Mic size={20} />
           </button>
           <button 
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="bg-[#d1131a] text-white px-6 py-3 font-bold text-sm hover:bg-red-800 transition-colors disabled:opacity-50"
           >
             ANALYZE
           </button>
        </div>
      </div>
    </div>
  );
}
