import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { streamChatResponse } from '../services/geminiService';
import { AnalysisResult, ChatMessage } from '../types';

interface ChatWidgetProps {
  contextData: AnalysisResult | null;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ contextData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', content: 'Hi! I can answer questions about your review data. Try asking "What are the biggest complaints?" or "How has sentiment changed recently?".' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      history.push({ role: 'user', content: userMessage.content });

      // Create a placeholder for the model response
      const responseId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: responseId, role: 'model', content: '', isThinking: true }]);

      const stream = streamChatResponse(history, contextData);
      
      let fullContent = '';
      let isFirstChunk = true;

      for await (const chunk of stream) {
        if (chunk) {
          fullContent += chunk;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === responseId 
                ? { ...msg, content: fullContent, isThinking: false } 
                : msg
            )
          );
          if (isFirstChunk) {
              isFirstChunk = false;
              scrollToBottom(); // Scroll on first content
          }
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: 'Sorry, I encountered an error while processing your request.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-[380px] h-[550px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4 flex justify-between items-center text-white">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-semibold">Gemini Assistant</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'} space-x-2`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.role === 'user' ? 'bg-slate-200' : 'bg-indigo-100'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-slate-600" /> : <Bot className="w-5 h-5 text-indigo-600" />}
                  </div>
                  
                  <div className={`p-3 rounded-2xl text-sm leading-relaxed overflow-hidden ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                  }`}>
                    {msg.isThinking ? (
                        <div className="flex items-center space-x-2 text-slate-500">
                             <Sparkles className="w-3 h-3 animate-pulse" />
                             <span className="italic text-xs">Thinking...</span>
                        </div>
                    ) : (
                        <div className={`prose prose-sm max-w-none break-words ${
                            msg.role === 'user' 
                              ? 'prose-invert prose-p:text-white prose-a:text-indigo-200 prose-headings:text-white' 
                              : 'prose-indigo prose-p:text-slate-700 prose-a:text-indigo-600'
                          } [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>ol]:mb-2`}>
                            <ReactMarkdown>
                              {msg.content}
                            </ReactMarkdown>
                        </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-100">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your data..."
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[10px] text-center text-slate-400 mt-2">
              Gemini 3 Pro-Preview
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
            isOpen ? 'bg-slate-700 text-white rotate-90 scale-90 opacity-0 pointer-events-none absolute' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-110'
        }`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>
       {/* Fake button to animate back in if closed */}
       {!isOpen && (
           <div className="absolute inset-0 pointer-events-none" />
       )}
    </div>
  );
};