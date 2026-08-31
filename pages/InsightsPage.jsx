import React, { useState, useEffect, useRef } from 'react';
import Icon from '../components/Icon.jsx';
import GeminiLogo from '../components/GeminiLogo.jsx';
import Card from '../components/Card.jsx';

const InsightsPage = ({ profile, logs, chatHistory, setChatHistory }) => {
    const [chatInput, setChatInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const chatScrollRef = useRef(null);

    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleSendChat = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg = { role: 'user', text: chatInput };
        const newHistory = [...chatHistory, userMsg];
        setChatHistory(newHistory);
        setChatInput('');
        setIsThinking(true);

        try {
            const systemContext = `
                You are a helpful, direct, and slightly technical AI assistant embedded in a Calorie Tracker app.
                The user has the following profile: Height: ${profile.height || 'Unknown'}, Weight: ${profile.weight || 'Unknown'}.
                Here are their recent calorie logs (JSON format):
                ${JSON.stringify(logs.slice(0, 50))}
                
                Keep your answers concise, practical, and formatting using plain text or basic markdown. 
                Focus on the data provided.
            `;

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: newHistory,
                    message: chatInput,
                    systemInstruction: systemContext
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Server request failed');
            }

            const data = await response.json();
            setChatHistory([...newHistory, { role: 'model', text: data.text }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setChatHistory([...newHistory, { role: 'model', text: `Error: ${error.message}. Is the backend server running?` }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col h-[calc(100vh-64px)] animate-fade-in">
            <header className="mb-6 flex items-center gap-4">
                <GeminiLogo className="w-10 h-10" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-rose-500">
                        Gemini Insights
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Chat with your AI dietician.</p>
                </div>
            </header>
            
            <Card className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#141218] border border-gray-200 dark:border-gray-800/50 p-0 shadow-lg">
                <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-8 space-y-6">
                    {chatHistory.length === 0 ? (
                        <div className="text-center opacity-60 mt-20 flex flex-col items-center">
                            <GeminiLogo className="w-24 h-24 mb-6 opacity-50 grayscale hover:grayscale-0 transition-all duration-700" />
                            <h3 className="text-2xl font-medium mb-2">Hello! I'm your AI health assistant.</h3>
                            <p className="max-w-md">I can analyze your calorie trends based on your logs and profile. Ask me anything about your diet.</p>
                        </div>
                    ) : (
                        chatHistory.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] p-5 rounded-3xl ${
                                    msg.role === 'user' 
                                    ? 'bg-indigo-500 text-white rounded-br-sm shadow-md' 
                                    : 'bg-gray-100 dark:bg-[#1c1b1f] border border-gray-200 dark:border-gray-800 rounded-bl-sm shadow-sm text-gray-900 dark:text-gray-100'
                                }`}>
                                    <div className="whitespace-pre-wrap text-base leading-relaxed">{msg.text}</div>
                                </div>
                            </div>
                        ))
                    )}
                    {isThinking && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 dark:bg-[#1c1b1f] border border-gray-200 dark:border-gray-800 p-5 rounded-3xl rounded-bl-sm flex gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#141218]">
                    <form onSubmit={handleSendChat} className="flex gap-4">
                        <input 
                            type="text" 
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            placeholder="Ask Gemini about your diet..."
                            className="flex-1 bg-white dark:bg-[#1c1b1f] border border-gray-200 dark:border-gray-800 rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg shadow-sm"
                        />
                        <button 
                            type="submit" 
                            disabled={!chatInput.trim() || isThinking}
                            className="bg-indigo-500 text-white p-4 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 relative overflow-hidden group shadow-md"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10">
                                <Icon name="send" size={24} />
                            </div>
                        </button>
                    </form>
                    <div className="text-center mt-4">
                        <button 
                            onClick={() => setChatHistory([])}
                            className="text-sm opacity-50 hover:opacity-100 transition-opacity flex items-center justify-center gap-1 mx-auto"
                        >
                            <Icon name="rotate-ccw" size={14} /> Clear Conversation
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default InsightsPage;
