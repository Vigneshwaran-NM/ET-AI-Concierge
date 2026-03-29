# 🏛️ ET AI Concierge — Financial Companion

<div align="center">

**An AI-powered financial advisory platform built on The Economic Times brand identity.**

*Real-time market insights • Portfolio management • Voice interaction • Document analysis*

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Documents](#documents)

---

## Overview

**ET AI Concierge** is a full-stack financial companion application that combines:

- **Tavily Search API** — fetches real-time financial news, stock data, and market trends
- **HuggingFace LLM (Qwen 2.5 7B)** — generates intelligent, context-aware financial advice
- **MongoDB** — persistent storage for users, chats, portfolios, and investment data
- **Web Speech API** — voice input (speech-to-text) and voice output (text-to-speech)

The AI tailors every response to the user's **risk profile** and **life stage**, providing personalized advice backed by real-time data from sources like The Economic Times.

---

## Architecture

See [ARCHITECTURE_DOC.md](./ARCHITECTURE_DOC.md) for the full system diagram and component descriptions.

```
User (Browser)
    ↓
React Frontend (Vite) ── Voice STT/TTS (Web Speech API)
    ↓
Express.js Backend (REST API)
    ├── Auth (JWT + bcrypt)
    ├── Chat (CRUD + Message History)
    ├── Portfolio (Investments CRUD)
    ├── File Upload (multer + pdf-parse)
    └── AI Pipeline
         ├── Tavily Search API → real-time context
         └── HuggingFace LLM → AI-generated advice + Sources
    ↓
MongoDB (Users, Chats, Portfolios)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Framer Motion, Lucide Icons, react-markdown |
| **Backend** | Node.js, Express.js, Mongoose, JWT, bcrypt, multer, pdf-parse |
| **AI** | Tavily Search API (real-time data), HuggingFace Qwen 2.5-7B (LLM) |
| **Database** | MongoDB (local or Atlas) |
| **Voice** | Web Speech API (SpeechRecognition + SpeechSynthesis) |

---

## Features

### ✅ Phase 1 — Authentication & Database
- JWT-based auth (register/login/logout)
- Session restore from `localStorage`
- User model with risk profile and life stage

### ✅ Phase 2 — Chat System
- Persistent chat sessions (stored in MongoDB)
- Create, rename, delete chats
- Full message history preserved across page refreshes

### ✅ Phase 3 — AI Integration
- **Tavily Search** → fetches latest financial news for every query
- **HuggingFace Qwen 7B** → generates Markdown-formatted financial advice
- Source links always appended to every response
- Graceful error handling for cold starts and rate limits

### ✅ Phase 4 — Portfolio & File Upload
- Add/remove investments (Equity, Mutual Fund, Gold, FD, Crypto)
- Upload PDF/TXT/CSV documents for AI-powered analysis
- Portfolio value auto-calculated

### ✅ Phase 5 — Voice Features
- 🎙️ Speech-to-Text: speak your question via browser microphone (en-IN)
- 🔊 Text-to-Speech: AI reads responses aloud (Markdown stripped)
- Stop/start controls for both STT and TTS

### ✅ Phase 6 — Final Integration
- Login / Register UI with risk tolerance slider
- Settings modal to update profile (dynamically changes AI advice)
- Logout flow with session cleanup
- Dynamic portfolio suggestions based on real data

---

## Setup Instructions

### Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org))
- **MongoDB** running locally on `mongodb://localhost:27017` (or [Atlas](https://cloud.mongodb.com))
- **Git** ([download](https://git-scm.com)) - To Pull this Repo (Or Click 'Code' - [Download Zip](https://github.com/Vigneshwaran-NM/ET-AI-Concierge/archive/refs/heads/main.zip))

---

###  🔑 API Keys Setup (IMPORTANT)

#### 1. Hugging Face API Key

* Go to: [https://huggingface.co](https://huggingface.co)
* Sign up / Login
* Click profile → **Settings** → **Access Tokens**
* Click **New Token**
* Choose:

  * Name: `et-finance-bot`
  * Role: `Read`
* Generate and copy key

Example:

```env
HF_API_KEY=hf_xxxxxxxxxxxxx
```

---

#### 2. Tavily API Key

* Go to: [https://tavily.com](https://tavily.com)
* Click **Get Started** / Sign up
* Open dashboard: [https://app.tavily.com](https://app.tavily.com)
* Copy API key

Example:

```env
TAVILY_API_KEY=tvly-xxxxxxxxxxxxx
```

---

### 1. 
### A) Clone the Repository

```bash
git clone https://github.com/Vigneshwaran-NM/ET-AI-Concierge.git
cd ET-AI-Concierge
```

**Or**

### B) Click 'Code' - [Download Zip](https://github.com/Vigneshwaran-NM/ET-AI-Concierge/archive/refs/heads/main.zip) and Extract It

```bash
cd ET-AI-Concierge
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/et_ai_concierge
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
HF_API_KEY=your_huggingface_api_key
TAVILY_API_KEY=your_tavily_api_key
```

Start the backend:

```bash
node server.js
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Open in Browser

Navigate to `http://localhost:5173` in **Google Chrome** (required for voice features).

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/et_ai_concierge` |
| `JWT_SECRET` | Secret for JWT signing | Any random string |
| `JWT_EXPIRE` | Token expiry | `7d` |
| `HF_API_KEY` | HuggingFace API key | `hf_xxxxxxxxxxxxx` |
| `TAVILY_API_KEY` | Tavily Search API key | `tvly-dev-xxxxxxxxxxxxx` |

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create new account | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| GET | `/api/auth/me` | Restore session | ✅ |
| PUT | `/api/auth/profile` | Update risk/life stage | ✅ |
| GET | `/api/chats` | List all chats | ✅ |
| POST | `/api/chats` | Create new chat | ✅ |
| GET | `/api/chats/:id` | Get chat + messages | ✅ |
| POST | `/api/chats/:id/messages` | Send message → AI response | ✅ |
| PUT | `/api/chats/:id/title` | Rename chat | ✅ |
| DELETE | `/api/chats/:id` | Delete a chat | ✅ |
| GET | `/api/portfolio` | Get portfolio | ✅ |
| POST | `/api/portfolio/add` | Add investment | ✅ |
| DELETE | `/api/portfolio/remove/:id` | Remove investment | ✅ |
| POST | `/api/upload` | Upload file for AI analysis | ✅ |
| GET | `/api/health` | Health check | ❌ |

---

## Project Structure

```
ET-AI-Concierge/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Profile
│   │   ├── chatController.js     # Chat CRUD + AI messaging
│   │   ├── portfolioController.js # Investment management
│   │   └── uploadController.js   # File upload + AI analysis
│   ├── middleware/auth.js        # JWT verification
│   ├── models/
│   │   ├── User.js               # User schema (risk, life stage, investments)
│   │   └── Chat.js               # Chat + Messages schema
│   ├── routes/
│   │   ├── auth.js, chat.js, portfolio.js, upload.js
│   ├── services/aiService.js     # Tavily + HuggingFace pipeline
│   ├── utils/fileParser.js       # PDF/TXT/CSV text extraction
│   └── server.js                 # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthPage.jsx      # Login / Register UI
│   │   │   ├── Sidebar.jsx       # Chat list + Settings menu
│   │   │   ├── MainChat.jsx      # Chat messages + TTS speaker
│   │   │   ├── InputArea.jsx     # Message input + STT mic
│   │   │   ├── RightPanel.jsx    # Portfolio dashboard + dynamic suggestions
│   │   │   └── SettingsModal.jsx # Profile editor (risk + life stage)
│   │   ├── App.jsx               # Main app with auth flow
│   │   └── main.jsx              # React entry point
│   └── index.html
├── ARCHITECTURE_DOC.md           # System architecture diagram + description
├── Impact_Model.md               # Quantified business impact estimate
└── README.md                     # This file
```

---

## Documents

- 📐 [Architecture Document](./ARCHITECTURE_DOC.md) — System diagram, agent roles, tool integrations, error handling
- 💰 [Impact Model](./Impact_Model.md) — Quantified business impact with assumptions and math

---

## License

MIT License — feel free to use, modify, and distribute.

---

<div align="center">
  <strong>Built by Straw Hat Crew for The Economic Times AI Hackathon 2026</strong>
</div>
