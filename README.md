# Xplore - AI-Powered Career Roadmap Generator
![Xplore Logo](https://uavonoavvcyzlcdbrifu.supabase.co/storage/v1/object/public/assets/icon(1).svg)

Xplore helps users generate personalized learning roadmaps for their dream jobs using the power of Google Gemini AI.

## 🚀 Key Features
- **Premium Glass UI**: A completely redesigned interface with modern glassmorphism aesthetics and dynamic backgrounds.
- **Smart Input Validation**: The AI now validates job roles instantly and provides feedback.
- **Company-Specific Roadmaps**: Generate tailored roadmaps for specific organizational stacks.
- **Detailed Step Explanations**: Click on any roadmap phase for deep-dive guides.
- **Save & Manage Paths**: Save your roadmaps for later viewing (powered by Supabase).
- **Interactive Dashboard**: Track your career planning progress.

## 🛠 Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Vanilla CSS
- **AI**: Google Gemini Pro (via Google Generative AI SDK)
- **Database & Auth**: Supabase

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js installed (v18+ recommended)
- A [Supabase](https://supabase.com/) account
- A [Google AI Studio](https://aistudio.google.com/) API Key (Gemini)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pdinesh0103/Xplore.git
   cd Xplore
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file in the root directory and add:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key_here
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   - Go to your Supabase Dashboard -> SQL Editor.
   - Run the contents of `supabase_schema.sql` (found in the root of this project) to create the `roadmaps` table and set up permissions.

5. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production
To create an optimized production build:
```bash
npm run build
npm start
```

## ✅ Verification
- **Generate**: Try generating a roadmap for "Frontend Developer".
- **Save**: Click the "Save" button and verify it appears in your "Saved Roadmaps" tab.
- **Auth**: Ensure sign-up/login works correctly with Supabase.

---
*Built with ❤️ using Next.js and Gemini*
