import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import MainChat from './components/MainChat';
import InputArea from './components/InputArea';
import RightPanel from './components/RightPanel';
import AuthPage from './components/AuthPage';
import SettingsModal from './components/SettingsModal';

const API_BASE = 'http://localhost:5000/api';

// ─── Helper: make authenticated API calls ────────────────────
const apiFetch = async (path, options = {}, token) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API error');
  return data;
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Auth state — starts null until session is validated
  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // show spinner while checking token

  // Chat state
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChatMessages, setActiveChatMessages] = useState([]);

  // Dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // ─── Session Restore: check localStorage for a saved token ──
  useEffect(() => {
    const restoreSession = async () => {
      const saved = localStorage.getItem('et_token');
      if (!saved) {
        setAuthLoading(false);
        return;
      }
      try {
        const data = await apiFetch('/auth/me', {}, saved);
        setToken(saved);
        setCurrentUser(data);
      } catch {
        // Token is invalid/expired — clear it
        localStorage.removeItem('et_token');
      } finally {
        setAuthLoading(false);
      }
    };
    restoreSession();
  }, []);

  // ─── Auth handlers ───────────────────────────────────────────
  const handleLoginSuccess = (newToken, user) => {
    setToken(newToken);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('et_token');
    setToken(null);
    setCurrentUser(null);
    setChats([]);
    setActiveChatId(null);
    setActiveChatMessages([]);
  };

  // ─── Load chat sessions once we have a token ────────────────
  useEffect(() => {
    if (!token) return;
    const loadChats = async () => {
      try {
        const data = await apiFetch('/chats', {}, token);
        setChats(data);
        if (data.length > 0) setActiveChatId(data[0].id);
      } catch (err) {
        console.error('Failed to load chats:', err.message);
      }
    };
    loadChats();
  }, [token]);

  // ─── Load messages when active chat changes ─────────────────
  useEffect(() => {
    if (!token || !activeChatId) {
      setActiveChatMessages([]);
      return;
    }
    const loadMessages = async () => {
      try {
        const chat = await apiFetch(`/chats/${activeChatId}`, {}, token);
        setActiveChatMessages(chat.messages);
      } catch (err) {
        console.error('Failed to load messages:', err.message);
        setActiveChatMessages([]);
      }
    };
    loadMessages();
  }, [token, activeChatId]);

  // ─── Handlers ───────────────────────────────────────────────

  const handleNewChat = useCallback(async () => {
    if (!token) return;
    try {
      const newChat = await apiFetch('/chats', { method: 'POST' }, token);
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat.id);
    } catch (err) {
      console.error('Failed to create chat:', err.message);
    }
  }, [token]);

  const handleRenameChat = useCallback(async (id, newTitle) => {
    if (!token) return;
    try {
      await apiFetch(`/chats/${id}/title`, { method: 'PUT', body: JSON.stringify({ title: newTitle }) }, token);
      setChats((prev) => prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c)));
    } catch (err) {
      console.error('Failed to rename chat:', err.message);
    }
  }, [token]);

  const handleDeleteChat = useCallback(async (id) => {
    if (!token) return;
    try {
      await apiFetch(`/chats/${id}`, { method: 'DELETE' }, token);
      setChats((prev) => {
        const remaining = prev.filter((c) => c.id !== id);
        if (activeChatId === id) setActiveChatId(remaining.length > 0 ? remaining[0].id : null);
        return remaining;
      });
    } catch (err) {
      console.error('Failed to delete chat:', err.message);
    }
  }, [token, activeChatId]);

  const handleSendMessage = useCallback(async (content, attachment) => {
    if (!token) return;

    let chatId = activeChatId;
    if (!chatId) {
      try {
        const newChat = await apiFetch('/chats', { method: 'POST' }, token);
        setChats((prev) => [newChat, ...prev]);
        setActiveChatId(newChat.id);
        chatId = newChat.id;
      } catch (err) {
        console.error('Failed to create chat for message:', err.message);
        return;
      }
    }

    setIsTyping(true);

    try {
      if (attachment) {
        const formData = new FormData();
        formData.append('file', attachment);
        formData.append('chatId', chatId);
        if (content) formData.append('content', content);

        const res = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);

        if (result.title) {
          setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, title: result.title } : c)));
        }
        setActiveChatMessages((prev) => [...prev, result.userMessage, result.aiMessage]);
      } else {
        const result = await apiFetch(
          `/chats/${chatId}/messages`,
          { method: 'POST', body: JSON.stringify({ content }) },
          token
        );
        if (result.title) {
          setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, title: result.title } : c)));
        }
        setActiveChatMessages((prev) => [...prev, result.userMessage, result.aiMessage]);
      }

      if (!isRightPanelOpen) setIsRightPanelOpen(true);
    } catch (err) {
      console.error('Failed to send message:', err.message);
    } finally {
      setIsTyping(false);
    }
  }, [token, activeChatId, isRightPanelOpen]);

  // ─── Render ──────────────────────────────────────────────────

  // While checking token validity, show a minimal loader
  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[var(--bg-color)]">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--primary-red)] text-white text-[22px] font-bold px-2 py-1 leading-none tracking-tighter animate-pulse">ET</div>
          <span className="text-gray-500 font-semibold text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  // Not logged in — show Auth page
  if (!token) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Logged in — show main app
  return (
    <div className="h-screen w-full flex bg-[var(--bg-color)] overflow-hidden font-sans-et">
      {/* 1. Left Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        chats={chats}
        activeChat={activeChatId}
        setActiveChat={setActiveChatId}
        onNewChat={handleNewChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        userName={currentUser?.name || 'User'}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
      />

      {/* 2. Center Content */}
      <div className="flex-1 flex flex-col relative min-w-0 shadow-[0_0_15px_rgba(0,0,0,0.02)] z-10 transition-colors duration-300">
        <MainChat
          messages={activeChatMessages}
          isTyping={isTyping}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          toggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)}
          isDark={isDark}
          toggleTheme={() => setIsDark(!isDark)}
        />
        <InputArea onSendMessage={handleSendMessage} />
      </div>

      {/* 3. Right Panel */}
      <RightPanel
        isOpen={isRightPanelOpen}
        closePanel={() => setIsRightPanelOpen(false)}
        token={token}
        userProfile={currentUser}
      />

      {/* 4. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
        token={token}
        onProfileUpdated={(updatedUser) => setCurrentUser(updatedUser)}
      />
    </div>
  );
}

export default App;
