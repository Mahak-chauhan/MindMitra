import React, { useState, useEffect } from 'react';
import { createDiaryEntry, getDiaryEntries, deleteDiaryEntry } from '../services/diaryService';
import { Smile, Frown, Meh, Trash2, Calendar, Sparkles, BookHeart, Plus, ArrowRight } from 'lucide-react';

const MOODS = [
  { label: 'Excellent', emoji: '🤩', color: 'text-emerald-400' },
  { label: 'Good', emoji: '😊', color: 'text-teal-400' },
  { label: 'Okay', emoji: '😐', color: 'text-indigo-400' },
  { label: 'Poor', emoji: '😔', color: 'text-amber-400' },
  { label: 'Terrible', emoji: '😫', color: 'text-rose-400' },
];

const MoodDiary = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    mood: 'Good',
    intensity: 6,
    note: ''
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const data = await getDiaryEntries();
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching diary entries', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createDiaryEntry(formData);
      setFormData({ mood: 'Good', intensity: 6, note: '' });
      fetchEntries();
    } catch (error) {
      console.error('Error creating entry', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDiaryEntry(id);
      fetchEntries();
    } catch (error) {
      console.error('Error deleting entry', error);
    }
  };

  const getMoodEmoji = (mood) => {
    const match = MOODS.find(m => m.label.toLowerCase() === (mood || '').toLowerCase());
    return match ? match.emoji : '✨';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider">
            <BookHeart className="w-3.5 h-3.5" /> Emotional Self-Awareness
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">Personal Mood Diary</h1>
          <p className="text-zinc-400 text-xs">Track emotional patterns, triggers, and cognitive shifts over time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* New Entry Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-dark-900/80 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white/10 space-y-6 sticky top-20">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" /> Log Emotional State
            </h3>
            
            <div className="space-y-5">
              {/* Mood Select */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Mood State</label>
                <div className="grid grid-cols-5 gap-2">
                  {MOODS.map(m => (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => setFormData({ ...formData, mood: m.label })}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        formData.mood === m.label
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 scale-105'
                          : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/[0.05]'
                      }`}
                    >
                      <span className="text-xl">{m.emoji}</span>
                      <span className="text-[10px] font-semibold">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Intensity Slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Intensity</label>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {formData.intensity} / 10
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  name="intensity" 
                  value={formData.intensity} 
                  onChange={e => setFormData({ ...formData, intensity: parseInt(e.target.value) })} 
                  className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Journal Reflections (optional)</label>
                <textarea 
                  name="note" 
                  rows="4" 
                  value={formData.note} 
                  onChange={e => setFormData({ ...formData, note: e.target.value })} 
                  placeholder="What triggered this emotion? Any notable events?" 
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 resize-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Save Diary Entry</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* History List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-base text-white">Reflections History</h3>
            <span className="text-xs text-zinc-500">{entries.length} Entries Logged</span>
          </div>

          {loading ? (
            <p className="text-zinc-500 text-center py-12 text-sm animate-pulse">Loading mood entries...</p>
          ) : entries.length === 0 ? (
            <div className="bg-dark-900/80 backdrop-blur-2xl rounded-3xl p-12 border border-white/10 text-center">
              <span className="text-4xl block mb-3">📖</span>
              <h4 className="text-base font-bold text-white mb-1">Your Journal is Clear</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                No diary entries yet. Use the panel on the left to capture how you are feeling right now.
              </p>
            </div>
          ) : (
            entries.map(entry => (
              <div 
                key={entry._id} 
                className="bg-dark-900/80 backdrop-blur-2xl rounded-3xl p-5 shadow-xl border border-white/10 flex gap-4 transition-all hover:border-emerald-500/30 group"
              >
                <div className="text-2xl mt-1 flex-shrink-0">
                  {getMoodEmoji(entry.mood)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        {entry.mood} 
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-zinc-400">
                          Intensity: {entry.intensity}/10
                        </span>
                      </h4>
                      <p className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-1">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        {new Date(entry.date).toLocaleString()}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDelete(entry._id)} 
                      className="text-zinc-600 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-white/5 cursor-pointer" 
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {entry.note && (
                    <div className="mt-3 bg-white/[0.02] p-3.5 rounded-2xl text-xs text-zinc-300 border border-white/5 leading-relaxed">
                      {entry.note}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodDiary;
