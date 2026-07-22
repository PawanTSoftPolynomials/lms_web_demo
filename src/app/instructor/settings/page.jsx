'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Save, Bell, Shield, User, Globe, Moon } from 'lucide-react';

export default function InstructorSettingsPage() {
  const { user } = useAuth();
  
  const [successMsg, setSuccessMsg] = useState('');
  
  // Notification states
  const [notifications, setNotifications] = useState({
    assignmentSubmissions: true,
    quizCompletions: true,
    systemAnnouncements: true,
    studentMessages: true,
    weeklyDigest: false
  });

  // Profile preferences
  const [preferences, setPreferences] = useState({
    theme: 'Dark',
    language: 'English',
    timezone: 'UTC+5:30 (IST)'
  });

  const handleToggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePreferenceChange = (key, val) => {
    setPreferences(prev => ({ ...prev, [key]: val }));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSuccessMsg('Settings saved successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col bg-[#080B11] pb-10">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#1A1F35] pb-4">
        <div>
          <h1 className="text-sm font-black text-slate-400 uppercase tracking-widest font-mono">
            Instructor Settings
          </h1>
          <p className="text-[10px] text-slate-550 font-semibold mt-0.5">
            Configure your workspace and notification preferences
          </p>
        </div>
        <Link href="/instructor/dashboard" className="text-[10px] font-black text-slate-500 hover:text-slate-350 flex items-center gap-1">
          &larr; Back to Dashboard
        </Link>
      </div>

      <form onSubmit={handleSaveSettings} className="max-w-2xl mt-4 space-y-6">
        
        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 text-xs font-black rounded-xl animate-pulse">
            ✓ {successMsg}
          </div>
        )}

        {/* 1. Account settings */}
        <div className="bg-[#0D1021] border border-[#1A1F35] rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono flex items-center gap-2">
            <User size={13} className="text-orange-400" /> Account Profile
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9.5px] font-black text-slate-500 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                disabled
                value={user?.name || 'Instructor'}
                className="w-full bg-[#080B11] border border-[#1A1F35] text-xs px-3.5 py-2.5 rounded-xl text-slate-400 cursor-not-allowed"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9.5px] font-black text-slate-500 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || 'instructor@lms.com'}
                className="w-full bg-[#080B11] border border-[#1A1F35] text-xs px-3.5 py-2.5 rounded-xl text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* 2. Notification Preferences */}
        <div className="bg-[#0D1021] border border-[#1A1F35] rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono flex items-center gap-2">
            <Bell size={13} className="text-orange-400" /> Notification Preferences
          </h2>

          <div className="divide-y divide-[#1A1F35]/60 space-y-3.5">
            {[
              { key: 'assignmentSubmissions', label: 'Assignment submissions', desc: 'Notify when a student submits an assignment for review' },
              { key: 'quizCompletions', label: 'Quiz completions', desc: 'Notify when a quiz attempt is submitted by a student' },
              { key: 'systemAnnouncements', label: 'Institute Announcements', desc: 'Notify of system maintenance and critical administrative announcements' },
              { key: 'studentMessages', label: 'Student messages', desc: 'Notify of new private messages in the Messaging Center' },
              { key: 'weeklyDigest', label: 'Weekly learning digest', desc: 'Receive a weekly email summarizing course completion rates and struggles concepts' }
            ].map((item, idx) => (
              <div key={item.key} className={`flex justify-between items-center gap-4 ${idx > 0 ? 'pt-3.5' : ''}`}>
                <div>
                  <p className="text-xs font-extrabold text-slate-200">{item.label}</p>
                  <p className="text-[9.5px] text-slate-500 font-semibold mt-0.5 leading-normal">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotification(item.key)}
                  className={`w-9 h-5 rounded-full p-0.5 transition cursor-pointer shrink-0 ${
                    notifications[item.key] ? 'bg-orange-500' : 'bg-slate-700/80'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition transform ${
                    notifications[item.key] ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Preferences */}
        <div className="bg-[#0D1021] border border-[#1A1F35] rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono flex items-center gap-2">
            <Globe size={13} className="text-orange-400" /> System Preferences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[9.5px] font-black text-slate-500 uppercase tracking-wider">Interface Language</label>
              <select
                value={preferences.language}
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                className="w-full bg-[#080B11] border border-[#1A1F35] text-xs px-3.5 py-2.5 rounded-xl text-slate-200 outline-none focus:border-slate-750"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Spanish">Spanish (Español)</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-[9.5px] font-black text-slate-500 uppercase tracking-wider">Timezone</label>
              <select
                value={preferences.timezone}
                onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                className="w-full bg-[#080B11] border border-[#1A1F35] text-xs px-3.5 py-2.5 rounded-xl text-slate-200 outline-none focus:border-slate-750"
              >
                <option value="UTC+5:30 (IST)">UTC+5:30 (IST)</option>
                <option value="UTC+0:00 (GMT)">UTC+0:00 (GMT)</option>
                <option value="UTC-5:00 (EST)">UTC-5:00 (EST)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9.5px] font-black text-slate-500 uppercase tracking-wider">Workspace Theme</label>
              <select
                value={preferences.theme}
                disabled
                className="w-full bg-[#080B11] border border-[#1A1F35] text-xs px-3.5 py-2.5 rounded-xl text-slate-400 cursor-not-allowed outline-none"
              >
                <option value="Dark">Enterprise Dark (Locked)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-xs font-black transition cursor-pointer"
          >
            <Save size={13} /> Save Configuration
          </button>
        </div>

      </form>

    </div>
  );
}
