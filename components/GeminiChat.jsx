const GeminiChat = ({ isOpen, onClose, profile, logs, chatHistory, setChatHistory }) => {
    const [chatInput, setChatInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const chatScrollRef = useRef(null);

    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [chatHistory, isOpen]);

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

            const payload = {
                system_instruction: {
                    parts: [{ text: systemContext }]
                },
                contents: newHistory.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                }))
            };

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col animate-slide-in-right">
                
                {/* Chat Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-indigo-500 text-white">
                    <div className="flex items-center gap-3">
                        <Icon name="sparkles" />
                        <h2 className="text-xl font-bold">Gemini Insights</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
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
    );
};
