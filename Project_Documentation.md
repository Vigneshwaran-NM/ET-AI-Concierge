# 📄 ET AI Concierge — Project Documentation

**Straw Hat Crew**

**Date:** March 29, 2025  
**Repository:** [github.com/Vigneshwaran-NM/ET-AI-Concierge](https://github.com/Vigneshwaran-NM/ET-AI-Concierge)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Solution Overview](#3-solution-overview)
4. [Technology Stack](#4-technology-stack)
5. [System Architecture](#5-system-architecture)
6. [Database Design](#6-database-design)
7. [AI Pipeline](#7-ai-pipeline)
8. [Backend API Reference](#8-backend-api-reference)
9. [Frontend Component Architecture](#9-frontend-component-architecture)
10. [Feature Documentation](#10-feature-documentation)
11. [Security Implementation](#11-security-implementation)
12. [Error Handling Strategy](#12-error-handling-strategy)
13. [Performance Optimizations](#13-performance-optimizations)
14. [Development Phases](#14-development-phases)
15. [Deployment Guide](#15-deployment-guide)
16. [Future Scope](#16-future-scope)

---

## 1. Executive Summary

**ET AI Concierge** is a full-stack AI-powered financial advisory platform built under The Economic Times brand identity. It combines **real-time market data** (via Tavily Search API) with a **large language model** (Qwen 2.5-7B via HuggingFace) to deliver personalised investment advice that adapts to each user's risk tolerance and life stage.

The platform includes persistent chat sessions, a portfolio tracker, document analysis (PDF/TXT/CSV), voice input/output, and a polished authentication system — all built from scratch in 6 development phases.

**Key Metrics:**
- Average AI response time: **1–3 seconds**
- API cost per query: **₹0.15** (vs ₹200–500 for human advisors)
- Tech stack: **React 19 + Node.js + MongoDB + Tavily + HuggingFace**

---

## 2. Problem Statement

Retail investors in India face several challenges:

| Challenge | Impact |
|-----------|--------|
| Financial advisory is expensive | SEBI-registered advisors charge ₹3,000–7,500/month |
| Generic advice doesn't account for risk profiles | A student and a pre-retiree receive the same market article |
| Market news is fragmented | Users must visit 5–10 sources to form a complete view |
| Portfolio reviews require manual effort | Spreading information across PDFs, broker apps, and spreadsheets |
| No voice accessibility | Visually impaired or hands-busy users excluded from text-only platforms |

**ET AI Concierge solves all five** by providing a single conversational interface that combines real-time data with profile-aware AI.

---

## 3. Solution Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    ET AI CONCIERGE PLATFORM                      │
│                                                                   │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────────┐  │
│  │  AUTH    │  │  CHAT    │  │ PORTFOLIO│  │   AI ENGINE     │  │
│  │ Login/  │  │ Sessions │  │ Tracker  │  │ Tavily Search   │  │
│  │ Register│  │ + History│  │ + Upload │  │ + HuggingFace   │  │
│  └────┬────┘  └────┬─────┘  └────┬─────┘  │ + TTS/STT       │  │
│       └─────────────┴────────────┴─────────┴─────────────────┘  │
│                              │                                    │
│                        MongoDB (Persistent)                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Technology Stack

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | Runtime environment |
| Express.js | 4.x | HTTP server and routing |
| Mongoose | 8.x | MongoDB ODM (Object-Document Mapping) |
| bcryptjs | 2.x | Password hashing (12 salt rounds) |
| jsonwebtoken | 9.x | JWT token generation and verification |
| multer | 1.x | Multipart file upload handling |
| pdf-parse | 1.x | PDF text extraction |
| axios | 1.x | HTTP client for Tavily and HuggingFace API calls |
| dotenv | 17.x | Environment variable management |
| cors | 2.x | Cross-Origin Resource Sharing |

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.x | UI component framework |
| Vite | 8.x | Build tool and dev server |
| Framer Motion | 12.x | Animations and transitions |
| Lucide React | 0.x | Icon library |
| react-markdown | 9.x | Markdown rendering for AI responses |
| remark-gfm | 4.x | GitHub Flavored Markdown support |
| Web Speech API | Native | Speech-to-Text and Text-to-Speech |

### External APIs

| API | Provider | Purpose | Free Tier |
|-----|----------|---------|-----------|
| Tavily Search | tavily.com | Real-time financial news and web search | 1,000 searches/month |
| HuggingFace Inference | huggingface.co | LLM text generation (Qwen 2.5-7B-Instruct) | Rate-limited free tier |

### Database

| Technology | Version | Purpose |
|-----------|---------|---------|
| MongoDB | 7.x | Primary data store for users, chats, portfolios |

---

## 5. System Architecture

### Request Flow

```
┌──────────┐     HTTP/REST      ┌──────────────┐    Mongoose     ┌─────────┐
│  React   │ ──────────────────▶│  Express.js  │ ──────────────▶│ MongoDB │
│ Frontend │ ◀──────────────────│  Backend     │ ◀──────────────│         │
└──────────┘   JSON Responses   └──────┬───────┘                └─────────┘
                                       │
                            ┌──────────┴──────────┐
                            │    AI Service        │
                            │                      │
                     ┌──────▼──────┐    ┌──────────▼──────────┐
                     │   Tavily    │    │    HuggingFace      │
                     │ Search API  │    │    Qwen 2.5-7B      │
                     └─────────────┘    └─────────────────────┘
```

### Layer Responsibilities

| Layer | Responsibility |
|-------|---------------|
| **Presentation** | React components (AuthPage, MainChat, InputArea, RightPanel, Sidebar, SettingsModal) |
| **API Gateway** | Express routes with JWT middleware authentication |
| **Business Logic** | Controllers (auth, chat, portfolio, upload) and AI service |
| **Data Access** | Mongoose models (User, Chat) with schema validation |
| **External Services** | Tavily (real-time search) and HuggingFace (LLM inference) |

---

## 6. Database Design

### 6.1 User Schema (`models/User.js`)

```javascript
{
  name:       String (required, trimmed),
  email:      String (required, unique, lowercase, regex-validated),
  password:   String (required, min 6 chars, bcrypt-hashed, select: false),
  lifeStage:  Enum ['Student', 'Early Career', 'Mid Career', 'Pre-Retirement', 'Retired'],
  riskScore:  Number (1–10, default: 5),
  riskLabel:  Enum ['Conservative', 'Moderate', 'Aggressive'],
  portfolio: {
    equity:      Number (default: 60),
    mutualFunds: Number (default: 25),
    crypto:      Number (default: 10),
    cash:        Number (default: 5),
    totalValue:  Number (default: 0),
    investments: [{
      name:    String (required),
      type:    Enum ['Equity', 'Mutual Fund', 'Gold', 'FD', 'Crypto', 'Other'],
      value:   Number (required),
      units:   Number (nullable),
      symbol:  String (nullable),
      addedAt: Date (default: now)
    }]
  },
  createdAt: Date
}
```

**Security features:**
- Password is hashed using `bcrypt` with a salt factor of 10 in a `pre('save')` hook
- Password field has `select: false` — never returned in queries unless explicitly requested
- Email uses regex validation (`/^\S+@\S+\.\S+$/`)

### 6.2 Chat Schema (`models/Chat.js`)

```javascript
{
  user:     ObjectId (ref: 'User', required),
  title:    String (default: 'New Consultation', trimmed),
  messages: [{
    role:           Enum ['user', 'model'] (required),
    content:        String (required),
    attachmentName: String (nullable),
    timestamp:      Date (default: now)
  }],
  createdAt: Date (auto — via timestamps: true),
  updatedAt: Date (auto — via timestamps: true)
}
```

**Design decisions:**
- Messages are embedded as a subdocument array (not a separate collection) — this keeps reads atomic and fast since chat messages are always loaded together
- `updatedAt` is auto-managed by Mongoose `timestamps: true` and used for sorting chats by recency
- Chat titles auto-rename from "New Consultation" to the first 40 characters of the user's first message

### 6.3 Entity Relationship

```
┌────────────┐      1:N       ┌────────────┐
│    User     │──────────────▶│    Chat     │
│             │               │             │
│ _id         │               │ user (FK)   │
│ name        │               │ title       │
│ email       │               │ messages[]  │
│ password    │               │ createdAt   │
│ lifeStage   │               │ updatedAt   │
│ riskScore   │               └────────────┘
│ riskLabel   │
│ portfolio{} │  ◀── investments[] embedded
└────────────┘
```

---

## 7. AI Pipeline

### 7.1 Architecture

The AI service (`services/aiService.js`) uses a **two-step pipeline** to generate every response:

```
User Question
     ↓
Step 1: Tavily Search API
  → POST https://api.tavily.com/search
  → Query: "{user_query} Indian financial markets Economic Times"
  → Returns: answer summary + 6 article headlines + source URLs
     ↓
Step 2: HuggingFace LLM (Qwen 2.5-7B-Instruct)
  → POST https://router.huggingface.co/v1/chat/completions
  → System prompt includes:
     • User's riskScore and lifeStage
     • Tavily real-time context (headlines only — no URLs to save tokens)
  → Parameters: max_tokens=512, temperature=0.6, top_p=0.85
  → Returns: Markdown-formatted financial advice
     ↓
Step 3: Deterministic Sources Footer
  → Always appends Tavily source links as clickable Markdown
  → Independent of LLM output (guaranteed to appear)
     ↓
Final Response = AI Text + "📰 Sources" section
```

### 7.2 System Prompt Engineering

The system prompt is dynamically constructed per request:

```
You are "ET AI Concierge", a knowledgeable financial advisor for The Economic Times.

USER PROFILE:
- Life Stage: {user.lifeStage}
- Risk Appetite: {user.riskLabel} ({user.riskScore}/10)

REAL-TIME DATA (Tavily Search):
{tavily_context}

INSTRUCTIONS:
- Use the real-time data above to answer the user's question.
- Format your response in clear Markdown: headings, bullet points, bold key terms.
- Provide actionable advice tailored to the user's risk profile.
- Be concise. Do NOT include source URLs — they will be appended automatically.
- End with: "This is AI-generated advice. Verify with a SEBI-registered advisor."
```

### 7.3 Document Analysis Pipeline

For uploaded files (PDF/TXT/CSV), a separate pipeline is used:

```
File Upload
     ↓
multer saves to /uploads/
     ↓
fileParser.js extracts text (pdf-parse for PDFs, fs.readFile for TXT/CSV)
     ↓
Text truncated to first 2,000 characters
     ↓
analyzeDocument() → HuggingFace LLM with a portfolio-analysis-specific prompt
     ↓
Returns: asset allocation breakdown, risk exposure analysis, 3 recommendations
```

### 7.4 Model Selection Rationale

| Model | Response Time | Quality | Chosen? |
|-------|-------------|---------|---------|
| Qwen 2.5-72B-Instruct | 40–50 seconds | Excellent | ❌ Too slow for real-time UX |
| Qwen 2.5-7B-Instruct | 1–3 seconds | Good (sufficient for financial Q&A) | ✅ **Selected** |
| Phi-3.5-mini | N/A | N/A | ❌ Not available on HuggingFace router |

The 7B model was chosen for its **40x speed improvement** while maintaining adequate quality for structured financial advice.

---

## 8. Backend API Reference

### 8.1 Authentication Endpoints

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| `POST` | `/api/auth/register` | `{name, email, password, lifeStage?, riskScore?}` | `{token, user}` | ❌ |
| `POST` | `/api/auth/login` | `{email, password}` | `{token, user}` | ❌ |
| `GET` | `/api/auth/me` | — | `{id, name, email, lifeStage, riskScore, riskLabel, portfolio}` | ✅ JWT |
| `GET` | `/api/auth/profile` | — | Same as `/me` | ✅ JWT |
| `PUT` | `/api/auth/profile` | `{name?, lifeStage?, riskScore?, riskLabel?}` | `{message, user}` | ✅ JWT |

### 8.2 Chat Endpoints

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| `GET` | `/api/chats` | — | `[{id, title, createdAt, updatedAt}]` | ✅ JWT |
| `POST` | `/api/chats` | — | `{id, title, messages: []}` | ✅ JWT |
| `GET` | `/api/chats/:id` | — | `{id, title, messages: [{id, isAi, content, timestamp}]}` | ✅ JWT |
| `POST` | `/api/chats/:id/messages` | `{content}` | `{chatId, title, userMessage, aiMessage}` | ✅ JWT |
| `PUT` | `/api/chats/:id/title` | `{title}` | `{id, title}` | ✅ JWT |
| `DELETE` | `/api/chats/:id` | — | `{message, id}` | ✅ JWT |

**Message flow in `addMessage`:**
1. Validates request and finds the chat
2. Pushes the user message to `chat.messages[]`
3. Auto-renames the chat title if it's still "New Consultation"
4. Calls `generateFinancialAdvice()` with conversation history (last 4 messages) and user profile
5. Pushes the AI response to `chat.messages[]`
6. Saves to MongoDB and returns both messages

### 8.3 Portfolio Endpoints

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| `GET` | `/api/portfolio` | — | `{totalValue, investments: [...]}` | ✅ JWT |
| `POST` | `/api/portfolio/add` | `{name, type, value, symbol?}` | `{message, portfolio}` | ✅ JWT |
| `DELETE` | `/api/portfolio/remove/:id` | — | `{message, portfolio}` | ✅ JWT |

**Auto-recalculation:** After every add/remove, `totalValue` is recalculated as the sum of all `investments[].value`.

### 8.4 File Upload Endpoint

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| `POST` | `/api/upload` | FormData: `file` + `chatId` + `content?` | `{userMessage, aiMessage, title?}` | ✅ JWT |

**Supported file types:** `.pdf`, `.txt`, `.csv`

### 8.5 Health Check

| Method | Endpoint | Response |
|--------|----------|----------|
| `GET` | `/api/health` | `{status: "ok", message: "ET AI Concierge Backend is running 🚀"}` |

---

## 9. Frontend Component Architecture

### 9.1 Component Tree

```
App.jsx (Orchestrator — auth state, session restore, routing)
 ├── AuthPage.jsx (shown when not authenticated)
 │    ├── Login Form (email, password)
 │    └── Register Form (name, email, password, lifeStage, riskScore slider)
 │
 ├── Sidebar.jsx (left panel — chat list + settings menu)
 │    ├── New Consultation button
 │    ├── Chat session list (rename, delete, select)
 │    └── User profile footer → Settings popup
 │         ├── Edit Profile (inline name edit)
 │         ├── Preferences → opens SettingsModal
 │         └── Log Out → clears session
 │
 ├── MainChat.jsx (center — message display)
 │    ├── Top bar (sidebar toggle, theme toggle, portfolio panel button)
 │    ├── Welcome screen (shown when no messages)
 │    ├── Message list (react-markdown for AI, plain text for user)
 │    │    └── TTS Speaker button 🔊 (SpeechSynthesis API)
 │    └── Typing indicator (animated dots)
 │
 ├── InputArea.jsx (bottom — message input)
 │    ├── File attachment picker (📎 → PDF/TXT/CSV)
 │    ├── Text input (textarea, auto-resizing)
 │    ├── Mic button 🎙️ (SpeechRecognition API)
 │    │    └── Listening modal (live transcript display)
 │    └── Send button ("ASK AI")
 │
 ├── RightPanel.jsx (right — portfolio dashboard)
 │    ├── Life Stage display
 │    ├── Risk Profile bar (animated)
 │    ├── Investments list (from MongoDB, add/remove)
 │    └── Dynamic AI Suggestions (computed from portfolio + risk)
 │
 └── SettingsModal.jsx (overlay — profile editor)
      ├── User info (read-only: name, email)
      ├── Life Stage selector (button grid)
      ├── Risk Tolerance slider (1–10 with color-coded label)
      └── Save Profile → PUT /api/auth/profile
```

### 9.2 State Management

The application uses **React's built-in state** (`useState`, `useEffect`, `useCallback`) without any external state management library. All global state lives in `App.jsx` and is passed down via props:

| State Variable | Type | Purpose |
|---------------|------|---------|
| `token` | `string \| null` | JWT token (null = not logged in) |
| `currentUser` | `object \| null` | User profile from `/auth/me` |
| `authLoading` | `boolean` | Loading state while checking token validity |
| `chats` | `array` | List of chat sessions (sidebar) |
| `activeChatId` | `string \| null` | Currently selected chat |
| `activeChatMessages` | `array` | Messages in the active chat |
| `isTyping` | `boolean` | AI is generating a response |
| `isDark` | `boolean` | Theme toggle |
| `isSidebarOpen` | `boolean` | Left panel visibility |
| `isRightPanelOpen` | `boolean` | Portfolio panel visibility |
| `isSettingsOpen` | `boolean` | Settings modal visibility |

### 9.3 Authentication Flow

```
Page Load
   ↓
Check localStorage for 'et_token'
   ├── No token → Render AuthPage (Login/Register)
   │    ├── On Login success → store token in localStorage → setToken → render main app
   │    └── On Register success → same as login
   │
   └── Token found → GET /api/auth/me
        ├── Valid → setToken + setCurrentUser → render main app
        └── Invalid/Expired → remove from localStorage → render AuthPage
```

---

## 10. Feature Documentation

### 10.1 Real-Time Financial Chat

**How it works:**
1. User types a financial question in `InputArea`
2. `App.jsx` sends `POST /api/chats/:id/messages`
3. Backend calls Tavily for real-time market data, then HuggingFace for AI analysis
4. Response is returned with clickable source links and rendered as Markdown in `MainChat`

**Chat persistence:**
- All messages are stored in MongoDB under the Chat document
- On page refresh, the active chat's messages are reloaded from the database
- Chat sessions appear in the sidebar sorted by `updatedAt` (most recent first)

### 10.2 Voice Input (Speech-to-Text)

**Technology:** `window.webkitSpeechRecognition` (Chrome Web Speech API)

**Configuration:**
- `continuous: false` — stops after first pause in speech
- `interimResults: true` — shows live partial transcript in the listening modal
- `lang: 'en-IN'` — Indian English locale for financial terms (Nifty, SEBI, SIP, etc.)

**User flow:**
1. Click 🎙️ microphone icon
2. Browser requests microphone permission (first time only)
3. Modal opens with animated pulse indicator and live transcript
4. On speech completion, text is appended to the message input
5. User clicks "ASK AI" to send

### 10.3 Voice Output (Text-to-Speech)

**Technology:** `window.speechSynthesis` (native browser API)

**How it works:**
1. Each AI message has a 🔊 speaker icon
2. On click, AI message content is cleaned of Markdown syntax (`cleanMarkdownForSpeech()`)
3. A `SpeechSynthesisUtterance` is created with `rate: 0.95`, `pitch: 1.0`
4. Voice preference: Google English → Microsoft English → generic English → system default
5. Icon changes to ⏹️ while reading — click to stop
6. Only one message can be spoken at a time

**Markdown stripping regex chain:**
```
headings → bold → italic → inline code → links → bullets → numbered lists → newlines
```

### 10.4 Portfolio Management

**Add Investment:**
- Form: asset name, type dropdown (Equity/Mutual Fund/Gold/FD/Crypto/Other), value in ₹
- Saved to `User.portfolio.investments[]` in MongoDB
- `totalValue` auto-recalculated on every add/remove

**Dynamic AI Suggestions:**
Suggestions in the right panel are computed in real-time from actual portfolio data:

| Condition | Suggestion |
|-----------|-----------|
| No investments | "Add your first investment..." |
| Only 1 asset type | "Diversify across Equity, Mutual Funds, and Gold" |
| Aggressive risk + no equity | "Adding direct equity could amplify growth" |
| Conservative risk + no FD/Gold | "Add FDs or Gold for stability" |
| Portfolio ≥ ₹5L | "Ask AI: Is my allocation optimal?" |

### 10.5 Document Analysis

**Supported files:** PDF, TXT, CSV

**Pipeline:**
1. `multer` handles file upload (saved to `/uploads/`)
2. `fileParser.js` extracts text:
   - PDF → `pdf-parse` npm package
   - TXT → `fs.readFileSync(path, 'utf-8')`
   - CSV → `fs.readFileSync(path, 'utf-8')` (raw text)
3. Text truncated to 2,000 characters (LLM context limit)
4. `analyzeDocument()` sends to HuggingFace with a portfolio-analysis system prompt
5. Returns: breakdown, risk exposure, concentration risks, 3 recommendations

### 10.6 User Settings

**Fields editable via SettingsModal:**
- **Life Stage:** Student, Early Career, Mid Career, Pre-Retirement, Retired
- **Risk Tolerance:** 1–10 slider → auto-labels as Conservative (1–3), Moderate (4–6), Aggressive (7–10)

**Impact:** Once saved, the updated profile is used in the AI system prompt for all subsequent queries.

---

## 11. Security Implementation

| Layer | Mechanism | Details |
|-------|-----------|---------|
| **Password Storage** | bcrypt | Hashed with 10 salt rounds, never stored in plaintext |
| **Authentication** | JWT | HS256-signed, 7-day expiry, stored in `localStorage` |
| **Password Retrieval** | `select: false` | Password field excluded from all Mongoose queries by default |
| **Route Protection** | `auth.js` middleware | Verifies JWT on every protected route; rejects expired/invalid tokens |
| **CORS** | Whitelist | Only `localhost:5173` and `localhost:3000` allowed |
| **File Uploads** | Extension filter | Only `.pdf`, `.txt`, `.csv` accepted |
| **Request Size** | Express limit | JSON body limited to 10MB |
| **API Keys** | `.env` + `.gitignore` | Never committed to version control |
| **Input Validation** | Mongoose schema | Required fields, enums, regex patterns, min/max constraints |

---

## 12. Error Handling Strategy

### Backend Error Handling

Every controller wraps business logic in `try/catch` blocks and returns structured error responses:

```javascript
try {
  // Business logic
} catch (error) {
  console.error('OperationName error:', error.message);
  res.status(500).json({ message: 'Server error', error: error.message });
}
```

### AI Pipeline Error Handling

| Error | HTTP Status | Recovery Strategy |
|-------|------------|-------------------|
| Tavily search failure | N/A (internal) | Returns `{ context: "temporarily unavailable", sources: [] }` — LLM continues without context |
| HuggingFace 503 (cold start) | 200 (graceful) | Returns message: "Model is warming up (~Xs). Please retry." |
| HuggingFace 429 (rate limit) | 200 (graceful) | Returns message: "Rate limit reached. Please wait." |
| HuggingFace other errors | 200 (graceful) | Returns raw Tavily context + sources as fallback |
| LLM returns empty | 200 (graceful) | Falls back to raw Tavily data: "Based on the latest financial data..." |

### Frontend Error Handling

| Scenario | Handling |
|----------|---------|
| Invalid/expired JWT | `localStorage` cleared → user redirected to AuthPage |
| Network error on API call | `console.error()` — no crash, UI remains functional |
| Speech Recognition not supported | Mic button disabled with tooltip: "Not supported in this browser" |
| File upload fails | Error thrown and caught in `handleSendMessage` |

---

## 13. Performance Optimizations

| Optimization | Impact |
|-------------|--------|
| **LLM model: 72B → 7B** | Response time reduced from 40–50s to 1–3s (~40x faster) |
| **max_tokens: 1024 → 512** | ~40% reduction in generation time |
| **Chat history: 6 → 4 messages** | Smaller context window = faster LLM inference |
| **History truncation: 300 chars/message** | Prevents context bloat from long previous messages |
| **Chat list: `.select('-messages')`** | Sidebar loads instantly — messages loaded only when a chat is selected |
| **Tavily max_results: 8 → 6** | Faster search with no quality loss |
| **Sources appended deterministically** | LLM doesn't waste tokens on URL generation |
| **Textarea auto-resize** | CSS + JS — no layout thrashing |

---

## 14. Development Phases

| Phase | Scope | Key Deliverables |
|-------|-------|-----------------|
| **Phase 1** | Auth & Database | Express server, MongoDB connection, User model, JWT auth (register/login/profile), `auth.js` middleware |
| **Phase 2** | Chat System | Chat model, CRUD endpoints (create/rename/delete), message persistence, auto-titling, Sidebar integration |
| **Phase 3** | AI Integration | Tavily Search API, HuggingFace Qwen 7B, system prompt engineering, Markdown rendering (react-markdown + remark-gfm), error handling for cold starts |
| **Phase 4** | Portfolio & Upload | Investment CRUD on User model, `multer` file upload, `pdf-parse` extraction, `analyzeDocument()`, RightPanel wired to real data |
| **Phase 5** | Voice Features | SpeechRecognition (en-IN, live transcript), SpeechSynthesis (Markdown-stripped TTS), deterministic sources footer, model speed fix (72B → 7B) |
| **Phase 6** | Final Integration | AuthPage (Login/Register UI), SettingsModal (risk + life stage), `localStorage` session restore, logout flow, dynamic AI suggestions |

---

## 15. Deployment Guide

### Prerequisites
- Node.js 18+
- MongoDB 7.x (local or Atlas)
- Git

### Local Development Setup

```bash
# 1. Clone
git clone https://github.com/Vigneshwaran-NM/ET-AI-Concierge.git
cd ET-AI-Concierge

# 2. Backend
cd backend
npm install
# Create .env file with: PORT, MONGO_URI, JWT_SECRET, JWT_EXPIRE, HF_API_KEY, TAVILY_API_KEY
node server.js

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev

# 4. Open http://localhost:5173 in Chrome
```

### Environment Variables

| Variable | Example | Required |
|----------|---------|----------|
| `PORT` | `5000` | ✅ |
| `MONGO_URI` | `mongodb://localhost:27017/et_ai_concierge` | ✅ |
| `JWT_SECRET` | Any random string (≥32 chars recommended) | ✅ |
| `JWT_EXPIRE` | `7d` | ✅ |
| `HF_API_KEY` | `hf_xxxxxxxxxxxxxxxxxxxxxxxx` | ✅ |
| `TAVILY_API_KEY` | `tvly-dev-xxxxxxxxxxxxxxxx` | ✅ |

---

## 16. Future Scope

| Feature | Description | Complexity |
|---------|-------------|------------|
| **WebSocket streaming** | Stream AI responses token-by-token for a ChatGPT-like typing effect | Medium |
| **Multi-language support** | Hindi, Tamil, Telugu financial advice (Qwen supports multilingual) | Low |
| **Stock price API** | Live NSE/BSE prices via Yahoo Finance or Alpha Vantage | Medium |
| **Push notifications** | Alert users when portfolio stocks have significant price movements | High |
| **RAG pipeline** | Store uploaded documents in a vector database for multi-document queries | High |
| **Mobile app** | React Native version with native voice APIs | High |
| **Admin dashboard** | Analytics on user queries, popular topics, AI performance metrics | Medium |

---

<div align="center">

**ET AI Concierge — Project Documentation Final**  
Built by Straw Hat Crew for The Economic Times AI Hackathon

</div>
