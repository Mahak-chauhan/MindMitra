import React, { useState, useEffect } from 'react';
import { createWellbeingRecord, getWellbeingRecords, deleteWellbeingRecord } from '../services/wellbeingService';
import { Monitor, Smartphone, Clock, TrendingUp, AlertCircle, Trash2, Sparkles, Plus, ArrowRight, ShieldCheck } from 'lucide-react';

const DigitalWellbeing = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [latestBaseline, setLatestBaseline] = useState(null);
  
  const [formData, setFormData] = useState({
    total_screen_time_hours: 4.5,
    social_media_minutes: 60,
    night_screen_time_minutes: 30,
    most_used_category: 'Work',
    most_used_app: '',
    notes: ''
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const data = await getWellbeingRecords();
      setRecords(data || []);
    } catch (err) {
      console.error('Failed to fetch records', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await createWellbeingRecord(formData);
      if (response && response.baseline) {
        setLatestBaseline(response.baseline);
      }
      fetchRecords();
      setFormData(prev => ({ ...prev, notes: '', most_used_app: '' }));
    } catch (err) {
      setError(err.message || 'Failed to save digital wellbeing data.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteWellbeingRecord(id);
      fetchRecords();
      setLatestBaseline(null);
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Monitor className="w-3.5 h-3.5" /> Screen Time & Blue Light Tracking
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">Digital Wellbeing</h1>
          <p className="text-zinc-400 text-xs">Analyze screen exposure and night digital habits to optimize sleep and focus.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1 space-y-6">
          <form onSubmit={handleSubmit} className="bg-dark-900/80 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white/10 space-y-5 sticky top-20">
            <h3 className="font-bold text-base text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <Plus className="w-4 h-4 text-cyan-400" /> Log Today's Screen Usage
            </h3>
            
            {error && (
              <div className="bg-rose-500/10 text-rose-300 p-3.5 rounded-xl flex items-start gap-2 text-xs font-medium border border-rose-500/30">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-400" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Total Screen Time (Hours)</label>
                <input 
                  type="number" 
                  step="0.5" 
                  min="0" 
                  max="24" 
                  name="total_screen_time_hours" 
                  value={formData.total_screen_time_hours} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-zinc-100 text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Social Media (Minutes)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="1440" 
                  name="social_media_minutes" 
                  value={formData.social_media_minutes} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-zinc-100 text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20" 
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Night Screen Time (Minutes)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="1440" 
                  name="night_screen_time_minutes" 
                  value={formData.night_screen_time_minutes} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-zinc-100 text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20" 
                  required 
                />
                <p className="text-[10px] text-zinc-500 mt-1">Screen usage within 2 hours of sleep.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Primary App Category</label>
                <select 
                  name="most_used_category" 
                  value={formData.most_used_category} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-white/10 text-zinc-100 text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
                >
                  <option value="Work">Work & Productivity</option>
                  <option value="Social">Social Media</option>
                  <option value="Entertainment">Entertainment & Video</option>
                  <option value="Education">Education & Reading</option>
                  <option value="Communication">Communication & Chat</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-zinc-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Save Digital Log</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Baseline Card */}
          {latestBaseline && (
            <div className="bg-dark-900/80 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-2xl">
              <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> 30-Day Digital Baseline
              </h3>
              {latestBaseline.status === 'insufficient_data' ? (
                <p className="text-xs text-zinc-400">{latestBaseline.message}</p>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center">
                    <span className="text-xs text-zinc-400">Avg Screen Time</span>
                    <span className="text-sm font-bold text-white">{latestBaseline.metrics.screenTime}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center">
                    <span className="text-xs text-zinc-400">Avg Social Media</span>
                    <span className="text-sm font-bold text-white">{latestBaseline.metrics.socialMedia}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center">
                    <span className="text-xs text-zinc-400">Avg Night Exposure</span>
                    <span className="text-sm font-bold text-white">{latestBaseline.metrics.nightScreenTime}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* History Records */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-base text-white">Recent Digital Telemetry</h3>
            <span className="text-xs text-zinc-500">{records.length} Records</span>
          </div>
          
          {loading ? (
            <p className="text-zinc-500 text-center py-12 text-sm animate-pulse">Loading usage history...</p>
          ) : records.length === 0 ? (
            <div className="bg-dark-900/80 backdrop-blur-2xl rounded-3xl p-12 border border-white/10 text-center shadow-2xl">
              <Monitor className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white mb-1">No Usage Logged Yet</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Track your hours using the form on the left to analyze correlation with sleep quality and focus.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {records.map(record => (
                <div 
                  key={record._id} 
                  className="bg-dark-900/80 backdrop-blur-2xl rounded-3xl p-6 shadow-xl border border-white/10 relative group transition-all hover:border-cyan-500/30"
                >
                  <button 
                    onClick={() => handleDelete(record._id)} 
                    className="absolute top-4 right-4 text-zinc-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-xs font-semibold text-zinc-400">
                      {new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col items-center p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                      <Monitor className="w-4 h-4 text-cyan-400 mb-1" />
                      <span className="text-xl font-bold font-display text-white">{record.total_screen_time_hours}h</span>
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold">Total Screen</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                      <Smartphone className="w-4 h-4 text-amber-400 mb-1" />
                      <span className="text-xl font-bold font-display text-white">{record.social_media_minutes}m</span>
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold">Social Apps</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                      <Clock className="w-4 h-4 text-indigo-400 mb-1" />
                      <span className="text-xl font-bold font-display text-white">{record.night_screen_time_minutes}m</span>
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold">Bedtime Screen</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DigitalWellbeing;
