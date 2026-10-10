import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatBot = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [suggestedQuestions] = useState([
        "⚡ How does ESP8266 telemetry work?",
        "🧠 What is Explainable AI (SHAP)?",
        "🔒 How is patient data protected?",
        "🩺 How do I book a doctor appointment?"
    ]);
    const chatContainerRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const toggleChat = () => {
        const newState = !isChatOpen;
        setIsChatOpen(newState);
        
        if (newState && messages.length === 0) {
            setMessages([{
                text: "Hello! I am your CareSync Clinical AI Assistant powered by Gemini 2.5 Flash. I can help answer questions about our ESP8266 IoT sensors, Lead II ECG telemetry, SHAP AI risk analysis, and appointment booking. How can I assist you today?",
                sender: "bot",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }
        
        if (newState && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 300);
        }
    };

    const handleSendMessage = async (textToSend) => {
        const query = textToSend || inputMessage;
        if (!query.trim() || isLoading) return;

        const userMessage = {
            text: query,
            sender: "user",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        if (!textToSend) setInputMessage("");
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: query }),
            });

            const data = await response.json();
            
            const botMessage = {
                text: data.response || "I'm currently unable to retrieve AI response. Please try again shortly.",
                sender: "bot",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Error calling chat API:", error);
            const errorMessage = {
                text: "CareSync AI is momentarily offline. Please check your network connection and try again.",
                sender: "bot",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const clearChat = () => {
        setMessages([{
            text: "Chat cleared. I'm ready for your questions about CareSync AI & Telemetry!",
            sender: "bot",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            <AnimatePresence>
                {!isChatOpen ? (
                    <motion.button
                        key="launcher"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleChat}
                        className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-xl group"
                        aria-label="Open CareSync AI Assistant"
                    >
                        <div className="w-8 h-8 rounded-lg bg-slate-950/80 p-1 flex items-center justify-center border border-white/20 shadow-md">
                            <img src="/Logo.svg" alt="CareSync AI Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="absolute -top-1 -right-1 bg-emerald-400 w-4 h-4 rounded-full border-2 border-slate-950 animate-pulse shadow-[0_0_10px_#34d399]"></span>
                    </motion.button>
                ) : isMinimized ? (
                    <motion.div 
                        key="minimized"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        className="bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden w-72 backdrop-blur-2xl"
                    >
                        <div className="bg-slate-950 p-3.5 flex justify-between items-center border-b border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399]"></span>
                                <span className="font-bold text-xs text-white">CareSync AI</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsMinimized(false)} className="text-slate-400 hover:text-white text-xs">🗖</button>
                                <button onClick={toggleChat} className="text-slate-400 hover:text-white text-xs">&times;</button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="expanded"
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="bg-slate-950/95 border border-slate-800 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] w-80 sm:w-96 h-[540px] flex flex-col backdrop-blur-2xl overflow-hidden"
                    >
                        {/* Header Bar */}
                        <div className="bg-slate-900/90 border-b border-slate-800 p-4 flex justify-between items-center">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-700 p-1 flex items-center justify-center shadow-md">
                                    <img src="/Logo.svg" alt="CareSync Logo" className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-extrabold text-sm text-white tracking-tight leading-none">CareSync AI</h3>
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399]"></span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setIsMinimized(true)}
                                    className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center text-xs transition-colors"
                                    title="Minimize"
                                >
                                    ⎯
                                </button>
                                <button 
                                    onClick={clearChat}
                                    className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center text-xs transition-colors"
                                    title="Clear Chat"
                                >
                                    🗑️
                                </button>
                                <button 
                                    onClick={toggleChat}
                                    className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center text-sm font-bold transition-colors"
                                    title="Close"
                                >
                                    &times;
                                </button>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800">
                            {messages.map((msg, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                                        msg.sender === 'user' 
                                            ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 text-white rounded-br-none shadow-lg' 
                                            : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
                                    }`}>
                                        <p className="whitespace-pre-line font-medium">
                                            {typeof msg.text === 'string' 
                                                ? msg.text.replace(/\*{2,3}/g, "").replace(/^\s*\*\s+/gm, "• ").replace(/\*/g, "").replace(/^#+\s*/gm, "")
                                                : msg.text}
                                        </p>
                                        <span className={`text-[9px] mt-1.5 block text-right font-mono ${
                                            msg.sender === 'user' ? 'text-blue-200' : 'text-slate-500'
                                        }`}>
                                            {msg.timestamp}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl rounded-bl-none">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                            <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Action Chips */}
                        {messages.length <= 2 && (
                            <div className="px-4 py-2 border-t border-slate-900/80 bg-slate-950/60">
                                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-extrabold mb-2">Suggested Topics:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {suggestedQuestions.map((q, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSendMessage(q)}
                                            className="text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-teal-500/40 px-2.5 py-1 rounded-xl transition-all text-left truncate max-w-full"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input Container */}
                        <div className="p-3 bg-slate-950 border-t border-slate-800">
                            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-2xl p-1.5 focus-within:border-teal-400 focus-within:ring-1 focus-within:ring-teal-400 transition-all shadow-inner">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask CareSync AI..."
                                    style={{ color: '#ffffff', backgroundColor: '#0f172a' }}
                                    className="flex-1 text-sm text-white placeholder-slate-400 px-3.5 py-2 focus:outline-none rounded-xl border-none font-medium"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={() => handleSendMessage()}
                                    disabled={isLoading || !inputMessage.trim()}
                                    className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white p-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChatBot;