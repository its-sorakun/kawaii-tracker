import { GEMINI_API_KEY } from './config.js';

const { useState, useEffect, useRef } = React;

// --- UTILITIES ---

// The browser's native localStorage is synchronous and blocks the main thread, 
// but for small JSON blobs it's perfectly fine and keeps things simple.
const loadData = (key, fallback) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (e) {
        console.error(`Failed to parse ${key} from localStorage:`, e);
        return fallback;
    }
};

const saveData = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

// Generates the last 7 days as YYYY-MM-DD strings for our chart labels
const getLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        // ISO string is UTC, so we shift by local timezone offset to get the correct local date
        const offset = d.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(d - offset)).toISOString().split('T')[0];
        dates.push(localISOTime);
    }
    return dates;
};

// --- COMPONENTS ---

// Lucide dynamically replaces <i> tags with SVGs. React doesn't know about this,
// so when React re-renders, it might blow away the SVG. We wrap icons in a component 
// that re-triggers Lucide's parser whenever it renders.
const Icon = ({ name, className = "" }) => {
    const iconRef = useRef(null);

    useEffect(() => {
        if (window.lucide && iconRef.current) {
            window.lucide.createIcons({
                root: iconRef.current.parentNode,
                nameAttr: 'data-lucide'
            });
        }
    });

    return <i ref={iconRef} data-lucide={name} className={className}></i>;
};

// Material You inspired flat card
const Card = ({ children, className = "" }) => (
    <div className={`bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 ${className}`}>
        {children}
    </div>
);

// --- MAIN APPLICATION ---

