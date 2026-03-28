# 📐 ET AI Concierge — Architecture Document

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER (Chrome Browser)                         │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │  AuthPage    │  │  MainChat    │  │  InputArea   │  │ RightPanel │  │
│  │  (Login /    │  │  (Messages + │  │  (Text +     │  │ (Portfolio │  │
│  │   Register)  │  │   TTS 🔊)   │  │   Mic 🎙️ +  │  │  + Dynamic │  │
│  │              │  │              │  │   File 📎)   │  │  Suggest.) │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘  │
│         │                 │                 │                │          │
│         └─────────────────┴────────┬────────┴────────────────┘          │
│                                    │                                    │
│                         React App (App.jsx)                             │
│                    Session Restore (localStorage + /me)                 │
│                    SettingsModal (Risk + Life Stage)                    │
└────────────────────────────┬────────────────────────────────────────────┘
                             │  HTTP REST (JSON + FormData)
                             │  Authorization: Bearer <JWT>
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     EXPRESS.JS BACKEND (Port 5000)                      │
│                                                                         │
│  ┌─────────────────┐   ┌─────────────────┐   ┌──────────────────────┐  │
│  │  AUTH MODULE     │   │  CHAT MODULE     │   │  PORTFOLIO MODULE    │  │
│  │                  │   │                  │   │                      │  │
│  │ POST /register   │   │ GET  /chats      │   │ GET  /portfolio      │  │
│  │ POST /login      │   │ POST /chats      │   │ POST /portfolio/add  │  │
│  │ GET  /me         │   │ GET  /chats/:id  │   │ DEL  /portfolio/rem  │  │
│  │ PUT  /profile    │   │ POST /chats/:id/ │   │                      │  │
│  │                  │   │      messages    │   │                      │  │
│  │ JWT + bcrypt     │   │ DEL  /chats/:id  │   │ User.portfolio.inv[] │  │
│  └─────────────────┘   └────────┬─────────┘   └──────────────────────┘  │
│                                 │                                       │
│  ┌──────────────────┐           │ On message → triggers AI pipeline     │
│  │  UPLOAD MODULE   │           ▼                                       │
│  │                  │   ┌───────────────────────────────────────────┐   │
│  │ POST /upload     │   │          AI SERVICE (aiService.js)        │   │
│  │ multer → parse → │   │                                           │   │
│  │ analyzeDocument  │──▶│  Step 1: Tavily Search API                │   │
│  │                  │   │    → query: "{userMsg} Indian markets"     │   │
│  └──────────────────┘   │    → returns: context + source URLs       │   │
│                         │                                           │   │
│                         │  Step 2: HuggingFace LLM                  │   │
│                         │    → model: Qwen/Qwen2.5-7B-Instruct     │   │
│                         │    → system prompt includes:              │   │
│                         │       • user's riskScore + lifeStage      │   │
│                         │       • Tavily real-time context           │   │
│                         │    → max_tokens: 512 (speed optimized)    │   │
│                         │                                           │   │
│                         │  Step 3: Sources Footer (Deterministic)   │   │
│                         │    → always appends Tavily source links   │   │
│                         │    → independent of LLM output            │   │
│                         └───────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  MIDDLEWARE: auth.js (JWT Verification)                          │   │
│  │  Protects all routes except /register, /login, /health          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────────┘
                             │  Mongoose ODM
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        MONGODB (Port 27017)                            │
│                                                                         │
│  ┌──────────────────┐   ┌──────────────────────────────────────────┐   │
│  │  Users Collection │   │  Chats Collection                       │   │
│  │                   │   │                                          │   │
│  │  name, email      │   │  userId (ref → Users)                   │   │
│  │  password (hash)  │   │  title                                  │   │
│  │  lifeStage        │   │  messages: [                            │   │
│  │  riskScore (1-10) │   │    { role, content, timestamp,          │   │
│  │  riskLabel        │   │      attachmentName }                   │   │
│  │  portfolio: {     │   │  ]                                      │   │
│  │    totalValue,    │   │  createdAt                              │   │
│  │    investments[]  │   │                                          │   │
│  │  }                │   │                                          │   │
│  └──────────────────┘   └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Roles

### 1. Frontend Agents (React Components)

| Component | Role | Key Responsibilities |
|-----------|------|---------------------|
| `AuthPage.jsx` | **Auth Agent** | Handles login/register forms, stores JWT in localStorage, passes token to App |
| `App.jsx` | **Orchestrator** | Session restore, routing (Auth vs Main), state management for all child components |
| `Sidebar.jsx` | **Navigation Agent** | Chat list CRUD, settings menu, logout trigger |
| `MainChat.jsx` | **Display Agent** | Renders messages (Markdown), typing indicator, TTS speaker button |
| `InputArea.jsx` | **Input Agent** | Text input, file attachment (PDF/TXT/CSV), STT microphone with live transcript |
| `RightPanel.jsx` | **Portfolio Agent** | Displays investments from MongoDB, add/remove UI, dynamic AI suggestions |
| `SettingsModal.jsx` | **Profile Agent** | Updates risk tolerance + life stage via PUT /api/auth/profile |

### 2. Backend Modules

