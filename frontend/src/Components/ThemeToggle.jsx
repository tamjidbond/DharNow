import React, { useState, useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem('theme') === 'dark' || !('theme' in localStorage)
    );

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    return (
        <button
            onClick={() => setDarkMode(!darkMode)}
            className="relative w-14 h-7 flex items-center bg-slate-200 dark:bg-white/10 rounded-full p-1 cursor-pointer transition-all duration-300 border border-transparent dark:border-white/10"
        >
            <div
                className={`bg-white dark:bg-main-blue w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${darkMode ? 'translate-x-7' : 'translate-x-0'
                    }`}
            >
                {darkMode ? (
                    <FaMoon className="text-[10px] text-white" />
                ) : (
                    <FaSun className="text-[10px] text-amber-500" />
                )}
            </div>
        </button>
    );
};

export default ThemeToggle;