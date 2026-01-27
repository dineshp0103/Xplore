import Image from "next/image";
import RoadmapGenerator from "@/components/RoadmapGenerator";
import AuthButton from "@/components/AuthButton";
import SavedRoadmaps from "@/components/SavedRoadmaps";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-geist-sans)]">
      <header className="glass-panel border-b-0 rounded-none border-b-white/10 py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-white/10">
              <Image
                src="/icon.png"
                alt="Xplore Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              Xplore
            </span>
          </h1>
          <div className="flex items-center gap-4">
            <nav className="text-sm opacity-60 hidden sm:block">
              v2.0.1 (Beta)
            </nav>
            <AuthButton />
          </div>
        </div>
      </header>


      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Build Your <span className="text-blue-400">Career Path</span>
          </h1>
          <p className="text-lg opacity-80 max-w-2xl mx-auto mb-12">
            Get a personalized, step-by-step learning roadmap for any job role.
            Powered by AI to help you achieve your professional dreams.
          </p>

          <div className="space-y-16">
            <RoadmapGenerator />
            <SavedRoadmaps />
          </div>
        </div>
      </main>

      <footer className="glass-panel rounded-none border-t-white/10 border-b-0 py-8 text-center opacity-60 text-sm mt-auto">
        <p>© {new Date().getFullYear()} <big><b>Xplore</b>, Integrated with Google Gemini.</big></p>
      </footer>
    </div>
  );
}