| Module | Role | Key Responsibilities |
|--------|------|---------------------|
| `authController.js` | **Identity Provider** | JWT generation, password hashing (bcrypt), profile CRUD |
| `chatController.js` | **Conversation Manager** | Chat sessions, message persistence, triggers AI pipeline, auto-titles chats |
| `aiService.js` | **AI Orchestrator** | Two-step pipeline: Tavily → HuggingFace → Sources footer |
| `portfolioController.js` | **Asset Manager** | Investment CRUD on User.portfolio.investments, auto-recalculates totalValue |
| `uploadController.js` | **Document Processor** | multer upload → fileParser → analyzeDocument → save to chat |
| `fileParser.js` | **Text Extractor** | Extracts text from PDF (pdf-parse), TXT, CSV files |
| `auth.js` (middleware) | **Gatekeeper** | Verifies JWT on every protected route |

---

## Communication Flow

### Typical User Query Flow

```
1. User types "Best SIP plans for 2025?" in InputArea
            ↓
2. App.jsx → POST /api/chats/:id/messages { content: "..." }
            ↓
3. chatController receives message, saves user message to MongoDB
            ↓
4. chatController calls aiService.generateFinancialAdvice()
            ↓
5. aiService Step 1: Tavily Search API
   → POST https://api.tavily.com/search
   → query: "Best SIP plans for 2025 Indian financial markets Economic Times"
   → returns: { context (headlines), sources [{title, url}] }
            ↓
6. aiService Step 2: HuggingFace LLM
   → POST https://router.huggingface.co/v1/chat/completions
   → model: Qwen/Qwen2.5-7B-Instruct
   → system prompt includes: user's riskScore, lifeStage, Tavily context
   → max_tokens: 512, temperature: 0.6
   → returns: AI-generated Markdown advice
            ↓
7. aiService Step 3: Append Sources Footer (deterministic)
   → "📰 Sources\n1. [Title](url)\n2. [Title](url)..."
            ↓
8. chatController saves AI message to MongoDB, returns both messages
            ↓
9. App.jsx appends messages to state → MainChat renders with react-markdown
```

### File Upload Flow

```
1. User attaches PDF in InputArea → clicks "ASK AI"
            ↓
2. App.jsx → POST /api/upload (FormData: file + chatId)
            ↓
3. uploadController: multer saves file → fileParser extracts text
            ↓
4. uploadController: calls aiService.analyzeDocument(text, userProfile)
   → Skips Tavily (not needed for document analysis)
   → Uses specialized portfolio analysis system prompt
            ↓
5. Saves both messages to chat, returns to frontend
```

---

## Tool Integrations

| Tool | Purpose | Free Tier Limits |
|------|---------|-----------------|
| **Tavily Search API** | Real-time financial news and market data | 1,000 searches/month |
| **HuggingFace Inference** | LLM text generation (Qwen 2.5 7B) | Free tier with rate limits |
| **MongoDB** | Persistent data storage | Unlimited (self-hosted) |
| **Web Speech API** | Browser-native STT + TTS | Unlimited (runs locally) |
| **pdf-parse** | PDF text extraction | Unlimited (npm package) |

---

## Error Handling Logic

### AI Pipeline Error Handling

```
┌─────────────────────┐
│  Tavily Search Call  │
└──────────┬──────────┘
           │
     ┌─────▼─────┐
     │  Success?  │
     └─────┬─────┘
       Yes │        No → returns { context: "temporarily unavailable", sources: [] }
           │              (pipeline continues — LLM works without context)
     ┌─────▼──────────┐
     │ HuggingFace LLM│
     └──────┬─────────┘
            │
      ┌─────▼─────┐
      │  Success?  │
      └─────┬─────┘
        Yes │        No
            │        ├── 503 (cold start) → "Model is warming up (~90s). Please retry."
            │        ├── 429 (rate limit) → "Rate limit reached. Please wait."
            │        └── Other → returns raw Tavily context as fallback + error message
      ┌─────▼─────────────────┐
      │ Append Sources Footer │  ← Always runs (deterministic, not LLM-dependent)
      └───────────────────────┘
```

### Authentication Error Handling

| Scenario | Response |
|----------|----------|
| Expired JWT | `401 Unauthorized` → frontend clears localStorage → shows AuthPage |
| Invalid credentials | `401 Invalid email or password` → shown in form |
| Duplicate email (register) | `409 User already exists` → shown in form |
| Missing fields | `400 Please provide...` → shown in form |

### File Upload Error Handling

| Scenario | Response |
|----------|----------|
| No file attached | `400 No file uploaded` |
| Unsupported file type | `400 Unsupported file type` |
| File too large (>10MB) | Express body parser rejects |
| PDF parsing fails | Returns error message, does not crash |

---

## Security Measures

1. **Passwords** — hashed with `bcrypt` (12 salt rounds), never stored in plaintext
2. **JWT** — signed with `HS256`, 7-day expiry, stored in `localStorage`
3. **CORS** — restricted to `localhost:5173` and `localhost:3000`
4. **File Uploads** — filtered by extension (`.pdf`, `.txt`, `.csv` only)
5. **API Keys** — stored in `.env`, never committed to Git (`.gitignore`)
