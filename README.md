# 📄 PDF Summarizer AI

An AI-powered PDF summarizer built with React, Node.js, and the Claude API. Upload any PDF and get an instant summary with key insights, word count, and reading time.

## Features

- Drag & drop or click-to-upload PDF
- 4 summary modes: Concise, Detailed, Bullet points, Plain language
- Key takeaways extraction
- Estimated reading time
- Copy to clipboard
- Clean, responsive UI
- Secure — API key stays on the server

## Tech Stack

- **Frontend** — React + Vite + Tailwind CSS
- **Backend** — Node.js + Express
- **AI** — Anthropic Claude API
- **PDF Parsing** — pdf-parse (server-side)

---

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/pdf-summarizer.git
cd pdf-summarizer
```

### 2. Get a Claude API key

Sign up at [console.anthropic.com](https://console.anthropic.com) and create an API key.

### 3. Backend

```bash
cd backend
npm install
cp .env.example .env
# Open .env and paste your API key
npm run dev
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

---

## Deploy (Free)

### Backend → Render

1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo, set root to `backend`
3. Build: `npm install` | Start: `node index.js`
4. Add env var: `ANTHROPIC_API_KEY=your_key`
5. Copy your Render URL

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Connect repo, set root to `frontend`
3. Add env var: `VITE_API_URL=https://your-app.onrender.com`
4. Deploy

---

## Project Structure

```
pdf-summarizer/
├── backend/
│   ├── index.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## License

MIT
