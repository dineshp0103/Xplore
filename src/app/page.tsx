import RoadmapGenerator from "@/components/RoadmapGenerator";
import AuthButton from "@/components/AuthButton";
import SavedRoadmaps from "@/components/SavedRoadmaps";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col font-[family-name:var(--font-geist-sans)] transition-colors duration-200">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-4 transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg">X</span>
            Xplore
          </h1>
          <div className="flex items-center gap-4">
            <nav className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
              v1.0 (Beta)
            </nav>
            <AuthButton />
          </div>
        </div>
      </header>


      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Build Your <span className="text-blue-600 dark:text-blue-500">Career Path</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
            Get a personalized, step-by-step learning roadmap for any job role.
            Powered by AI to help you achieve your professional dreams.
          </p>

          <div className="space-y-16">
            <RoadmapGenerator />
            <SavedRoadmaps />
          </div>
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-8 text-center text-gray-500 dark:text-gray-400 text-sm transition-colors duration-200">
        <p>© {new Date().getFullYear()} <big><b>Xplore</b>,Integrated with Google Gemini.</big></p>
      </footer>
    </div>
  );
}
