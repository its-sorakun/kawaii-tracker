import React, { useState, useEffect } from 'react';
import Icon from './components/Icon.jsx';
import Card from './components/Card.jsx';
import LogForm from './components/LogForm.jsx';
import Profile from './components/Profile.jsx';
import WeeklyChart from './components/WeeklyChart.jsx';
import GeminiChat from './components/GeminiChat.jsx';
import { loadData, saveData } from './utils/storage.js';

const App = () => {
    const [theme, setTheme] = useState(() => loadData('theme', 'light'));
    const [logs, setLogs] = useState(() => loadData('calorie_logs', []));
    const [profile, setProfile] = useState(() => loadData('user_profile', { height: '', weight: '' }));
    const [chatHistory, setChatHistory] = useState(() => loadData('gemini_chat', []));
    
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        saveData('theme', theme);
    }, [theme]);

    useEffect(() => { saveData('calorie_logs', logs); }, [logs]);
    useEffect(() => { saveData('user_profile', profile); }, [profile]);
    useEffect(() => { saveData('gemini_chat', chatHistory); }, [chatHistory]);

    const handleAddLog = (newLog) => {
        setLogs([newLog, ...logs].sort((a, b) => new Date(b.date) - new Date(a.date)));
    };

    const handleDeleteLog = (id) => {
        setLogs(logs.filter(l => l.id !== id));
    };

    const handleDownloadJSON = () => {
        const data = { profile, logs };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `calorie_tracker_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };
    
    return (
        <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto flex flex-col gap-8">
            <header className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-500 text-white p-2 rounded-2xl">
                        <Icon name="activity" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Track.</h1>
                </div>
                
                <div className="flex gap-4">
                    <button 
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        title="Toggle Theme"
                    >
                        <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
                    </button>
                    <button 
                        onClick={handleDownloadJSON}
                        className="p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                        title="Export JSON"
                    >
                        <Icon name="download" />
                        <span className="hidden sm:inline font-medium">Export</span>
                    </button>
                    <button 
                        onClick={() => setIsChatOpen(true)}
                        className="p-3 rounded-2xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/30 group"
                    >
                        {/* We add a slight pulse animation to the button icon for that AI feel */}
                        <div className="group-hover:animate-pulse">
                            <Icon name="sparkles" />
                        </div>
                        <span className="hidden sm:inline font-medium">Insights</span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="flex flex-col gap-8">
                    <LogForm onAdd={handleAddLog} />
                    <Profile profile={profile} setProfile={setProfile} />
                </div>

                <div className="lg:col-span-2 flex flex-col gap-8">
                    <WeeklyChart logs={logs} theme={theme} />

                    <Card className="flex-1 overflow-hidden flex flex-col">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Icon name="list" className="text-orange-500" />
                            Recent Entries
                        </h2>
                        <div className="overflow-y-auto flex-1 pr-2 space-y-3" style={{ maxHeight: '400px' }}>
                            {logs.length === 0 ? (
                                <div className="text-center opacity-50 py-10">No entries yet. Start logging!</div>
                            ) : (
                                logs.map(log => (
                                    <div key={log.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 group">
                                        <div>
                                            <div className="font-medium text-lg">{log.food}</div>
                                            <div className="text-sm opacity-60">
                                                {new Date(log.date).toLocaleString(undefined, {
                                                    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-xl font-bold text-indigo-500">{log.calories} <span className="text-sm font-normal opacity-60">kcal</span></div>
                                            <button 
                                                onClick={() => handleDeleteLog(log.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                                                title="Delete Entry"
                                            >
                                                <Icon name="trash-2" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            <GeminiChat 
                isOpen={isChatOpen} 
                onClose={() => setIsChatOpen(false)}
                profile={profile}
                logs={logs}
                chatHistory={chatHistory}
                setChatHistory={setChatHistory}
            />
        </div>
    );
};

export default App;
