import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/profileService';
import { UserCircle, Save, Loader2, AlertCircle, CheckCircle, Sparkles, User, Clock, Dumbbell, Briefcase } from 'lucide-react';

const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary'];
const OCCUPATION_OPTIONS = ['Student', 'Software Engineer', 'Manager', 'Doctor', 'Nurse', 'Sales', 'Teacher', 'Unemployed'];
const WORK_TYPE_OPTIONS = ['Hybrid', 'Remote', 'On-site'];
const WORKOUT_TYPE_OPTIONS = ['Yoga', 'Mixed', 'Strength', 'Cardio'];
const BEDTIME_OPTIONS = ['21:00', '22:00', '23:00', '00:00', '01:00', '02:00'];
const WAKEUP_OPTIONS = ['05:00', '06:00', '07:00', '08:00', '09:00', '10:00'];

const Profile = () => {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    occupation: '',
    work_type: '',
    work_hours_per_day: '',
    commute_time_minutes: '',
    bedtime: '',
    wakeup_time: '',
    workout_type: ''
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setInitialLoading(true);
      const data = await getProfile();
      if (data) {
        setFormData({
          age: data.age !== undefined ? data.age : '',
          gender: data.gender || '',
          occupation: data.occupation || '',
          work_type: data.work_type || '',
          work_hours_per_day: data.work_hours_per_day !== undefined ? data.work_hours_per_day : '',
          commute_time_minutes: data.commute_time_minutes !== undefined ? data.commute_time_minutes : '',
          bedtime: data.bedtime || '',
          wakeup_time: data.wakeup_time || '',
          workout_type: data.workout_type || ''
        });
        updateStatusText(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setInitialLoading(false);
    }
  };

  const updateStatusText = (data) => {
    const totalFields = 9;
    const filledFields = Object.keys(data).filter(k => data[k] !== undefined && data[k] !== '').length;
    if (filledFields === 0) {
      setStatusText("Your baseline profile isn't configured yet.");
    } else if (filledFields < totalFields) {
      setStatusText("Profile is partially configured (" + filledFields + "/" + totalFields + " fields).");
    } else {
      setStatusText("Profile is 100% complete & calibrated with ML models.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const cleanData = {};
    for (const key in formData) {
      if (formData[key] !== '') {
        if (['age', 'work_hours_per_day', 'commute_time_minutes'].includes(key)) {
          cleanData[key] = Number(formData[key]);
        } else {
          cleanData[key] = formData[key];
        }
      }
    }

    if (cleanData.age !== undefined && (cleanData.age < 13 || cleanData.age > 120)) {
      setError('Age must be between 13 and 120.');
      setSaving(false);
      return;
    }
    if (cleanData.work_hours_per_day !== undefined && (cleanData.work_hours_per_day < 0 || cleanData.work_hours_per_day > 24)) {
      setError('Work hours must be between 0 and 24.');
      setSaving(false);
      return;
    }
    if (cleanData.commute_time_minutes !== undefined && (cleanData.commute_time_minutes < 0 || cleanData.commute_time_minutes > 1440)) {
      setError('Commute time must be between 0 and 1440 minutes.');
      setSaving(false);
      return;
    }

    try {
      const res = await updateProfile(cleanData);
      setSuccess('Profile calibrated and saved successfully.');
      updateStatusText(res);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save profile. Please check your inputs.');
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full text-zinc-400 gap-3 py-20">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
        <span className="font-medium text-sm">Loading baseline profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Baseline Profile Telemetry
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">User Profile & Settings</h1>
          <p className="text-zinc-400 text-xs">Configure your daily work, commute, and sleep routine to personalize ML predictions.</p>
        </div>
      </div>

      <div className="bg-dark-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-8 space-y-8">
        
        {/* Status Indicator */}
        <div className={`p-4 rounded-2xl flex items-center border ${
          statusText.includes('100% complete') 
            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
            : 'bg-white/[0.02] text-zinc-300 border-white/10'
        }`}>
          {statusText.includes('100% complete') ? (
            <CheckCircle className="w-5 h-5 mr-3 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-3 text-amber-400 flex-shrink-0" />
          )}
          <span className="font-semibold text-xs">{statusText}</span>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 text-rose-300 rounded-2xl border border-rose-500/30 flex items-start text-xs font-medium">
            <AlertCircle className="w-4 h-4 mr-2.5 flex-shrink-0 mt-0.5 text-rose-400" />
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="p-4 bg-emerald-500/10 text-emerald-300 rounded-2xl border border-emerald-500/30 flex items-start text-xs font-medium">
            <CheckCircle className="w-4 h-4 mr-2.5 flex-shrink-0 mt-0.5 text-emerald-400" />
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section: ABOUT YOU */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 border-b border-white/5 pb-2">
              <User className="w-4 h-4" /> Personal Demographics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Age</label>
                <input 
                  type="number" 
                  name="age" 
                  min="13" max="120"
                  value={formData.age} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20" 
                  placeholder="e.g. 25"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Gender</label>
                <select 
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-white/10 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Select Gender</option>
                  {GENDER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Occupation</label>
                <select 
                  name="occupation" 
                  value={formData.occupation} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-white/10 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Select Occupation</option>
                  {OCCUPATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Section: YOUR ROUTINE */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2 border-b border-white/5 pb-2">
              <Briefcase className="w-4 h-4" /> Work & Daily Routine
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Work Type</label>
                <select 
                  name="work_type" 
                  value={formData.work_type} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-white/10 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Select Work Type</option>
                  {WORK_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Typical Work Hours / Day</label>
                <input 
                  type="number" 
                  name="work_hours_per_day" 
                  min="0" max="24" step="0.5"
                  value={formData.work_hours_per_day} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20" 
                  placeholder="e.g. 8"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Commute Time (Minutes)</label>
                <input 
                  type="number" 
                  name="commute_time_minutes" 
                  min="0" max="1440"
                  value={formData.commute_time_minutes} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20" 
                  placeholder="e.g. 45"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Typical Bedtime</label>
                <select 
                  name="bedtime" 
                  value={formData.bedtime} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-white/10 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Select Time</option>
                  {BEDTIME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Typical Wake-Up</label>
                <select 
                  name="wakeup_time" 
                  value={formData.wakeup_time} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-white/10 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Select Time</option>
                  {WAKEUP_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Section: MOVEMENT */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2 border-b border-white/5 pb-2">
              <Dumbbell className="w-4 h-4" /> Movement & Physical Activity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Preferred Workout</label>
                <select 
                  name="workout_type" 
                  value={formData.workout_type} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-white/10 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Select Workout</option>
                  {WORKOUT_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
          </section>

          <div className="flex justify-end pt-4 border-t border-white/5">
            <button 
              type="submit" 
              disabled={saving}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {saving ? 'Saving Telemetry...' : 'Save Profile Telemetry'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Profile;
