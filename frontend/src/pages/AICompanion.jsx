import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, getChatHistory } from '../services/chatbotService';
import { getCheckIns } from '../services/checkinService';
import { getTodayRoadmap } from '../services/roadmapService';
import { Send, User, BrainCircuit, Sparkles, Loader2, AlertCircle, Bot, Zap, ArrowRight } from 'lucide-react';

const QUICK_PROMPTS = [
  "Explain my latest rested score prediction",
  "Summarize my sleep and stress pattern",
  "What is on my growth roadmap today?",
  "Suggest a quick 5-minute breathing exercise"
];

const AICompanion = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [error, setError] = useState('');
  
  const [contextSummary, setContextSummary] = useState({ score: null, roadmapStatus: null });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchHistoryAndContext();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchHistoryAndContext = async () => {
    try {
      const [history, checkIns, rm] = await Promise.all([
        getChatHistory().catch(() => []),
        getCheckIns().catch(() => []),
        getTodayRoadmap().catch(() => null)
      ]);
      setMessages(history);
      
      const summary = { score: null, roadmapStatus: 'Not Generated' };
      if (checkIns && checkIns.length > 0) {
        summary.score = checkIns[0]?.prediction ? `${Math.round(checkIns[0].prediction.prediction)} / 100` : 'Active';
      }
      if (rm && rm.status === 'generated') {
        summary.roadmapStatus = 'Generated';
      }
      setContextSummary(summary);
      
    } catch (err) {
      console.error('Failed to load chat context', err);
    } finally {
      setFetchingHistory(false);
    }
  };

  const handleSend = async (e, promptText = null) => {
    if (e) e.preventDefault();
    const textToSend = promptText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage = { role: 'user', message: textToSend, _id: Date.now().toString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const res = await sendMessage(textToSend);
      setMessages(prev => [...prev, { role: 'assistant', message: res.reply, _id: Date.now().toString() + 'r' }]);
    } catch (err) {
      setError(err.message || 'Failed to communicate with Mitra AI. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 h-[calc(100vh-7rem)] animate-fade-in">
      
      {/* Context Sidebar */}
      <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-4">
        <div className="bg-dark-900/80 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
            <Zap className="w-6 h-6 text-zinc-950 stroke-[2.5]" />
          </div>
          <h2 className="font-display text-xl font-bold text-white tracking-tight">Mitra AI</h2>
          <p className="text-xs text-zinc-400 mb-6">Cognitive Assistant & SHAP Explainer</p>
          
          <div className="space-y-3">
            <div className="bg-white/[0.03] rounded-2xl p-3.5 border border-white/5">
              <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-1">Telemetry Status</div>
              <div className="text-sm font-bold text-emerald-400">{contextSummary.score || 'No Check-In Yet'}</div>
            </div>
            <div className="bg-white/[0.03] rounded-2xl p-3.5 border border-white/5">
              <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-1">Growth Roadmap</div>
              <div className="text-sm font-bold text-indigo-400">{contextSummary.roadmapStatus}</div>
            </div>
          </div>
        </div>

        <div className="bg-dark-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl flex-1 overflow-y-auto space-y-3">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">Quick Prompts</h3>
          <div className="space-y-2">
            {QUICK_PROMPTS.map(p => (
              <button 
                key={p} 
                onClick={() => handleSend(null, p)}
                disabled={loading}
                className="w-full text-left text-xs font-medium text-zinc-300 bg-white/[0.02] hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/30 border border-white/5 p-3 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-between group cursor-pointer"
              >
                <span>{p}</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 bg-dark-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 flex flex-col overflow-hidden">
        
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {fetchingHistory ? (
            <div className="h-full flex items-center justify-center text-zinc-400 text-sm gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400" /> Loading conversation memory...
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <Sparkles className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold font-display text-white">Hello, I'm Mitra AI.</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                I analyze your check-in telemetry, explain your SHAP feature importances, and guide your personal growth roadmap.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={msg._id || idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md' 
                    : 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-zinc-950 shadow-md shadow-emerald-500/20'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-100' 
                    : 'bg-white/[0.03] border border-white/5 text-zinc-200 shadow-sm'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.message}</div>
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-zinc-950 flex items-center justify-center flex-shrink-0 shadow-md">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-rose-500/10 text-rose-300 p-4 rounded-2xl flex items-start gap-3 border border-rose-500/30 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <p>{error}</p>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white/[0.01] border-t border-white/5">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Ask Mitra about your score, SHAP model features, or daily roadmap..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-zinc-100 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2.5 w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 flex items-center justify-center shadow-md shadow-emerald-500/20 disabled:opacity-40 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-zinc-500 font-medium">Mitra AI provides wellness insights. Not intended as medical diagnosis.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AICompanion;
