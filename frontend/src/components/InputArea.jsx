import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Mic, MicOff, Paperclip, X, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function InputArea({ onSendMessage }) {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [speechSupported] = useState(() =>
    typeof window !== 'undefined' &&
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  );

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  const handleSend = (e) => {
    e?.preventDefault();
    if (message.trim() || selectedFile) {
      onSendMessage(message, selectedFile);
      setMessage('');
      setSelectedFile(null);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;       // Stop after first pause
    recognition.interimResults = true;    // Show live partial results
    recognition.lang = 'en-IN';           // Indian English for financial terms

    setTranscript('');
    setIsListening(true);

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      setTranscript(interim || final);

      if (final) {
        setMessage((prev) => (prev ? `${prev} ${final.trim()}` : final.trim()));
        setTranscript('');
        stopListening();
      }
    };

    recognition.onerror = (e) => {
      console.error('Speech recognition error:', e.error);
      stopListening();
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [speechSupported, stopListening]);

  const toggleMic = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
    e.target.value = null;
  };

  return (
    <>
      <div className="absolute bottom-0 left-0 right-0 p-4 md:px-8 bg-gradient-to-t from-[var(--bg-color)] via-[var(--bg-color)] to-transparent pt-10 pb-6 z-20">
        <div className="max-w-3xl mx-auto w-full">
          <div className={cn(
            "relative bg-[var(--input-bg)] border shadow-lg rounded-sm overflow-hidden transition-colors duration-300",
            isListening ? "border-[var(--primary-red)]" : "border-[var(--border-color)]"
          )}>

            {/* Selected File badge */}
            {selectedFile && (
              <div className="px-3 pt-3 flex items-center gap-2">
                <div className="flex items-center gap-2 bg-[var(--hover-bg)] border border-[var(--border-color)] px-3 py-1.5 rounded-sm w-max max-w-full">
                  <FileText size={14} className="text-[var(--primary-red)] shrink-0" />
                  <span className="text-xs font-medium truncate flex-1 text-[var(--text-color)]">{selectedFile.name}</span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-[var(--primary-red)] transition-colors p-0.5"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-end gap-2 p-2 relative z-10">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.csv,.txt"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-gray-400 hover:text-[var(--text-color)] transition-colors bg-[var(--hover-bg)] hover:bg-[var(--border-color)] rounded-sm"
                title="Attach PDF, TXT, or CSV"
              >
                <Paperclip size={18} />
              </button>

              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? 'Listening...' : 'Message ET AI Concierge...'}
                className="flex-1 max-h-[120px] min-h-[44px] bg-transparent resize-none py-3 outline-none text-[var(--text-color)] placeholder-gray-500 font-sans-et text-[15px] leading-relaxed"
                rows={1}
              />

              <div className="flex items-center gap-1 p-1">
                {/* Mic button */}
                <button
                  onClick={toggleMic}
                  title={speechSupported ? (isListening ? 'Stop recording' : 'Start voice input') : 'Speech not supported in this browser'}
                  className={cn(
                    'p-2.5 rounded-sm transition-all',
                    isListening
                      ? 'text-[var(--primary-red)] bg-red-50 dark:bg-red-900/20 animate-pulse'
                      : 'text-gray-500 hover:bg-[var(--hover-bg)] hover:text-[var(--text-color)]',
                    !speechSupported && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>

                {/* Send button */}
                <button
                  onClick={handleSend}
                  disabled={!message.trim() && !selectedFile}
                  className={cn(
                    "px-4 py-2.5 rounded-sm transition-all font-bold text-[13px] flex items-center justify-center tracking-wide shadow-sm",
                    (message.trim() || selectedFile)
                      ? "bg-[var(--primary-red)] text-white hover:bg-red-800"
                      : "bg-[#e5e5e5] dark:bg-[#333] text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  )}
                >
                  ASK AI <Send size={14} className="ml-1.5" />
                </button>
              </div>
            </div>
          </div>
          <div className="text-center mt-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
            ET AI Concierge can make mistakes. Verify critical financial information.
          </div>
        </div>
      </div>

      {/* Listening Modal */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={stopListening}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--card-bg)] rounded-xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center border border-[var(--border-color)] relative"
            >
              <button
                onClick={stopListening}
                className="absolute top-4 right-4 text-gray-400 hover:text-[var(--text-color)]"
              >
                <X size={20} />
              </button>

              <span className="text-[var(--primary-red)] text-center font-bold mb-6 tracking-widest uppercase text-sm">ET Voice Concierge</span>

              {/* Animated pulse indicator */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-red-100 dark:bg-red-900/30 rounded-full animate-ping opacity-75"></div>
                <div className="w-20 h-20 relative rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center border-4 border-white dark:border-[#222] shadow-inner">
                  <Mic size={36} className="text-[var(--primary-red)]" />
                </div>
              </div>

              <p className="font-serif-et text-xl text-[var(--text-color)] text-center mb-1">I'm Listening...</p>
              <p className="text-sm text-gray-500 min-h-[40px] flex items-center justify-center text-center italic mt-2 px-2">
                {transcript ? `"${transcript}"` : 'Speak your financial question clearly...'}
              </p>

              <button
                onClick={stopListening}
                className="mt-6 text-sm text-gray-500 hover:text-[var(--text-color)] underline underline-offset-4"
              >
                Stop Recording
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
