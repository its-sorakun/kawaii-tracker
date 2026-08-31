import React, { useState, useEffect, useRef } from 'react';
import Icon from '../components/Icon.jsx';
import GeminiLogo from '../components/GeminiLogo.jsx';

// Custom markdown parser updated for clean, avatar-based reading flow (non-terminal)
const CleanMarkdown = ({ text }) => {
    const lines = text.split('\n');
    
    return (
        <div className="text-base text-gray-900 dark:text-gray-100 font-sans">
            {lines.map((line, i) => {
                const trimmed = line.trim();
                const isListItem = trimmed.startsWith('* ') || trimmed.startsWith('- ');
                const rawContent = isListItem ? trimmed.substring(2) : line;
                
                // Tokenize **bold** text
                const tokens = rawContent.split(/(\*\*.*?\*\*)/g);
                const renderedTokens = tokens.map((token, j) => {
                    if (token.startsWith('**') && token.endsWith('**')) {
                        return <strong key={j} className="font-semibold text-gray-900 dark:text-white">{token.slice(2, -2)}</strong>;
                    }
                    return <span key={j}>{token}</span>;
                });

                if (isListItem) {
                    return (
                        <div key={i} className="flex gap-3 my-2 ml-2">
                            <span className="text-gray-400 dark:text-gray-600 select-none text-xl leading-none">•</span>
                            <span className="leading-relaxed text-[15px]">{renderedTokens}</span>
                        </div>
                    );
                }
                
                if (trimmed === '') return <div key={i} className="h-4"></div>;

                return <div key={i} className="my-2 leading-relaxed text-[15px]">{renderedTokens}</div>;
            })}
        </div>
    );
};

