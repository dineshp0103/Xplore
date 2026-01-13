'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <span className="sr-only">Loading theme</span>
            </button>
        );
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 flex items-center justify-center group overflow-hidden"
            aria-label="Toggle theme"
        >
            <div className="relative w-5 h-5 flex items-center justify-center">
                <Sun
                    className={`absolute w-5 h-5 text-yellow-500 transition-all duration-500 ease-[cubic-bezier(0.25,1.5,0.5,1)] ${theme === 'dark' ? 'rotate-[-90deg] scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
                        }`}
                />
                <Moon
                    className={`absolute w-5 h-5 text-blue-400 transition-all duration-500 ease-[cubic-bezier(0.25,1.5,0.5,1)] ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'rotate-[90deg] scale-0 opacity-0'
                        }`}
                />
            </div>
        </button>
    );
}
