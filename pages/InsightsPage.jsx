import React, { useState, useEffect, useRef } from 'react';
import Icon from '../components/Icon.jsx';
import GeminiLogo from '../components/GeminiLogo.jsx';

// A custom, mechanical markdown parser that avoids bloated node_modules.
// It directly tokenizes lines, extracts list indicators (* or -), and captures **bold** blocks.
const MechanicalMarkdown = ({ text }) => {
    const lines = text.split('\n');
    
    return (
        <div className="text-base text-gray-800 dark:text-gray-300">
            {lines.map((line, i) => {
                const trimmed = line.trim();
                const isListItem = trimmed.startsWith('* ') || trimmed.startsWith('- ');
                const rawContent = isListItem ? trimmed.substring(2) : line;
                
                // Tokenize **bold** text
                const tokens = rawContent.split(/(\*\*.*?\*\*)/g);
                const renderedTokens = tokens.map((token, j) => {
                    if (token.startsWith('**') && token.endsWith('**')) {
                        return <strong key={j} className="font-bold text-gray-900 dark:text-gray-100">{token.slice(2, -2)}</strong>;
                    }
                    return <span key={j}>{token}</span>;
                });

                if (isListItem) {
                    return (
                        <div key={i} className="flex gap-3 my-1.5 ml-2">
                            <span className="text-indigo-500 select-none">•</span>
                            <span className="leading-relaxed">{renderedTokens}</span>
                        </div>
                    );
                }
                
                // Empty lines act as structural breaks
                if (trimmed === '') return <div key={i} className="h-4"></div>;

                return <div key={i} className="my-2 leading-relaxed">{renderedTokens}</div>;
            })}
        </div>
    );
};

const InsightsPage = ({ profile, logs, chatHistory, setChatHistory }) => {
    const [chatInput, setChatInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const chatScrollRef = useRef(null);

    const quickPrompts = [
        "Analyze today's deficit",
        "Am I hitting my BMR?",
        "Suggest a 500 kcal dinner"
    ];

    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
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
            const systemContext = `
                You are a helpful, direct, and slightly technical AI assistant embedded in a Calorie Tracker app.
                The user has the following profile: Height: ${profile.height || 'Unknown'}cm, Weight: ${profile.weight || 'Unknown'}kg, Age: ${profile.age || 'Unknown'}.
                Here are their recent calorie logs (JSON format):
                ${JSON.stringify(logs.slice(0, 50))}
                
                Keep your answers concise, practical, and formatting using plain text or basic markdown (**bold**, * lists). 
                Focus on the data provided. Do not use hashtags for headers.
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
        <div className="w-full max-w-5xl mx-auto flex flex-col h-[calc(100vh-64px)] pb-6 animate-fade-in">
            <header className="mb-6 flex items-center gap-4 px-2">
                <GeminiLogo className="w-8 h-8" />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Gemini Insights
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Automated dietary analysis terminal.</p>
                </div>
            </header>
            
            {/* The Chat Console */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#141218] border border-gray-200 dark:border-gray-800">
                
                <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col gap-8">
                    {chatHistory.length === 0 ? (
                        <div className="text-center opacity-60 mt-16 flex flex-col items-center">
                            <Icon name="terminal" size={48} className="mb-4 text-gray-300 dark:text-gray-700" />
                            <h3 className="text-xl font-mono mb-2">SYSTEM.READY</h3>
                            <p className="max-w-md text-sm font-mono">The AI terminal is awaiting your input. Select a quick prompt or type a custom query below.</p>
                        </div>
                    ) : (
                        chatHistory.map((msg, idx) => (
                            <div key={idx} className={`animate-fade-in w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                
                                {msg.role === 'user' ? (
                                    /* User Bubble: Monospaced, right-aligned, strict structure */
                                    <div className="max-w-[70%] bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 px-5">
                                        <div className="text-xs font-mono text-gray-400 mb-2 border-b border-gray-200 dark:border-gray-800 pb-2 flex justify-between">
                                            <span>USER_INPUT</span>
                                            <Icon name="user" size={14} />
                                        </div>
                                        <div className="whitespace-pre-wrap font-mono text-sm text-gray-700 dark:text-gray-300">
                                            {msg.text}
                                        </div>
                                    </div>
                                ) : (
                                    /* AI Bubble: Full width capability, left accent border */
                                    <div className="w-full pl-6 border-l-4 border-indigo-500 py-2">
                                        <div className="flex items-center gap-2 mb-3">
                                            <GeminiLogo className="w-4 h-4" />
                                            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">GEMINI_OUTPUT</span>
                                        </div>
                                        <MechanicalMarkdown text={msg.text} />
                                    </div>
                                )}
                            </div>
                        ))
                    )}

                    {isThinking && (
                        <div className="w-full pl-6 border-l-4 border-indigo-500 py-2 animate-fade-in opacity-50">
                            <div className="flex items-center gap-2 mb-3">
                                <GeminiLogo className="w-4 h-4 animate-spin-slow" />
                                <span className="text-xs font-mono font-bold text-indigo-500">PROCESSING...</span>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <div className="w-1.5 h-4 bg-indigo-500 animate-pulse"></div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1c1b1f] p-4 flex flex-col gap-4">
                    
                    {/* Dynamic Prompt Chips */}
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {quickPrompts.map((prompt, idx) => (
                            <button
                                key={idx}
                                onClick={() => sendPrompt(prompt)}
                                disabled={isThinking}
                                className="whitespace-nowrap px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm font-mono hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors disabled:opacity-50"
                            >
                                &gt; {prompt}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSendChat} className="flex gap-2">
                        <div className="flex-1 flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-shadow">
                            <span className="text-gray-400 font-mono mr-2">&gt;</span>
                            <input 
                                type="text" 
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                placeholder="Execute command or ask a question..."
                                className="w-full bg-transparent py-3 focus:outline-none font-mono text-sm"
                                autoComplete="off"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={!chatInput.trim() || isThinking}
                            className="bg-indigo-600 text-white px-6 py-3 font-mono text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            EXECUTE <Icon name="corner-down-left" size={16} />
                        </button>
                    </form>
                    
                    <div className="text-center">
                        <button 
                            onClick={() => setChatHistory([])}
                            className="text-xs font-mono opacity-40 hover:opacity-100 transition-opacity"
                        >
                            [ CLEAR_SESSION ]
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default InsightsPage;
