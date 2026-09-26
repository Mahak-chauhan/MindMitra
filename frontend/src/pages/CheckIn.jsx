import React, { useState } from 'react';
import { useCheckIn } from '../hooks/useCheckIn';
import { TrendingUp, AlertCircle, CheckCircle2, Activity, Moon, Monitor, Smile, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import DataQualityIndicator from '../components/DataQualityIndicator';

const FEATURE_LABELS = {
  sleep_duration: "Sleep Duration",
  stress_level: "Stress Level",
  night_screen_time_minutes: "Night Screen Time",
  physical_activity_minutes: "Physical Activity",
  alcohol_consumption_drinks: "Alcohol Consumption"
};

const CheckIn = () => {
  const { submitCheckIn, loading, error, result, recommendations } = useCheckIn();
  
  const [formData, setFormData] = useState({
    sleepDuration: 7.5,
    stressLevel: 4,
    nightScreenTimeMinutes: 30,
    physicalActivityMinutes: 45,
    mood: 'Good',
    energyLevel: 'Moderate'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: (name === 'mood' || name === 'energyLevel') ? value : parseFloat(value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitCheckIn(formData);
  };

  const moodOptions = [
    { label: 'Excellent', emoji: '🤩', color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400' },
    { label: 'Good', emoji: '😊', color: 'from-teal-500/20 to-cyan-500/10 border-teal-500/30 text-teal-400' },
    { label: 'Okay', emoji: '😐', color: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-400' },
    { label: 'Poor', emoji: '😔', color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400' },
    { label: 'Terrible', emoji: '😫', color: 'from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-400' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Daily Telemetry & Rested Baseline
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">
            Daily Wellbeing Check-In
          </h1>
          <p className="text-zinc-400 text-sm max-w-xl">
            Log your sleep, stress, and mood metrics to feed your personal XGBoost machine learning model.
          </p>
        </div>
      </div>
      
      {!result ? (
        <form onSubmit={handleSubmit} className="bg-dark-900/80 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl space-y-8">
          
          <div className="space-y-8">
            {/* Sleep Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-400" /> Sleep Duration (Hours)
                </label>
                <span className="text-base font-bold font-display text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  {formData.sleepDuration} hrs
                </span>
              </div>
              <input 
                type="range" 
                step="0.5" 
                min="0" 
                max="14" 
                name="sleepDuration" 
                value={formData.sleepDuration} 
                onChange={handleChange} 
                className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
              />
            </div>

            {/* Stress Level Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-400" /> Stress Perception (1 = Deep Calm, 10 = High Tension)
                </label>
                <span className={`text-base font-bold font-display px-3 py-1 rounded-full border ${formData.stressLevel > 6 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                  {formData.stressLevel} / 10
                </span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                name="stressLevel" 
                value={formData.stressLevel} 
                onChange={handleChange} 
                className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
              />
            </div>

            {/* Mood Pills Selector */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Smile className="w-4 h-4 text-teal-400" /> Current Mood State
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {moodOptions.map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, mood: m.label }))}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      formData.mood === m.label 
                        ? `bg-gradient-to-b ${m.color} shadow-lg shadow-black/50 scale-[1.02]` 
                        : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-xs font-semibold">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Night Screen Time & Physical Activity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-cyan-400" /> Night Screen Time (Minutes)
                </label>
                <input 
                  type="number" 
                  name="nightScreenTimeMinutes" 
                  value={formData.nightScreenTimeMinutes} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" /> Physical Activity (Minutes)
                </label>
                <input 
                  type="number" 
                  name="physicalActivityMinutes" 
                  value={formData.physicalActivityMinutes} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20" 
                  required 
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl flex items-start gap-3 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <p>{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Running Machine Learning Pipeline...</span>
            ) : (
              <>
                <span>Save Check-In & Compute Prediction</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-center gap-4 text-emerald-300">
            <CheckCircle2 className="w-8 h-8 flex-shrink-0 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base text-white">Check-In Telemetry Processed</h3>
              <p className="text-xs text-zinc-400">Your metrics have been logged and passed to the XGBoost inference engine.</p>
            </div>
          </div>

          {result.prediction ? (
            <>
              {/* Score Showcase */}
              <div className="bg-dark-900/80 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl text-center relative overflow-hidden">
                <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-2">Estimated Rested-State Score</h3>
                <div className="text-7xl font-display font-extrabold bg-gradient-to-r from-white via-emerald-200 to-teal-400 bg-clip-text text-transparent my-4">
                  {Math.round(result.prediction.prediction)}
                </div>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Computed by XGBoost regression model based on sleep, stress, and lifestyle features.
                </p>
                <div className="mt-6 text-left">
                  <DataQualityIndicator dataQuality={result.dataQuality} />
                </div>
              </div>

              {/* SHAP Explanation Card */}
              <div className="bg-dark-900/80 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-400" /> SHAP Feature Attribution
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Primary factors influencing your prediction vs baseline</p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase">
                    SHAP Explainability
                  </span>
                </div>

                <div className="space-y-3">
                  {result.prediction.ranked_contributions.slice(0, 5).map((factor, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-8 rounded-full ${factor.direction === 'positive' ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-rose-400 shadow-sm shadow-rose-400/50'}`} />
                        <div>
                          <p className="font-semibold text-sm text-zinc-100">{FEATURE_LABELS[factor.feature] || factor.feature}</p>
                          <p className="text-xs text-zinc-400">Input value: {factor.transformed_value}</p>
                        </div>
                      </div>
                      <div className={`font-bold text-sm ${factor.direction === 'positive' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {factor.direction === 'positive' ? '+' : ''}{factor.contribution.toFixed(1)} pts
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 text-amber-300 flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-white">Check-in Logged Successfully</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Your record was saved to the database. The ML inference engine is currently offline.</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link 
              to="/roadmap"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              <span>Build Growth Roadmap</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button 
              onClick={() => window.location.reload()} 
              className="px-8 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 font-semibold text-sm transition-all"
            >
              Start New Check-In
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckIn;
