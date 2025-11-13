
import React, { useState, useEffect } from 'react';
import { SunIcon, MoonIcon, ShieldCheckIcon } from './Icons';

export const Header: React.FC = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <ShieldCheckIcon className="h-8 w-8 text-indigo-500" />
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Secure<span className="text-indigo-500">Trans</span>
                    </h1>
                </div>
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
                </button>
            </div>
        </header>
    );
};
