import React, { useState, useEffect } from 'react';
import { getActivities, getRecommendations, startActivity, completeActivity, getActivityHistory } from '../services/activityService';
import { Play, CheckCircle2, Clock, Filter, Star, Heart, Award, Sparkles, X, Activity } from 'lucide-react';

const CATEGORIES = ['All', 'Breathing', 'Meditation', 'Movement', 'Relaxation', 'Music', 'Sleep Routine'];

const DEFAULT_FALLBACKS = [
  { _id: 'f1', title: 'Box Breathing (4-4-4)', category: 'Breathing', duration_minutes: 5, description: 'Calm the central nervous system with equal ratio breathing.', instructions: 'Inhale for 4 seconds, hold for 4, exhale for 4, hold for 4. Repeat smoothly.' },
  { _id: 'f2', title: '5-Minute Mindful Centering', category: 'Meditation', duration_minutes: 5, description: 'Anchor your attention in the present moment through breath awareness.', instructions: 'Sit tall, close your eyes, and focus your attention on the flow of your breath.' },
  { _id: 'f3', title: 'Desk Release Stretch', category: 'Movement', duration_minutes: 5, description: 'Relieve neck, spine, and shoulder tension from prolonged screen work.', instructions: 'Gently tilt neck side to side, roll shoulders back 10 times, twist torso gently.' },
  { _id: 'f4', title: 'Ambient Focus Audio', category: 'Music', duration_minutes: 15, description: 'Alpha wave soundscapes designed to sharpen cognitive focus.', instructions: 'Put on headphones, minimize tabs, and let the ambient soundscapes guide concentration.' },
  { _id: 'f5', title: 'Progressive Muscle Relaxation', category: 'Relaxation', duration_minutes: 10, description: 'Systematically release stored tension throughout all muscle groups.', instructions: 'Tense each muscle group for 5 seconds, exhale and release completely.' },
  { _id: 'f6', title: 'Digital Blue-Light Detox', category: 'Sleep Routine', duration_minutes: 20, description: 'Wind down your eyes and brain before restful sleep.', instructions: 'Dim lights, step away from all screens, practice gentle breathing in bed.' },
];

const Activities = () => {
  const [activeTab, setActiveTab] = useState('Catalog');
  const [activities, setActivities] = useState([]);
  const [history, setHistory] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const [activeSession, setActiveSession] = useState(null);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catData, histData, recData] = await Promise.all([
        getActivities().catch(() => []),
        getActivityHistory().catch(() => []),
        getRecommendations().catch(() => [])
      ]);
      setActivities(catData && catData.length > 0 ? catData : DEFAULT_FALLBACKS);
      setHistory(histData || []);
      setRecommended(recData || []);
    } catch (err) {
      console.error('Error fetching activities data', err);
      setActivities(DEFAULT_FALLBACKS);
    }
  };

  const handleStart = async (activity) => {
    try {
      const log = await startActivity(activity._id).catch(() => ({ _id: 'mock-log-' + Date.now() }));
      setActiveSession({ activity, logId: log._id, timer: activity.duration_minutes * 60, status: 'running' });
    } catch (err) {
      console.error('Failed to start activity', err);
    }
  };

  const handleComplete = async () => {
    if (!activeSession) return;
    try {
      await completeActivity(activeSession.logId, rating || null).catch(() => {});
      setActiveSession(null);
      setRating(0);
      fetchData();
      setActiveTab('History');
    } catch (err) {
      console.error('Failed to complete activity', err);
    }
  };

  const filteredActivities = categoryFilter === 'All' 
    ? activities 
    : activities.filter(a => a.category === categoryFilter);

  // Active Session View
  if (activeSession) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 pb-12 text-center pt-8 animate-fade-in">
        <div className="bg-dark-900/80 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 text-emerald-400 shadow-lg shadow-emerald-500/10">
            <Heart className="w-8 h-8 animate-pulse" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            {activeSession.activity.category}
          </span>

          <h2 className="text-3xl font-display font-bold text-white mt-3 mb-2">{activeSession.activity.title}</h2>
          <p className="text-sm text-zinc-400 mb-8 max-w-lg mx-auto leading-relaxed">
            {activeSession.activity.instructions || activeSession.activity.description}
          </p>
          
          <div className="text-xs font-semibold text-zinc-400 mb-8 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" /> Target Duration: {activeSession.activity.duration_minutes} minutes
          </div>

          {activeSession.status === 'running' ? (
            <button 
              onClick={() => setActiveSession({...activeSession, status: 'rating'})} 
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 cursor-pointer"
            >
              Complete Exercise
            </button>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-bold font-display text-white">Session Finished! How do you feel?</h3>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    key={star} 
                    onClick={() => setRating(star)} 
                    className="focus:outline-none hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star className={`w-8 h-8 ${rating >= star ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'}`} />
                  </button>
                ))}
              </div>
              <button 
                onClick={handleComplete} 
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 mx-auto cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Save to Progress History
              </button>
            </div>
          )}

          <div className="mt-6">
            <button 
              onClick={() => setActiveSession(null)} 
              className="text-zinc-500 hover:text-zinc-300 text-xs font-semibold"
            >
              Cancel Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-8 rounded-3xl bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Guided Wellness Practices
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">Mindful Activities</h1>
          <p className="text-zinc-400 text-xs">Curated micro-practices for nervous system regulation, breathing, and focus.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/[0.03] rounded-2xl p-1.5 border border-white/10 relative z-10">
          <button 
            onClick={() => setActiveTab('Catalog')} 
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'Catalog' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 shadow-md shadow-emerald-500/20' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Practice Catalog
          </button>
          <button 
            onClick={() => setActiveTab('History')} 
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'History' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 shadow-md shadow-emerald-500/20' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            My Activity History
          </button>
        </div>
      </div>

      {activeTab === 'Catalog' && (
        <div className="space-y-8">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mr-2 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  categoryFilter === c
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-sm'
                    : 'bg-white/[0.02] border border-white/5 text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Activities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map(activity => (
              <div 
                key={activity._id} 
                className="p-6 rounded-3xl bg-dark-900/80 backdrop-blur-xl border border-white/10 shadow-xl flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 group"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      {activity.category}
                    </span>
                    <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" /> {activity.duration_minutes}m
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors mb-2">
                    {activity.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                    {activity.description}
                  </p>
                </div>
                
                <button 
                  onClick={() => handleStart(activity)} 
                  className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-emerald-500 hover:text-zinc-950 border border-white/10 hover:border-emerald-500 text-zinc-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm group-hover:shadow-emerald-500/20"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Start Practice
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'History' && (
        <div className="bg-dark-900/80 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/10">
          <h2 className="text-lg font-bold font-display text-white mb-6">Completed Wellness Sessions</h2>
          {history.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 text-sm">
              <CheckCircle2 className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p>No completed activities recorded yet.</p>
              <button onClick={() => setActiveTab('Catalog')} className="mt-3 text-emerald-400 font-semibold text-xs hover:underline cursor-pointer">
                Explore Practice Catalog &rarr;
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {history.map(log => (
                <div key={log._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase">
                        {log.status}
                      </span>
                      <span className="text-xs text-zinc-500">{new Date(log.startedAt).toLocaleString()}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{log.activity?.title || 'Guided Practice'}</h4>
                    <p className="text-xs text-zinc-400">{log.activity?.category}</p>
                  </div>
                  {log.rating && (
                    <div className="flex gap-1">
                      {[...Array(log.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Activities;
