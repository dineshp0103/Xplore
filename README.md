# Xplore - AI-Powered Career Roadmap Generator
![Xplore Logo](https://lh3.googleusercontent.com/gg/AIJ2gl9NK_8NlyVV_eSphpkgBZlHMxB-UMmbvlsWIocqUcb3zOfBysuRobYtedfcxgCwolVoT_U7VJeHvU2pbTuDIuerlMoZGyhzbWTvcoD82HQVf96I9iG8B7oaoeC6Fr04ziSG923m15xPHVGVnQTWs4fRbgb7UPfhYSohhsApZBBhbK61kKTd=s1024-rj-mp2)

Xplore helps users generate personalized learning roadmaps for their dream jobs using the power of Google Gemini AI.

## 🚀 Newly Added Features
- **Premium Glass UI**: A completely redesigned interface with modern glassmorphism aesthetics and dynamic backgrounds.
- **Smart Input Validation**: The AI now validates job roles instantly and provides feedback if a role appears invalid.
- **Company-Specific Roadmaps**: Added an optional input for "Target Company" to tailor roadmaps to specific organizational stacks or cultures.
- **Detailed Phase Explanations**: Click on any roadmap phase to see a deep-dive explanation of tools and concepts tailored to that step.
- **Enhanced Dashboard**:
    - **Always-Visible Save**: "Save Roadmap" button is now always accessible; prompts for sign-in if the user is a guest.
    - **Smart Caching**: Dashboard loads saved roadmaps instantly from cache for better performance.
    - **Expandable Views**: View high-level summaries or drill down into details with a smooth accordion interface.

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Glassmorphism Utilities
- **AI**: Google Gemini Pro (via Google Generative AI SDK)
- **Database & Auth**: Firebase (Firestore, Authentication)

## 🏃‍♂️ Getting Started

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
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
   ... (other firebase config)
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## ✅ Verification
- Test Job Validation by entering valid/invalid roles.
- Generate roadmaps with and without company context.
- Verify the "Save" flow for both logged-in and guest users.
- Check the Glass UI on different screen sizes.

---
*Built with ❤️ using Next.js and Gemini*
