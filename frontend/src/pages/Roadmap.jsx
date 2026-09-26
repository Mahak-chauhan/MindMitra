import React, { useState, useEffect } from 'react';
import { generateRoadmap, getTodayRoadmap, getRoadmapHistory, completeRoadmapItem } from '../services/roadmapService';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Circle, Sun, Sunset, Moon, Coffee, ArrowRight, Sparkles, Compass } from 'lucide-react';

const Roadmap = () => {
  const [activeTab, setActiveTab] = useState('Today');
  const [roadmapStatus, setRoadmapStatus] = useState('loading');
  const [roadmap, setRoadmap] = useState(null);
  const [history, setHistory] = useState([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchToday();
    fetchHistory();
  }, []);

  const fetchToday = async () => {
    try {
      const res = await getTodayRoadmap();
      setRoadmapStatus(res.status);
      if (res.status === 'generated') {
        setRoadmap(res.roadmap);
      }
    } catch (err) {
      console.error('Failed to fetch today roadmap', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await getRoadmapHistory();
      setHistory(res);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateRoadmap();
      await fetchToday();
    } catch (err) {
      console.error('Failed to generate roadmap', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleComplete = async (itemId) => {
    if (!roadmap) return;
    try {
      await completeRoadmapItem(roadmap._id, itemId);
      await fetchToday();
    } catch (err) {
      console.error('Failed to complete item', err);
    }
  };

  const renderBlock = (title, icon, items, color) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-8 relative pl-8 before:content-[''] before:absolute before:left-[11px] before:top-8 before:bottom-[-24px] before:w-0.5 before:bg-white/10 last:before:hidden">
        <div className={`absolute left-0 top-1 p-2 rounded-xl border border-white/10 bg-dark-950 ${color}`}>
          {icon}
        </div>
        <h3 className="text-xs font-bold text-zinc-400 mb-4 uppercase tracking-wider">{title}</h3>
        <div className="space-y-4">
          {items.map(item => (
            <div 
              key={item._id} 
              className={`rounded-2xl p-5 border transition-all ${
                item.isCompleted 
                  ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70' 
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex gap-4">
                <button 
                  onClick={() => !item.isCompleted && handleComplete(item._id)} 
                  className="mt-1 flex-shrink-0 text-zinc-500 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {item.isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Circle className="w-5 h-5" />}
                </button>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`text-base font-bold ${item.isCompleted ? 'text-zinc-500 line-through' : 'text-white'}`}>
                      {item.title}
                    </h4>
                    {item.duration_minutes && (
                      <span className="text-xs font-semibold text-zinc-400 bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-full">
                        {item.duration_minutes}m
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 mb-3 leading-relaxed">{item.description}</p>
                  
                  {item.reason && (
                    <div className="bg-white/[0.02] px-3.5 py-2 rounded-xl border border-white/5 inline-block w-full">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">AI Rationale:</span>
                      <p className="text-xs text-zinc-300 mt-0.5">{item.reason}</p>
                    </div>
                  )}
                  
                  {item.activityId && !item.isCompleted && (
                    <div className="mt-3">
                      <Link to="/activities" className="text-xs font-semibold text-emerald-400 flex items-center gap-1 hover:text-emerald-300 transition-colors">
                        Launch Guided Activity <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-8 rounded-3xl bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" /> Structured Habit Roadmap
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">Personal Roadmap</h1>
          <p className="text-zinc-400 text-xs">Transparent, personalized daily itinerary designed around your bio-rhythm.</p>
        </div>
        
        {/* Tab Toggle */}
        <div className="flex bg-white/[0.03] rounded-2xl p-1.5 border border-white/10 relative z-10">
          <button 
            onClick={() => setActiveTab('Today')} 
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'Today' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 shadow-md shadow-emerald-500/20' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Today's Plan
          </button>
          <button 
            onClick={() => setActiveTab('History')} 
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'History' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 shadow-md shadow-emerald-500/20' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Past History
          </button>
        </div>
      </div>

      {activeTab === 'Today' && (
        <div className="animate-fade-in">
          {roadmapStatus === 'loading' ? (
            <div className="text-center py-16 text-zinc-400 text-sm">
              <span className="animate-pulse">Loading roadmap telemetry...</span>
            </div>
          ) : roadmapStatus === 'not_generated_yet' ? (
            <div className="bg-dark-900/80 backdrop-blur-2xl rounded-3xl p-12 border border-white/10 shadow-2xl text-center relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5 text-indigo-400 shadow-lg shadow-indigo-500/10">
                <Calendar className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold font-display text-white mb-2">Build Your Daily Plan</h2>
              <p className="text-zinc-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                Synthesize your sleep duration, stress score, and screen time to generate an automated morning-to-night wellbeing schedule.
              </p>
              <button 
                onClick={handleGenerate} 
                disabled={generating}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 cursor-pointer"
              >
                {generating ? 'Generating Schedule...' : 'Generate Today\'s Roadmap'}
              </button>
            </div>
          ) : roadmap ? (
            <div className="space-y-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                <p className="text-sm font-semibold text-emerald-300">{roadmap.summaryText}</p>
                <p className="text-[11px] text-zinc-400 mt-1">General wellness practices tailored to your latest check-in data.</p>
              </div>

              <div className="bg-dark-900/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/10">
                {renderBlock('Morning Block', <Coffee className="w-4 h-4" />, roadmap.morning, 'text-amber-400')}
                {renderBlock('Afternoon Block', <Sun className="w-4 h-4" />, roadmap.afternoon, 'text-teal-400')}
                {renderBlock('Evening Block', <Sunset className="w-4 h-4" />, roadmap.evening, 'text-indigo-400')}
                {renderBlock('Night Wind-Down', <Moon className="w-4 h-4" />, roadmap.night, 'text-purple-400')}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {activeTab === 'History' && (
        <div className="bg-dark-900/80 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/10">
          <h2 className="text-lg font-bold font-display text-white mb-6">Historical Roadmaps</h2>
          {history.length === 0 ? (
            <p className="text-zinc-500 text-center py-12 text-sm">No historical roadmaps on record yet.</p>
          ) : (
            <div className="divide-y divide-white/5">
              {history.map(item => (
                <div key={item._id} className="py-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-100">
                      {new Date(item.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">{item.summaryText}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Roadmap;
