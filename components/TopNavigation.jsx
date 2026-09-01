import React from 'react';
import { NavLink } from 'react-router-dom';
import Icon from './Icon.jsx';

const TopNavigation = ({ theme, setTheme, weeklyTotal }) => {
    const navItems = [
        { path: '/', icon: 'plus-circle', label: 'Log' },
        { path: '/planner', icon: 'calendar', label: 'Planner' },
        { path: '/history', icon: 'list', label: 'History' },
        { path: '/chart', icon: 'bar-chart-2', label: 'Chart' },
        { path: '/insights', icon: 'sparkles', label: 'Insights' },
        { path: '/settings', icon: 'settings', label: 'Settings' }
    ];

    return (
        <header className="w-full bg-white dark:bg-[#141218] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
                
                {/* Logo Area */}
                <div className="flex items-center gap-3">
                    <img src="/favicon.png" alt="App Logo" className="w-10 h-10 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800" />
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Track.</h1>
                </div>

                {/* Navigation Links - Material You Pill Style */}
                <nav className="hidden md:flex items-center gap-2">
                    {navItems.map(item => (
                        <NavLink 
                            key={item.path} 
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-2 px-5 py-2.5 rounded-full transition-colors font-medium
                                ${isActive 
                                    ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-100' 
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1c1b1f]'}
                            `}
                        >
                            <Icon name={item.icon} size={18} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Theme Toggle & Weekly Total Area */}
                <div className="flex items-center gap-4">
                    {/* Weekly Total Widget */}
                    <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">This Week</span>
                        <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{weeklyTotal?.toLocaleString() || 0} kcal</span>
                    </div>

                    <button 
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-2.5 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1c1b1f] transition-colors"
                        title="Toggle Theme"
                    >
                        <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
                    </button>
                    
                    {/* Mobile Only: Simple row of icons */}
                    <div className="md:hidden flex items-center gap-1">
                        {navItems.map(item => (
                            <NavLink 
                                key={item.path} 
                                to={item.path}
                                className={({ isActive }) => `
                                    p-2.5 rounded-full transition-colors
                                    ${isActive 
                                        ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-100' 
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1c1b1f]'}
                                `}
                            >
                                <Icon name={item.icon} size={20} />
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopNavigation;