export default function App() {
    // State Initialization
    const [theme, setTheme] = useState(() => loadData('theme', 'light'));
    const [logs, setLogs] = useState(() => loadData('calorie_logs', []));
    const [profile, setProfile] = useState(() => loadData('user_profile', { height: '', weight: '' }));
    const [chatHistory, setChatHistory] = useState(() => loadData('gemini_chat', []));
    
    // UI State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    
    // Form State
    const [foodName, setFoodName] = useState('');
    const [calories, setCalories] = useState('');
    const [dateTimestamp, setDateTimestamp] = useState(() => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        return (new Date(now - offset)).toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
    });
    
    const [chatInput, setChatInput] = useState('');
    
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const chatScrollRef = useRef(null);

    // Apply theme to document element so Tailwind's 'dark:' variants work
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        saveData('theme', theme);
    }, [theme]);

    // Save data when it changes
    useEffect(() => { saveData('calorie_logs', logs); }, [logs]);
    useEffect(() => { saveData('user_profile', profile); }, [profile]);
    useEffect(() => { saveData('gemini_chat', chatHistory); }, [chatHistory]);

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [chatHistory, isChatOpen]);

    // Render Chart.js
    useEffect(() => {
        if (!chartRef.current) return;

        const ctx = chartRef.current.getContext('2d');
        const days = getLast7Days();
        
        // Aggregate calories by day
        const dataMap = {};
        days.forEach(d => dataMap[d] = 0);
        
        logs.forEach(log => {
            const day = log.date.split('T')[0];
            if (dataMap[day] !== undefined) {
                dataMap[day] += Number(log.calories);
            }
        });

        const dataPoints = days.map(d => dataMap[d]);

        // Destroy previous instance to prevent overlapping canvases when React hot-reloads or re-renders
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        // Theming the chart based on current mode
        const textColor = theme === 'dark' ? '#cbd5e1' : '#475569';
        const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

        chartInstance.current = new window.Chart(ctx, {
            type: 'bar',
            data: {
                labels: days.map(d => {
                    const dateObj = new Date(d);
                    return dateObj.toLocaleDateString(undefined, { weekday: 'short' });
                }),
                datasets: [{
                    label: 'Calories',
                    data: dataPoints,
                    backgroundColor: theme === 'dark' ? '#818cf8' : '#6366f1', // Indigo
                    borderRadius: 8,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: textColor }
                    }
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [logs, theme]);

    // Re-initialize Lucide icons when component tree updates
    useEffect(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    });

    // --- HANDLERS ---

    const handleAddLog = (e) => {
        e.preventDefault();
        if (!foodName || !calories || !dateTimestamp) return;

        const newLog = {
            id: crypto.randomUUID(), // Standard browser API for unique IDs
            food: foodName,
            calories: Number(calories),
            date: dateTimestamp
        };

        setLogs([newLog, ...logs].sort((a, b) => new Date(b.date) - new Date(a.date)));
        setFoodName('');
        setCalories('');
    };

    const handleDeleteLog = (id) => {
        setLogs(logs.filter(l => l.id !== id));
    };

    const handleDownloadJSON = () => {
        const data = {
            profile,
            logs
        };
        // We create a Blob representing the data as a file in memory,
        // then generate a temporary URL to it and simulate a click on an anchor tag.
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `calorie_tracker_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleSendChat = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg = { role: 'user', text: chatInput };
        const newHistory = [...chatHistory, userMsg];
        setChatHistory(newHistory);
        setChatInput('');
        setIsThinking(true);

        try {
            // Build the system context. We inject the user's raw data directly into the prompt.
            const systemContext = `
                You are a helpful, direct, and slightly technical AI assistant embedded in a Calorie Tracker app.
                The user has the following profile: Height: ${profile.height || 'Unknown'}, Weight: ${profile.weight || 'Unknown'}.
                Here are their recent calorie logs (JSON format):
                ${JSON.stringify(logs.slice(0, 50))}
                
                Keep your answers concise, practical, and formatting using plain text or basic markdown. 
                Focus on the data provided.
            `;

            // Google's Gemini 3.1 Flash REST API format expects contents as an array of parts.
            // For a chat interface, we map our history to their expected format.
            // Note: The API format for system instructions involves a 'system_instruction' field at the root.
            const payload = {
                system_instruction: {
                    parts: [{ text: systemContext }]
                },
                contents: newHistory.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                }))
            };

            // Using raw fetch() keeps the mechanism visible without abstracting it behind an SDK.
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error?.message || 'API request failed');
            }

            const data = await response.json();
            const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
            
            setChatHistory([...newHistory, { role: 'model', text: aiText }]);
        } catch (error) {
            console.error("Gemini API Error:", error);
            setChatHistory([...newHistory, { role: 'model', text: `Error: ${error.message}. Check your API key and network.` }]);
        } finally {
            setIsThinking(false);
        }
    };

    // --- RENDER ---
    
    return (
        <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto flex flex-col gap-8">
            
            {/* Header */}
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
                        className="p-3 rounded-2xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/30"
                    >
                        <Icon name="sparkles" />
                        <span className="hidden sm:inline font-medium">Insights</span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Logging & Profile */}
                <div className="flex flex-col gap-8">
                    
                    {/* Log Form */}
                    <Card>
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <Icon name="plus-circle" className="text-indigo-500" />
                            Log Entry
                        </h2>
                        <form onSubmit={handleAddLog} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 opacity-70">Food Item</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={foodName} 
                                    onChange={e => setFoodName(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g. Oatmeal & Berries"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 opacity-70">Calories</label>
                                    <input 
                                        type="number" 
                                        required 
                                        min="0"
                                        value={calories} 
                                        onChange={e => setCalories(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="kcal"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 opacity-70">Date & Time</label>
                                    <input 
                                        type="datetime-local" 
                                        required 
                                        value={dateTimestamp} 
                                        onChange={e => setDateTimestamp(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="mt-2 w-full bg-indigo-500 text-white font-medium py-3 rounded-xl hover:bg-indigo-600 transition-colors">
                                Add to Log
                            </button>
                        </form>
                    </Card>

                    {/* Profile */}
                    <Card>
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <Icon name="user" className="text-emerald-500" />
                            Profile
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 opacity-70">Height</label>
                                <input 
                                    type="text" 
                                    value={profile.height} 
                                    onChange={e => setProfile({...profile, height: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="e.g. 180cm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 opacity-70">Weight</label>
                                <input 
                                    type="text" 
                                    value={profile.weight} 
                                    onChange={e => setProfile({...profile, weight: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="e.g. 75kg"
                                />
                            </div>
                        </div>
                    </Card>
                    
                </div>

                {/* Right Column: Chart & History */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    
                    {/* Chart */}
                    <Card className="h-80 flex flex-col">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Icon name="bar-chart-2" className="text-indigo-500" />
                            Weekly Overview
                        </h2>
                        <div className="flex-1 relative w-full">
                            <canvas ref={chartRef}></canvas>
                        </div>
                    </Card>

                    {/* Log History */}
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

            {/* Gemini Chat Drawer/Modal */}
            {isChatOpen && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col animate-slide-in-right">
                        
                        {/* Chat Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-indigo-500 text-white">
                            <div className="flex items-center gap-3">
                                <Icon name="sparkles" />
                                <h2 className="text-xl font-bold">Gemini Insights</h2>
                            </div>
                            <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                                <Icon name="x" />
                            </button>
                        </div>

                        {/* Chat Messages */}
                        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-950">
                            {chatHistory.length === 0 ? (
                                <div className="text-center opacity-60 mt-10">
                                    <Icon name="bot" className="mx-auto mb-4 w-12 h-12 opacity-50" />
                                    <p>Hello! I'm your AI health assistant.</p>
                                    <p className="text-sm mt-2">I can analyze your calorie trends based on your logs and profile.</p>
                                </div>
                            ) : (
                                chatHistory.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-4 rounded-2xl ${
                                            msg.role === 'user' 
                                            ? 'bg-indigo-500 text-white rounded-tr-sm' 
                                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-tl-sm'
                                        }`}>
                                            {/* Basic whitespace preservation for formatting */}
                                            <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                            {isThinking && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl rounded-tl-sm flex gap-2">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></div>
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                            <form onSubmit={handleSendChat} className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    placeholder="Ask about your diet..."
                                    className="flex-1 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button 
                                    type="submit" 
                                    disabled={!chatInput.trim() || isThinking}
                                    className="bg-indigo-500 text-white p-3 rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-50"
                                >
                                    <Icon name="send" />
                                </button>
                            </form>
                            <div className="text-center mt-2">
                                <button 
                                    onClick={() => setChatHistory([])}
                                    className="text-xs opacity-50 hover:opacity-100 transition-opacity flex items-center justify-center gap-1 mx-auto"
                                >
                                    <Icon name="rotate-ccw" className="w-3 h-3" /> Clear History
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
            
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes slide-in-right {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}} />

        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
