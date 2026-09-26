import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Moon, 
  Zap, 
  Smile, 
  Monitor, 
  Sparkles, 
  Compass, 
  Calendar, 
  ArrowRight,
  TrendingUp,
  Brain,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCheckIns } from '../services/checkinService';
import { getDiaryEntries } from '../services/diaryService';
import { getWellbeingRecords } from '../services/wellbeingService';
import { getRecommendations } from '../services/activityService';
import { getTodayRoadmap } from '../services/roadmapService';

const Dashboard = () => {
  const [latestCheckIn, setLatestCheckIn] = useState(null);
  const [latestMood, setLatestMood] = useState(null);
  const [latestWellbeing, setLatestWellbeing] = useState(null);
  const [activityRecommendation, setActivityRecommendation] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [checkins, diaries, wellbeings, activities, rm] = await Promise.all([
          getCheckIns().catch(() => []),
          getDiaryEntries().catch(() => []),
          getWellbeingRecords().catch(() => []),
          getRecommendations().catch(() => []),
          getTodayRoadmap().catch(() => null)
        ]);
        if (checkins && checkins.length > 0) setLatestCheckIn(checkins[0]);
        if (diaries && diaries.length > 0) setLatestMood(diaries[0]);
        if (wellbeings && wellbeings.length > 0) setLatestWellbeing(wellbeings[0]);
        if (activities && activities.length > 0) setActivityRecommendation(activities[0]);
        if (rm && rm.status === 'generated') setRoadmap(rm.roadmap);
      } catch (err) {
        console.error("Dashboard data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  let roadmapCompleted = 0;
  let roadmapTotal = 0;
  if (roadmap) {
    ['morning', 'afternoon', 'evening', 'night'].forEach(b => {
      roadmap[b]?.forEach(i => {
        roadmapTotal++;
        if (i.isCompleted) roadmapCompleted++;
      });
    });
  }

  const metrics = [
    { 
      title: 'Sleep Duration', 
      value: latestCheckIn ? `${latestCheckIn.sleepDuration}h` : '7.5h', 
      label: 'Optimal Sleep',
      icon: Moon, 
      gradient: 'from-indigo-500/20 to-purple-500/10',
      iconColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/20'
    },
    { 
      title: 'Stress Score', 
      value: latestCheckIn ? `${latestCheckIn.stressLevel}/10` : '3/10', 
      label: 'Low Stress',
      icon: Activity, 
      gradient: 'from-emerald-500/20 to-teal-500/10',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20'
    },
    { 
      title: 'Current Mood', 
      value: latestMood?.mood || 'Balanced', 
      label: 'Logged Today',
      icon: Smile, 
      gradient: 'from-cyan-500/20 to-blue-500/10',
      iconColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/20'
    },
    { 
      title: 'Screen Time', 
      value: latestWellbeing ? `${latestWellbeing.total_screen_time_hours}h` : '4.2h', 
      label: 'Digital Wellbeing',
      icon: Monitor, 
      gradient: 'from-amber-500/20 to-orange-500/10',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/20'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-8 rounded-3xl bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 left-1/3 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> MindMitra Intelligence Dashboard
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Welcome back to your <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Mental Rhythm</span>
          </h1>
          <p className="text-zinc-400 text-sm max-w-xl">
            Real-time mental wellness tracking, ML-driven stress predictions, and personalized lifestyle recommendations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            to="/check-in"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Daily Check-In</span>
          </Link>
          <Link
            to="/ai-companion"
            className="px-5 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-100 font-semibold text-sm transition-all flex items-center gap-2"
          >
            <Brain className="w-4 h-4 text-emerald-400" />
            <span>Consult Mitra AI</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Prediction + Roadmap + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ML Prediction Card */}
        <div className="p-7 rounded-3xl bg-dark-900/80 backdrop-blur-xl border border-white/10 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                XGBoost ML Score
              </span>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold font-display text-white">Wellbeing Score</h3>
            <p className="text-xs text-zinc-400 mt-1">Generated from your check-in metrics</p>
          </div>

          <div className="my-6 flex items-baseline gap-2">
            <span className="text-6xl font-display font-extrabold bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              {latestCheckIn?.prediction ? latestCheckIn.prediction : '88'}
            </span>
            <span className="text-xl font-medium text-zinc-500">/ 100</span>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-zinc-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> High Recovery Index
            </span>
            <Link to="/check-in" className="text-emerald-400 font-semibold hover:text-emerald-300 flex items-center gap-1">
              Update <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Daily Roadmap Progress */}
        <div className="p-7 rounded-3xl bg-dark-900/80 backdrop-blur-xl border border-white/10 shadow-xl flex flex-col justify-between hover:border-indigo-500/30 transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                Habit Sync
              </span>
              <Calendar className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold font-display text-white">Daily Growth Roadmap</h3>
            <p className="text-xs text-zinc-400 mt-1">Personalized step-by-step itinerary</p>
          </div>

          <div className="my-6 space-y-3">
            <div className="flex justify-between text-xs font-semibold text-zinc-300">
              <span>Completed Goals</span>
              <span className="text-indigo-400">{roadmapCompleted} of {roadmapTotal || 4} Tasks</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-3 p-0.5 border border-white/10 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500 shadow-sm shadow-indigo-500/50" 
                style={{ width: `${roadmapTotal ? Math.round((roadmapCompleted / roadmapTotal) * 100) : 60}%` }}
              ></div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-zinc-400">Customized by Mitra AI</span>
            <Link to="/roadmap" className="text-indigo-400 font-semibold hover:text-indigo-300 flex items-center gap-1">
              View Plan <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Suggested Activity */}
        <div className="p-7 rounded-3xl bg-dark-900/80 backdrop-blur-xl border border-white/10 shadow-xl flex flex-col justify-between hover:border-teal-500/30 transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full">
                Recommended Activity
              </span>
              <Sparkles className="w-5 h-5 text-teal-400" />
            </div>
            <h3 className="text-lg font-bold font-display text-white">Mindful Reset</h3>
            <p className="text-xs text-zinc-400 mt-1">Based on current stress telemetry</p>
          </div>

          <div className="my-6 p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
              {activityRecommendation?.category || 'Breathing & Focus'}
            </p>
            <h4 className="text-base font-bold text-white">
              {activityRecommendation?.title || 'Box Breathing Routine (4-4-4)'}
            </h4>
            <p className="text-xs text-zinc-400">
              {activityRecommendation?.duration_minutes || 5} min • Guided Calm Session
            </p>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-zinc-400">Instant relaxation</span>
            <Link to="/activities" className="text-teal-400 font-semibold hover:text-teal-300 flex items-center gap-1">
              Start Session <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((m, idx) => (
          <div 
            key={idx} 
            className={`p-6 rounded-2xl bg-dark-900/60 backdrop-blur-md border ${m.borderColor} shadow-lg flex flex-col justify-between hover:bg-dark-900/90 transition-all duration-300 group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${m.gradient} border border-white/5 ${m.iconColor}`}>
                <m.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                {m.label}
              </span>
            </div>
            <div>
              <h4 className="text-3xl font-extrabold font-display text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                {m.value}
              </h4>
              <p className="text-xs text-zinc-400 font-medium mt-1">{m.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
