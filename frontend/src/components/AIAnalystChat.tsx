import React, { useState } from 'react';
import { Send, Sparkles, Bot, User, ShieldAlert, CornerDownLeft, Database, CheckCircle2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { api } from '../services/api';

export const AIAnalystChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am your **PayGuard AI Risk Analyst**. I have full contextual grounding in the live transaction ledger and deterministic risk signals. Ask me anything about suspicious patterns, specific transaction IDs, or overall fraud distributions.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const starterQueries = [
    "Show me the top 3 highest-risk transactions.",
    "Why was transaction TX-9901 blocked?",
    "What are the most common risk factors today?",
    "Explain why midnight transactions are treated as high risk.",
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await api.askAnalyst(textToSend, history);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Analyst chat error:", err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an issue querying the dataset. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800/90 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-500/15 border border-purple-500/30 rounded-xl text-purple-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">AI Risk Intelligence Analyst</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                Powered by Gemini Flash
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Grounded conversational query engine over live payment telemetry and audit logs
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <Database className="w-3.5 h-3.5 text-blue-400" />
          <span>Real-Time Dataset Grounding</span>
        </div>
      </div>

      {/* Suggested Starter Prompts */}
      <div className="flex flex-wrap gap-2">
        {starterQueries.map((query, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(query)}
            disabled={loading}
            className="text-xs bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700/80 transition flex items-center space-x-1.5"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>{query}</span>
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="glass-panel rounded-2xl border border-slate-800/90 flex flex-col h-[520px] overflow-hidden">
        
        {/* Messages List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none'
              }`}>
                <div className="whitespace-pre-line">{msg.content}</div>
                <div className={`text-[10px] mt-2 text-right ${
                  msg.role === 'user' ? 'text-blue-200' : 'text-slate-500'
                }`}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex space-x-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl rounded-bl-none p-4 text-xs text-slate-400 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[11px] text-slate-400 ml-1">Analyzing database telemetry...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask the AI Risk Analyst about transactions, anomaly trends, or customer patterns..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-slate-950 text-slate-100 placeholder-slate-500 text-xs px-4 py-3 rounded-xl border border-slate-700/80 focus:border-purple-500 focus:outline-none transition"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-lg shadow-purple-500/20 transition disabled:opacity-50 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
