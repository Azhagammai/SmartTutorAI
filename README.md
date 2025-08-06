# 🎓 EduSmart - Smart Learning Platform with AI-Personalized Tutors

A full-stack educational platform that adapts to individual learning styles and provides an AI-powered tutor (Nova) to enhance your learning journey.

---

## 📌 Project Summary

**EduSmart** is a smart learning platform that offers:
- Personalized course tracking based on your learning style
- Real-time progress & achievement dashboard
- **Nova**, your AI Learning Assistant (Gemini-powered)
- Gamified learning elements (streaks, scores, achievements)
- Fully connected **React + Vite frontend** and **Node.js backend**

---

## 🏗️ Project Structure

```bash
EduSmart/
│
├── client/                  # Frontend - Vite + React
│   ├── public/
│   ├── src/
│   │   ├── assets/          # Images, icons
│   │   ├── components/      # React Components (Navbar, Dashboard, etc.)
│   │   ├── pages/           # Pages (Login.jsx, Dashboard.jsx, etc.)
│   │   └── App.jsx
│   ├── index.html
│   └── vite.config.js
│
├── server/                 # Backend - Node.js + Express
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── .env
│
├── screenshots/            # UI Screenshots (for README)
│   ├── dashboard.png
│   ├── nova-chat.png
│   └── login.png
│
├── README.md
└── package.json
🔄 Run the Project
Start Frontend (React + Vite)
bash
cd client
npm run dev
Start Backend Server
bash

cd ../server
npm run dev
