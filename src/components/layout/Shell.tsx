import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Shell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f6f7f8] dark:bg-[#101922] text-slate-900 dark:text-white font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Header />
                <div className="flex-1 overflow-y-auto scroll-smooth">
                    {children}
                </div>
            </main>
        </div>
    );
}
