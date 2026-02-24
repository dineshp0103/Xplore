# Xplore - AI-Powered Career Roadmap Generator
![Xplore Logo](https://uavonoavvcyzlcdbrifu.supabase.co/storage/v1/object/public/assets/icon(1).svg)

Xplore helps users generate personalized learning roadmaps for their dream jobs using the power of Google Gemini AI.

## 🚀 Key Features
- **Premium Glass UI**: A completely redesigned interface with modern glassmorphism aesthetics and dynamic backgrounds.
- **Interactive Roadmap Graph**: Visualize your learning path as a node-link diagram using React Flow.
- **Smart Caching (DSA)**: 
    - **Client-Side**: Instant responses for repeated chat queries using LRU Cache.
    - **Cross-User**: Identical roadmap requests are served from the backend cache instantly.
- **Smart Input Validation**: The AI now validates job roles instantly and provides feedback.
- **Security**: Input sanitization and length limits to prevent abuse and injection.
- **Detailed Step Explanations**: Click on any roadmap phase for deep-dive guides.
- **Save & Manage Paths**: Save your roadmaps for later viewing.

## 🛠 Tech Stack
- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, **React Flow**, **Dagre**
- **Backend**: Python, FastAPI, **Supabase Cache**
- **AI**: Google Gemini Pro
- **Database & Auth**: Supabase

## 🌐 Live Demo
- **Frontend**: [https://dineshp0103.github.io/Xplore](https://dineshp0103.github.io/Xplore)
- **Backend (API)**: [Render Deployment](https://xplore-yjkw.onrender.com)

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.9+) or `uv` package manager
- A [Supabase](https://supabase.com/) account
- A [Google AI Studio](https://aistudio.google.com/) API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dineshp0103/Xplore.git
   cd Xplore
   ```

2. **Backend Setup (Python)**
   ```bash
   # Create virtual environment (if using venv)
   python -m venv .venv
   .venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   # OR if using uv
   uv sync
   
   # Run backend
   uvicorn backend.main:app --reload
   ```

3. **Frontend Setup (Next.js)**
   ```bash
   npm install
   npm run dev
   ```

### Configuration
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Database Setup
1. Go to your **Supabase Dashboard** -> **SQL Editor**.
2. Run `supabase_schema.sql` (creates `roadmaps` table).
3. Run `create_users_table.sql` (creates `users` table).
4. **[NEW]** Run `create_roadmap_cache.sql` (creates `roadmap_cache` table for performance).

## 🚀 Deployment
- **Frontend**: Deployed via GitHub Actions to **GitHub Pages**. (See `.github/workflows/nextjs.yaml`)
- **Backend**: Deployed to **Render** as a Web Service. (See `render.yaml`)

## ✅ Verification
- **Generate**: Try generating a roadmap for "Frontend Developer".
- **Graph View**: Click the "Graph Layout" toggle to see the visual roadmap.
- **Chat Caching**: Ask a question, then ask it again to see the instant cache response.

---
*Built with ❤️ using Next.js and Gemini*
