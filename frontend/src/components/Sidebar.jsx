import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Plus, Settings, User, MoreVertical, Trash2, Edit2, Check, X, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export default function Sidebar({ isOpen, toggleSidebar, chats, activeChat, setActiveChat, onNewChat, onDeleteChat, onRenameChat, userName: userNameProp, onOpenSettings, onLogout }) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);

  // Settings State
  const [userName, setUserName] = useState(userNameProp || 'User');
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  const handleEdit = (id, currentTitle) => {
    setEditingId(id);
    setEditTitle(currentTitle);
    setOpenMenuId(null);
  };

  const submitEdit = (id) => {
    if (editTitle.trim()) {
      onRenameChat(id, editTitle);
    }
    setEditingId(null);
  };

  const handleKeyDown = (e, id) => {
    if (e.key === 'Enter') submitEdit(id);
    if (e.key === 'Escape') setEditingId(null);
  };

  // Close menu if clicked outside handled loosely via onMouseLeave

  return (
    <motion.div
      initial={false}
      animate={{ width: isOpen ? 280 : 0, opacity: isOpen ? 1 : 0 }}
      className="h-full bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] flex flex-col overflow-hidden shrink-0 z-20"
    >
      <div className="p-5 flex items-center gap-3 border-b border-[var(--border-color)]">
        <div className="bg-[var(--primary-red)] text-white text-[18px] font-bold px-1.5 py-0.5 leading-none tracking-tighter shadow-sm">ET</div>
        <span className="font-serif-et font-bold text-[var(--text-color)] text-[18px] tracking-tight whitespace-nowrap">AI Concierge</span>
      </div>

      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-[var(--primary-red)] text-white py-2.5 rounded-sm hover:bg-red-800 transition-colors font-bold text-sm shadow-sm"
        >
          <Plus size={16} />
          New Consultation
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 relative">
        <div className="text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-wider">Recent Sessions</div>

        {chats.length === 0 && (
          <div className="text-sm text-gray-500 italic text-center mt-6">No recent sessions</div>
        )}

        <div className="space-y-1">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={cn(
                "group relative w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-sm transition-colors font-semibold border-l-2",
                activeChat === chat.id
                  ? "bg-[var(--hover-bg)] text-[var(--primary-red)] border-[var(--primary-red)]"
                  : "text-[var(--text-color)] hover:bg-[var(--hover-bg)] border-transparent"
              )}
              onMouseLeave={() => setOpenMenuId(null)}
            >
              {editingId === chat.id ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    autoFocus
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, chat.id)}
                    className="flex-1 bg-[var(--input-bg)] text-[var(--text-color)] border border-[var(--border-color)] rounded px-1 text-xs outline-none"
                  />
                  <button onClick={() => submitEdit(chat.id)} className="text-green-600"><Check size={14} /></button>
                  <button onClick={() => setEditingId(null)} className="text-gray-500"><X size={14} /></button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setActiveChat(chat.id)}
                    className="flex items-center gap-3 w-full overflow-hidden text-left"
                  >
                    <MessageSquare size={16} className="shrink-0 opacity-70" />
                    <span className="truncate flex-1">{chat.title}</span>
                  </button>

                  <div className="shrink-0 relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === chat.id ? null : chat.id);
                      }}
                      className={cn(
                        "p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-[var(--text-color)]",
                        openMenuId === chat.id && "opacity-100 bg-[var(--border-color)]"
                      )}
                    >
                      <MoreVertical size={14} />
                    </button>

                    {openMenuId === chat.id && (
                      <div className="absolute right-0 mt-1 w-28 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-sm shadow-xl z-50 flex flex-col py-1">
                        <button
                          onClick={() => handleEdit(chat.id, chat.title)}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[var(--hover-bg)] text-[var(--text-color)] w-full text-left"
                        >
                          <Edit2 size={12} /> Rename
                        </button>
                        <button
                          onClick={() => {
                            onDeleteChat(chat.id);
                            setOpenMenuId(null);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-red-50 text-[var(--primary-red)] dark:hover:bg-red-900/20 w-full text-left"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        className="p-4 border-t border-[var(--border-color)] bg-[var(--sidebar-bg)] mt-auto shrink-0 relative"
        onMouseLeave={() => setIsSettingsMenuOpen(false)}
      >

        {isSettingsMenuOpen && (
          <div className="absolute bottom-full left-4 w-[calc(100%-32px)] pb-2 z-50">
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl rounded-sm p-1">
              <button
                onClick={() => { setIsEditingName(true); setIsSettingsMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm text-[var(--text-color)] font-semibold hover:bg-[var(--hover-bg)] rounded-sm flex items-center gap-3 transition-colors"
              >
                <User size={15} /> Edit Profile
              </button>
              <button
                onClick={() => { onOpenSettings?.(); setIsSettingsMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm text-[var(--text-color)] font-semibold hover:bg-[var(--hover-bg)] rounded-sm flex items-center gap-3 transition-colors"
              >
                <Settings size={15} /> Preferences
              </button>
              <div className="w-full h-px bg-[var(--border-color)] my-1"></div>
              <button
                onClick={() => { onLogout?.(); setIsSettingsMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm text-[var(--primary-red)] font-bold hover:bg-[var(--hover-bg)] rounded-sm flex items-center gap-3 transition-colors"
              >
                <LogOut size={15} /> Log Out
              </button>
            </div>
          </div>
        )}

        {isEditingName ? (
          <div className="flex items-center gap-2 p-2 bg-[var(--hover-bg)] rounded-sm border border-[var(--border-color)]">
            <input
              autoFocus
              value={userName}
              onChange={e => setUserName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') setIsEditingName(false); }}
              className="w-full px-2 py-1 text-sm bg-[var(--input-bg)] text-[var(--text-color)] border border-[var(--border-color)] rounded outline-none font-bold"
            />
            <button onClick={() => setIsEditingName(false)} className="text-green-600 hover:text-green-700 bg-white dark:bg-black p-1 rounded-sm border border-[var(--border-color)]"><Check size={16} /></button>
          </div>
        ) : (
          <div
            onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
            className="flex items-center gap-3 group cursor-pointer hover:bg-[var(--hover-bg)] p-2 rounded-sm transition-colors border border-transparent hover:border-[var(--border-color)]"
          >
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-[#333] flex items-center justify-center flex-shrink-0 border border-gray-400 dark:border-gray-500">
              <User size={18} className="text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-[var(--text-color)] truncate">{userName}</div>
              <div className="text-[11px] font-semibold text-[var(--primary-red)] truncate">ETPrime Member</div>
            </div>
            <Settings size={18} className="text-gray-400 group-hover:text-[var(--text-color)] transition-colors" />
          </div>
        )}

      </div>
    </motion.div>
  );
}
