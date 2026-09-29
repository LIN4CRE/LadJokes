# 🍺 Lad Jokes: Adult Banter Book & Crude Tales Community

[![React 19](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8e75ff?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg?style=for-the-badge)](LICENSE)
[![Status: Live](https://img.shields.io/badge/Status-Production_Ready-emerald.svg?style=for-the-badge)]()

![Lad Jokes & Banter Vault Banner](/banner.svg)

> **The definitive uncensored digital encyclopedia of British and Australian tavern banter, stag do catastrophes, Sunday league folklore, outrageous confessions, and democratic pub debates.**

---

## 📌 Overview

**Lad Jokes & Banter Vault** is a full-featured, offline-ready Progressive Web Application built for lads, pub regulars, and comedy lovers. It bridges traditional tavern culture with modern web capabilities—combining a curated 6-chapter humor vault, a classic Dad Jokes lounge, an anonymous confession forum with Outrage meters, timed weekly pub quizzes, and client-side encrypted backroom chat.

---

## 🚀 Key Feature Modules

### 1. 📖 The 18+ Lad Jokes Book Vault
- **6 Curated Chapters**:
  - *Chapter 1*: The Pub Vault & Legendary Pint Mishaps (18 Jokes)
  - *Chapter 2*: Stag Do Chronicles & Hangover Apocalypses (16 Jokes)
  - *Chapter 3*: Dating Catastrophes & Bedroom Blunders (19 Jokes)
  - *Chapter 4*: Sunday League & 5-a-Side Carnage (15 Jokes)
  - *Chapter 5*: Workplace Atrocities & Group Chat Traitors (17 Jokes)
  - *Chapter 6*: Disturbing & Raunchy Vault: Extreme Banter (16 Jokes)
- **Content Intensity Warnings**: Strict consent gates and toggles for extreme content.
- **Custom Banter Bookmarking**: Save your favorite jokes to your personal stash.
- **Interactive Spilled Pints Rating**: Track total community pints spilled per joke.

### 2. 👨‍👧 65+ Classic Dad Jokes Start Hub
- **Clean, Groan-Worthy Humor**: Curated catalog covering Puns, Classic, Animals, Food, and Work & Life.
- **Audience Reaction Counters**: Vote "Groan 🤦" or "Chuckle 😂" to measure joke quality.
- **Instant TTS Reading**: Listen to any setup and punchline spoken aloud.
- **Quick Copy**: One-click sharing to WhatsApp, group chats, or iMessage.

### 3. 🎙️ Pub Tale Audio Narrator (TTS)
- **Immersive Voice Playback**: Listen to community confessions and jokes narrated in a choice of tavern voices (*Big Trev*, *Gazza*, *The Landlord*, *Archie*).
- **Background Tavern Ambience**: Toggle realistic pub soundscapes (clinking pint glasses, crowd murmurs, pouring drafts).
- **Audio Progress Scrubbing**: Visual waveform progress bar with speed controls (0.8x to 1.5x).

### 4. ⚡ Daily Banter Prompt & 7-Day Weekly Archive
- **Today's Challenge**: Live community battle with countdown timer, active entry submissions, and top entry crowning.
- **Weekly Archive (Past 7 Days)**: Official Hall of Banter Champions featuring the past seven days of winning confessions.
- **Direct Narration**: Stream any past winner through the Pub Tale Narrator directly from the archive card.

### 5. 🍻 Weekly Pub Quiz (Under Polls)
- **Timed Trivia Rounds**: Fast-paced multiple choice trivia on *Crude History*, *Pop Culture*, and *Banter Knowledge*.
- **Pressure Countdown Timer**: 15s to 30s per question with animated color-shifting progress bar.
- **Landlord Verdicts**: Instant comedic explanations for historical answers.
- **Administrator Quiz Creator Suite**: Built-in editor for admins to write or AI-generate new trivia rounds using Google Gemini.

### 6. 🏆 Lad Tier Progression & Karma System
- Real-time progression ladder based on pints bought, karma earned, and community activity:
  - 🍺 *Rookie Lad* (Level 1)
  - 🍻 *Banter Apprentice* (Level 2)
  - 🎯 *Banter Veteran* (Level 3)
  - 👑 *Pub Legend* (Level 4)
  - ⚡ *Meme Lord* (Level 5)
  - 🏆 *Immortal Weapon* (Level 6)

### 7. 🔒 The Backroom Encrypted Lounge
- **Client-Side AES-GCM Encryption**: Group chat protected with browser-derived keys and random IVs.
- **Ephemeral Auto-Decay**: Self-destructing banter messages.
- **Zero Server Logs**: Messages are only decrypted in the browser memory of active session members.

### 8. 🛡️ Staff Admin Dashboard
- Live monitoring of active stories, reported/flagged items, and community tasks.
- Content moderation controls with Approve/Redact actions.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite` |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Server Runtime** | [Express](https://expressjs.com/) on Node.js via [TSX](https://github.com/privatenumber/tsx) |
| **AI Integration** | [@google/genai SDK](https://github.com/google/generative-ai-js) (Gemini 2.5 Flash) |
| **Typography** | Bebas Neue, Plus Jakarta Sans, Syne, JetBrains Mono |
| **Audio** | HTML5 Web Audio API + SpeechSynthesis TTS |
| **Persistence** | LocalStorage + Cross-Tab BroadcastChannel API |

---

## 💻 Getting Started

### Prerequisites
- Node.js `18.x` or higher
- npm `9.x` or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/lad-jokes-banter-vault.git
   cd lad-jokes-banter-vault
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API Key if using AI Banter Coach features:
   ```env
   GEMINI_API_KEY=your_api_key_here
   PORT=3000
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 📂 Project Architecture

```
├── .env.example              # Environment variables template
├── metadata.json             # AI Studio applet specifications
├── package.json              # Dependencies and run scripts
├── index.html                # Entry point with SEO and OpenGraph metadata
├── server.ts                 # Full-stack Express server with Vite middleware
├── public/
│   ├── banner.svg            # Official 1200x630 vector repository banner
│   └── favicon.svg           # Beer mug browser icon
└── src/
    ├── main.tsx              # Application bootstrap
    ├── App.tsx               # Root component, routing, global state & persistence
    ├── types/
    │   └── index.ts          # Core TypeScript data contracts and interfaces
    ├── data/
    │   ├── initialData.ts    # Seed data for Book chapters, jokes, and quizzes
    │   └── dadJokesData.ts   # 65 curated clean Dad jokes with category tags
    ├── services/
    │   ├── syncService.ts    # BroadcastChannel sync, audio effects & push alerts
    │   ├── tierService.ts    # Lad Tier calculation formulas & karma milestones
    │   └── cryptoService.ts  # Client-side AES-GCM encryption utilities
    └── components/
        ├── Navbar.tsx             # Main header, tab navigation & profile badges
        ├── DadJokesStartPage.tsx  # Classic Dad jokes landing page
        ├── BookReader.tsx         # 6-chapter 18+ reader with search and bookmarking
        ├── CommunityForum.tsx     # Confessions feed, daily prompt & 7-day archive
        ├── StoryAudioPlayerModal  # TTS Pub Tale player with tavern sound effects
        ├── InteractivePolls.tsx   # Democratic debates and Weekly Pub Quiz switcher
        ├── WeeklyPubQuiz.tsx      # Timed trivia gameplay and admin quiz setup
        ├── EncryptedChat.tsx      # Private lounge with ephemeral cipher messages
        ├── AdminDashboard.tsx     # Moderator controls, task tracker and flag audits
        ├── AboutModal.tsx         # Comprehensive Manifesto, rules and tech credits
        └── LadTierBadge.tsx       # Reusable tier pill indicators
```

---

## 📜 The Golden Laws of Banter

1. **No Real Malice**: Banter is affection wrapped in outrage. No bigotry, hate speech, or real harassment.
2. **Protect The Round**: Never dodge your turn at the bar.
3. **What Happens on The Stag...**: Anonymize real names and places where dignity is at stake.
4. **Settle Debates with Data**: When an argument breaks out, put it to a community poll.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