const InsightsPage = ({ profile, logs, chatHistory, setChatHistory, weeklyTotal }) => {
    const [chatInput, setChatInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const chatScrollRef = useRef(null);

    const quickPrompts = [
        "Analyze today's deficit",
        "Am I hitting my BMR?",
        "Suggest a 500 kcal dinner"
    ];

    useEffect(() => {
        // Scroll to the bottom gently when new messages arrive
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTo({
                top: chatScrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [chatHistory, isThinking]);

    const sendPrompt = async (text) => {
        if (!text.trim() || isThinking) return;

        const userMsg = { role: 'user', text: text };
        const newHistory = [...chatHistory, userMsg];
        setChatHistory(newHistory);
        setChatInput('');
        setIsThinking(true);

        try {
            // Compute 12-Week Macro Data for AI context
            const weeks = [];
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const currentDay = now.getDay() || 7;
            const currentMonday = new Date(now);
            currentMonday.setDate(now.getDate() - currentDay + 1);
            
            for (let i = 11; i >= 0; i--) {
                const monday = new Date(currentMonday);
                monday.setDate(monday.getDate() - (i * 7));
                weeks.push(monday);
            }

            const macroData = weeks.map(monday => {
                const weekEnd = new Date(monday);
                weekEnd.setDate(weekEnd.getDate() + 7);
                const totalCals = logs
                    .filter(l => {
                        const d = new Date(l.date);
                        d.setHours(0,0,0,0);
                        return d >= monday && d < weekEnd;
                    })
                    .reduce((sum, l) => sum + Number(l.calories), 0);
                
                return {
                    week_of: monday.toISOString().split('T')[0],
                    total_calories: totalCals
                };
            });

            const systemContext = `
                You are a helpful, direct, and slightly technical AI assistant embedded in a Calorie Tracker app.
                The user has the following profile: Height: ${profile.height || 'Unknown'}cm, Weight: ${profile.weight || 'Unknown'}kg, Age: ${profile.age || 'Unknown'}.
                Their total calorie intake over this current week (starting Monday) is ${weeklyTotal} kcal.
                
                Here is their 12-Week Macro Trend (Total calories per calendar week):
                ${JSON.stringify(macroData)}

                Here are their recent individual daily calorie logs (JSON format):
                ${JSON.stringify(logs.slice(0, 50))}
                
                Keep your answers concise, practical, and formatting using plain text or basic markdown (**bold**, * lists). 
                Focus on the data provided. Use the 12-week macro trend to identify if they are actually losing weight over time (compare their weekly total against their weekly BMR).
                Do not use hashtags for headers.
            `;

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: newHistory,
                    message: text,
                    systemInstruction: systemContext
                })
            });

            if (!response.ok) throw new Error('Server request failed');

            const data = await response.json();
            setChatHistory([...newHistory, { role: 'model', text: data.text }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setChatHistory([...newHistory, { role: 'model', text: `Error: ${error.message}` }]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleSendChat = (e) => {
        e.preventDefault();
        sendPrompt(chatInput);
    };

    return (
        <div className="w-full h-[calc(100vh-100px)] flex flex-col relative animate-fade-in font-sans">
            
            {/* Minimal Header */}
            <header className="flex items-center justify-between py-4 px-4 w-full max-w-3xl mx-auto">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-medium text-gray-800 dark:text-gray-200">
                        Insights
                    </h1>
                </div>
                {chatHistory.length > 0 && (
                    <button 
                        onClick={() => setChatHistory([])}
                        className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition-colors flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
                        title="Clear Conversation"
                    >
                        <Icon name="rotate-ccw" size={16} /> Clear
                    </button>
                )}
            </header>
            
            {/* Scrolling Central Document Flow */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto w-full pb-32">
                <div className="max-w-3xl mx-auto px-4 w-full flex flex-col gap-8 py-6">
                    
                    {chatHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center mt-20 opacity-80">
                            <GeminiLogo className="w-16 h-16 mb-6 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700" />
                            <h2 className="text-3xl font-semibold mb-2 text-gray-800 dark:text-gray-200 tracking-tight">How can I help today?</h2>
                        </div>
                    ) : (
                        chatHistory.map((msg, idx) => (
                            <div key={idx} className="animate-fade-in flex gap-4 md:gap-6 w-full">
                                {/* Left Aligned Avatar */}
                                <div className="flex-shrink-0 mt-1">
                                    {msg.role === 'user' ? (
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            <Icon name="user" size={16} />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center">
                                            <GeminiLogo className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>

                                {/* Flowing Content */}
                                <div className="flex-1 pt-1 overflow-hidden">
                                    {msg.role === 'user' ? (
                                        <div className="text-[15px] font-medium text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                            {msg.text}
                                        </div>
                                    ) : (
                                        <CleanMarkdown text={msg.text} />
                                    )}
                                </div>
                            </div>
                        ))
                    )}

                    {isThinking && (
                        <div className="animate-fade-in flex gap-4 md:gap-6 w-full opacity-60">
                            <div className="flex-shrink-0 mt-1 w-8 h-8 rounded-full flex items-center justify-center">
                                <GeminiLogo className="w-6 h-6 animate-spin-slow" />
                            </div>
                            <div className="flex-1 pt-3 flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></div>
                                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay: '0.15s'}}></div>
                                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay: '0.3s'}}></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Input Pill Area */}
            <div className="absolute bottom-0 left-0 right-0 w-full bg-gradient-to-t from-gray-50 via-gray-50 to-transparent dark:from-[#141218] dark:via-[#141218] pt-12 pb-6 px-4 pointer-events-none">
                <div className="max-w-3xl mx-auto w-full flex flex-col items-center gap-3 pointer-events-auto">
                    
                    {/* Floating Prompt Chips */}
                    {chatHistory.length === 0 && (
                        <div className="flex gap-2 overflow-x-auto w-full pb-2 scrollbar-hide justify-center">
                            {quickPrompts.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => sendPrompt(prompt)}
                                    disabled={isThinking}
                                    className="whitespace-nowrap px-4 py-2 bg-white dark:bg-[#1c1b1f] border border-gray-200 dark:border-gray-800 text-sm rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-sm"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Pill Input */}
                    <form onSubmit={handleSendChat} className="w-full relative flex items-center shadow-lg rounded-full bg-white dark:bg-[#1c1b1f] border border-gray-200 dark:border-gray-800">
                        <input 
                            type="text" 
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            placeholder="Ask Gemini..."
                            className="w-full bg-transparent px-6 py-4 rounded-full focus:outline-none text-[15px] text-gray-900 dark:text-gray-100 placeholder-gray-500"
                            autoComplete="off"
                        />
                        <button 
                            type="submit" 
                            disabled={!chatInput.trim() || isThinking}
                            className="absolute right-2 p-2.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-400 transition-colors disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-gray-600"
                        >
                            <Icon name="arrow-up" size={20} />
                        </button>
                    </form>
                    <div className="text-[11px] text-gray-400 dark:text-gray-600 mt-1 font-medium">
                        Gemini Insights may produce inaccurate information about nutrition or health.
                    </div>
                </div>
            </div>

        </div>
    );
};

export default InsightsPage;
