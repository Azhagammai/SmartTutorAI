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

```
## 📸 SnapShot

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/14799e53-c51c-4108-9c78-b181fbf64058" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/f5e8bc8c-7d20-4610-b749-8ff13be48cb2" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/bbb5f334-4826-4e02-ae54-1ad44dbf13ee" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/198409a8-be0b-4e6b-b5ac-732e5e91219c" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/d10bcdf3-c1ce-4fb5-becb-d35d0739a3f8" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/e1f203bf-34ba-4ba1-8585-aff2249ba409" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/bce998cd-e775-4ed4-804c-8083d34387b3" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/156035cd-4d34-4c02-9307-0129373e1189" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/7985a659-08a4-43a4-90bc-e2161ce2b969" />
<img width="1920" height="1080" alt="Screenshot (106)" src="https://github.com/user-attachments/assets/5f68e45e-1737-4d9a-a419-5594a98984d5" />







