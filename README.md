# 🎓 EduSmart - Smart Learning Platform with AI-Personalized Tutors

EduSmart is a full-stack, AI-powered educational platform that tailors learning experiences to individual users. Featuring **Nova**, your AI tutor, EduSmart delivers a smarter, more interactive, and gamified way to learn.

---

## 📌 Project Highlights

- 📚 Personalized course tracking based on user learning style
- 📊 Real-time progress & achievement dashboard
- 🤖 **Nova**: Your intelligent AI Learning Assistant (powered by Gemini)
- 🧩 Gamified learning (streaks, levels, achievements)
- 🔗 Full-stack implementation using **React + Vite** (Frontend) and **Node.js + Express** (Backend)

---

## 🏗️ Project Structure

```bash
EduSmart/
│
├── client/                  # Frontend - Vite + React
│   ├── public/              # Static files
│   ├── src/
│   │   ├── assets/          # Images, icons
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page-level components (Dashboard, Login, etc.)
│   │   └── App.jsx          # Root component
│   ├── index.html           # Base HTML
│   └── vite.config.js       # Vite configuration
│
├── server/                  # Backend - Node.js + Express
│   ├── controllers/         # Route logic
│   ├── models/              # Database schemas
│   ├── routes/              # API route definitions
│   ├── server.js            # App entry point
│   └── .env                 # Environment variables
│
├── screenshots/             # UI Snapshots for reference
│   ├── dashboard.png
│   ├── nova-chat.png
│   └── login.png
│
├── README.md                # This file
└── package.json             # Project metadata



✅ 1. Start the Frontend (React + Vite + API Connection)
cd client
npm install
npm run dev
Frontend runs at: http://localhost:5173

✔️ This connects to the backend and database automatically (configured via Vite proxy).

✅ 2. Start the Backend (Vite-powered APIs)
npm install
npx vite
Backend APIs run at: [http://localhost:3000] (or whichever port you set)

🔧 Tech Stack
Layer	Tech Used
Frontend	React, Vite, Tailwind, Bootstrap
Backend	Node.js, Express, Vite Server (dev simulation)
AI Tutor	Gemini / OpenAI GPT API
Database	MongoDB (or Firebase/local)



💡 Innovation Note
EduSmart is not just an app — it’s a smart companion for learners, designed to help you grow at your own pace with intelligent feedback and motivation.


