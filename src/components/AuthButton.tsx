'use client';

import { useState, useEffect } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

import { LogIn, LogOut, User as UserIcon, LayoutDashboard, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from './ThemeToggle';

export default function AuthButton() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        try {
            googleProvider.setCustomParameters({
                prompt: 'select_account'
            });
            await signInWithPopup(auth, googleProvider);
        } catch (error: any) {
            console.error("Error signing in", error);
            if (error.code === 'auth/operation-not-allowed') {
                alert("Configuration Error: Google Sign-In is not enabled. Please enable it in the Firebase Console under Authentication > Sign-in method.");
            } else if (error.code === 'auth/popup-closed-by-user') {
                // User closed popup, no need to alert
            } else {
                alert("Failed to sign in. See console for details.");
            }
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    const [isOpen, setIsOpen] = useState(false);

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <ThemeToggle />
                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 group cursor-pointer focus:outline-none"
                        title={`Name: ${user.displayName || 'User'}`}
                    >
                        {user.photoURL ? (
                            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 ring-2 ring-transparent group-hover:ring-blue-100 dark:group-hover:ring-blue-900 transition-all">
                                <Image
                                    src={user.photoURL}
                                    alt={user.displayName || "User"}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center ring-2 ring-transparent group-hover:ring-blue-100 dark:group-hover:ring-blue-900 transition-all">
                                <UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </div>
                        )}
                    </button>

                    {isOpen && (
                        <div className="glass-panel absolute right-0 mt-2 w-56 rounded-xl shadow-lg border border-white/10 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-4 py-2 border-b border-white/10 mb-1">
                                <p className="text-sm font-semibold truncate">{user.displayName || 'User'}</p>
                                <p className="text-xs opacity-60 truncate">{user.email}</p>
                            </div>

                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 px-4 py-2.5 text-sm opacity-80 hover:opacity-100 hover:bg-white/5 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </Link>

                            <button
                                onClick={async () => {
                                    await handleLogout();
                                    await handleLogin();
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm opacity-80 hover:opacity-100 hover:bg-white/5 transition-colors text-left"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Switch Account
                            </button>

                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    )}

                    {isOpen && (
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
                onClick={handleLogin}
                className="glass-button flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm cursor-pointer"
            >
                <LogIn className="w-4 h-4" />
                Sign In
            </button>
        </div>
    );
}
