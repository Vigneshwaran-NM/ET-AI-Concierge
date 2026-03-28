import { useRef, useEffect, useState, useCallback } from 'react';
import { AlignLeft, PanelRight, Moon, Sun, Volume2, VolumeX, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Strip Markdown syntax so TTS reads clean text (no asterisks, hashes, backticks)
const cleanMarkdownForSpeech = (text) => {
  return text
    .replace(/#{1,6}\s+/g, '')         // headings
    .replace(/\*\*(.+?)\*\*/g, '$1')   // bold
    .replace(/\*(.+?)\*/g, '$1')       // italic
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // inline code / code blocks
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')// links → keep label
    .replace(/^[-*]\s+/gm, '')         // bullet points
    .replace(/^\d+\.\s+/gm, '')        // numbered lists
    .replace(/\n{2,}/g, '. ')          // double newlines → pause
    .replace(/\n/g, ' ')               // single newlines → space
    .trim();
};

export default function MainChat({ messages, isTyping, toggleSidebar, toggleRightPanel, isDark, toggleTheme }) {
  const scrollRef = useRef(null);
  const [speakingId, setSpeakingId] = useState(null); // id of the message being spoken

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Stop TTS when component unmounts
  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  const handleSpeak = useCallback((msg) => {
    if (!window.speechSynthesis) return;

    // If already speaking this message, stop it
    if (speakingId === msg.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    // Cancel any existing speech first
    window.speechSynthesis.cancel();

    const cleanText = cleanMarkdownForSpeech(msg.content);
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft'))
    ) || voices.find(v => v.lang.startsWith('en')) || null;

    if (preferred) utterance.voice = preferred;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(msg.id);
    window.speechSynthesis.speak(utterance);
  }, [speakingId]);

  const etLinks = [
    { label: 'Market Insights', url: 'https://economictimes.indiatimes.com/markets' },
    { label: 'Mutual Funds Focus', url: 'https://economictimes.indiatimes.com/mf' },
    { label: 'Latest ET News', url: 'https://economictimes.indiatimes.com/news' },
    { label: 'Wealth Edition', url: 'https://economictimes.indiatimes.com/wealth' }
  ];

  return (
    <div className="flex-1 flex flex-col h-full relative font-sans-et bg-[var(--bg-color)] transition-colors duration-300">
      {/* Top Bar */}
      <div className="h-16 border-b border-[var(--border-color)] flex items-center justify-between px-6 bg-[var(--card-bg)] shrink-0 shadow-sm z-10 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="p-2 text-gray-500 hover:bg-[var(--hover-bg)] rounded-sm transition-colors">
            <AlignLeft size={20} />
          </button>
          <div>
            <h1 className="font-serif-et font-bold text-[20px] text-[var(--text-color)]">Market Insights</h1>
            <p className="text-[11px] font-sans-et text-gray-500 font-semibold uppercase tracking-wider">Powered by ET AI</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 rounded-sm text-gray-400 hover:text-[var(--text-color)] hover:bg-[var(--hover-bg)] transition-colors" title="Toggle Theme">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="w-px h-6 bg-[var(--border-color)] mx-1"></div>
          <button onClick={toggleRightPanel} className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-[var(--primary-red)] border border-[var(--primary-red)] rounded-sm hover:bg-[var(--hover-bg)] transition-colors">
            <PanelRight size={16} />
            <span className="hidden sm:inline-block">My Portfolio</span>
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth w-full px-4 md:px-8 pb-[140px] pt-8">
        <div className="max-w-3xl mx-auto space-y-8">

          {messages.length === 0 && !isTyping && (
            <div className="flex flex-col items-center justify-center text-center mt-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="bg-[var(--primary-red)] text-white text-[32px] font-bold px-3 py-1 leading-none tracking-tighter mb-4 shadow-md">ET</div>
              <h2 className="font-serif-et text-3xl font-bold text-[var(--text-color)] mb-3">Hi, I'm your AI Financial Concierge</h2>
              <p className="text-gray-500 max-w-lg leading-relaxed text-[15px]">
                I can help you analyze market trends, review your portfolio, and suggest actionable investment ideas based on The Economic Times data.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg mt-10">
                {etLinks.map((link, idx) => (
                  <button
                    key={idx}
                    onClick={() => window.open(link.url, '_blank')}
                    className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-sm text-[13px] font-semibold text-left text-[var(--text-color)] hover:border-[var(--primary-red)] hover:text-[var(--primary-red)] transition-all flex items-center justify-between group shadow-sm"
                  >
                    <span>{link.label}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex w-full", msg.isAi ? "justify-start" : "justify-end")}
              >
                <div className={cn(
                  "max-w-[85%] md:max-w-[75%] p-5 rounded-sm shadow-sm transition-colors duration-300",
                  msg.isAi
                    ? "bg-[var(--card-bg)] border border-[var(--border-color)]"
                    : "bg-[var(--msg-user-bg)] border border-[var(--msg-user-border)] text-[var(--text-color)]"
                )}>
                  {msg.isAi && (
                    <div className="flex items-center justify-between mb-3 border-b border-[var(--border-color)] pb-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-[var(--primary-red)] text-white text-[10px] font-bold px-1 py-0.5 leading-none">ET AI</div>
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{msg.timestamp}</span>
                      </div>
                      {/* TTS Speaker Button */}
                      <button
                        onClick={() => handleSpeak(msg)}
                        title={speakingId === msg.id ? 'Stop reading' : 'Read aloud'}
                        className={cn(
                          'transition-colors p-1 rounded-sm',
                          speakingId === msg.id
                            ? 'text-[var(--primary-red)] animate-pulse'
                            : 'text-gray-400 hover:text-[var(--primary-red)]'
                        )}
                      >
                        {speakingId === msg.id ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                    </div>
                  )}

                  {/* File attachment badge */}
                  {msg.attachmentName && (
                    <div className="flex items-center gap-2 mb-3 bg-[var(--bg-color)] p-2 rounded border border-[var(--border-color)] w-max max-w-full">
                      <FileText size={16} className="text-[var(--primary-red)] shrink-0" />
                      <span className="text-sm truncate text-[var(--text-color)] font-medium">{msg.attachmentName}</span>
                    </div>
                  )}

                  {msg.isAi ? (
                    <div className="text-[15px] leading-relaxed font-sans-et text-[var(--text-color)] prose prose-sm max-w-none dark:prose-invert prose-headings:text-[var(--text-color)] prose-strong:text-[var(--text-color)] prose-p:text-[var(--text-color)] prose-li:text-[var(--text-color)] prose-a:text-[var(--primary-red)]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-[15px] leading-relaxed font-sans-et font-medium text-[var(--text-color)]">{msg.content}</div>
                  )}

                  {!msg.isAi && (
                    <div className="text-[10px] mt-2 text-right opacity-60 font-bold uppercase">{msg.timestamp}</div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex w-full justify-start">
              <div className="bg-[var(--card-bg)] max-w-fit rounded-sm p-4 border border-[var(--border-color)] shadow-sm flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-[var(--primary-red)] text-white text-[10px] font-bold px-1 py-0.5 leading-none">ET AI</div>
                </div>
                <div className="flex items-center gap-1.5 h-4 px-2">
                  <motion.div className="w-2 h-2 rounded-full bg-[var(--primary-red)]" animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} />
                  <motion.div className="w-2 h-2 rounded-full bg-[var(--primary-red)]" animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
                  <motion.div className="w-2 h-2 rounded-full bg-[var(--primary-red)]" animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
