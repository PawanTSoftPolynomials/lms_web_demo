"use client";

import { useState, useEffect } from "react";
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Sliders,
  Settings,
  Bell,
  Lock,
  Globe,
  Sun,
  Eye,
  LogOut,
  Smartphone,
  Laptop,
  Loader2,
  AlertCircle
} from "lucide-react";
import useProfile from "@/hooks/queries/student/useProfile";
import useUpdateProfile from "@/hooks/queries/student/useUpdateProfile";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");
  const [themeMode, setThemeMode] = useState("Light Mode");
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { data: userProfile, isLoading, isError } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  // Form states matching mock screenshots
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    dob: "",
    guardianName: "",
    address: "",
    education: "",
    profileVisibility: "Public",
    focusTopics: "",
    interests: "",
    learningGoals: "",
    videoQuality: "Auto",
    downloadOverWifi: true,
    language: "English",
    timezone: "GMT+05:30",
    themeMode: "Dark Mode",
    plan: "Free Plan"
  });

  // Sync profile data to form state when loaded
  useEffect(() => {
    if (userProfile) {
      const sp = userProfile.studentProfile || {};
      let dobString = "";
      if (sp.dateOfBirth) {
        dobString = new Date(sp.dateOfBirth).toISOString().split("T")[0];
      }
      setForm({
        name: userProfile.name || "",
        email: userProfile.email || "",
        phoneNumber: userProfile.phoneNumber || sp.phone || "",
        dob: dobString,
        guardianName: sp.guardianName || "",
        address: userProfile.address || "",
        education: sp.education || "",
        profileVisibility: sp.profileVisibility || "Public",
        focusTopics: sp.focusTopics || "",
        interests: sp.interests || "",
        learningGoals: sp.learningGoals || "",
        videoQuality: sp.videoQuality || "Auto",
        downloadOverWifi: sp.downloadOverWifi !== false,
        language: sp.language || "English",
        timezone: sp.timezone || "GMT+05:30",
        themeMode: sp.themeMode || "Dark Mode",
        plan: sp.plan || "Free Plan"
      });
      if (sp.themeMode) {
        setThemeMode(sp.themeMode);
      }
    }
  }, [userProfile]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaved(false);
    setErrorMsg("");

    try {
      await updateProfileMutation.mutateAsync({
        name: form.name,
        phoneNumber: form.phoneNumber,
        address: form.address,
        education: form.education,
        dateOfBirth: form.dob ? new Date(form.dob).toISOString() : null,
        guardianName: form.guardianName,
        phone: form.phoneNumber, // update student profile phone too
        profileVisibility: form.profileVisibility,
        focusTopics: form.focusTopics,
        interests: form.interests,
        learningGoals: form.learningGoals,
        videoQuality: form.videoQuality,
        downloadOverWifi: form.downloadOverWifi,
        language: form.language,
        timezone: form.timezone,
        themeMode: themeMode,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.response?.data?.message || "Failed to update profile. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 font-sans">
        <Loader2 className="animate-spin mr-2" size={20} /> Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* 1. Header Banner */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your account, preferences and application settings.
        </p>
      </div>

      {/* 2. Page Navigation Tabs */}
      <div className="flex border-b border-slate-800 mb-8 gap-6 text-sm font-bold overflow-x-auto whitespace-nowrap scrollbar-none">
        {["Profile", "Account", "Notifications", "Privacy", "Security", "Preferences", "Connected Apps"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3.5 border-b-2 transition-all cursor-pointer ${
              activeTab === tab 
                ? "border-orange-500 text-orange-500" 
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. Main Form Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Columns (Form + Profile custom/preferences) */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === "Profile" && (
            <>
              {/* Profile information */}
              <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-luxury-md">
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-6">Profile Information</h3>
                
                <div className="space-y-6">
                  {/* Photo selector */}
                  <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-full bg-orange-500/10 flex items-center justify-center font-black text-xl text-orange-400 border border-orange-500/20">
                      {form.name ? form.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <button type="button" className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer">
                        Change Photo
                      </button>
                      <p className="text-[10px] text-slate-500 mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                    </div>
                  </div>

                  {/* Input grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-orange-500 transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={form.email}
                        disabled
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-500 outline-none cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Phone Number</label>
                      <input
                        type="text"
                        value={form.phoneNumber}
                        onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-orange-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Date of Birth</label>
                      <input
                        type="date"
                        value={form.dob}
                        onChange={(e) => setForm({ ...form, dob: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-orange-500 transition cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Education</label>
                      <input
                        type="text"
                        value={form.education}
                        onChange={(e) => setForm({ ...form, education: e.target.value })}
                        placeholder="Bachelor's, High School, etc."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-orange-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Address</label>
                      <input
                        type="text"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-orange-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Guardian Name</label>
                    <input
                      type="text"
                      value={form.guardianName}
                      onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-orange-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Profile Customization */}
              <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl p-5 shadow-luxury-md">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Profile Customization</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-semibold p-1 hover:bg-slate-800/55 rounded-lg transition">
                    <span className="text-slate-300">Profile Visibility</span>
                    <select
                      value={form.profileVisibility}
                      onChange={(e) => setForm({ ...form, profileVisibility: e.target.value })}
                      className="bg-slate-950 text-orange-400 border border-slate-800 rounded px-2 py-0.5 text-[11px] font-bold outline-none cursor-pointer"
                    >
                      <option value="Public">Public</option>
                      <option value="Private">Private</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold p-1 hover:bg-slate-800/55 rounded-lg transition">
                    <span className="text-slate-300">Focus Topics</span>
                    <input
                      type="text"
                      value={form.focusTopics}
                      placeholder="e.g. Science, Maths"
                      onChange={(e) => setForm({ ...form, focusTopics: e.target.value })}
                      className="bg-slate-950 text-orange-500 border border-slate-800 rounded px-2.5 py-0.5 text-[11px] font-semibold outline-none w-32 text-right"
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold p-1 hover:bg-slate-800/55 rounded-lg transition">
                    <span className="text-slate-300">Interests</span>
                    <input
                      type="text"
                      value={form.interests}
                      placeholder="e.g. Code, Physics"
                      onChange={(e) => setForm({ ...form, interests: e.target.value })}
                      className="bg-slate-950 text-orange-500 border border-slate-800 rounded px-2.5 py-0.5 text-[11px] font-semibold outline-none w-32 text-right"
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold p-1 hover:bg-slate-800/55 rounded-lg transition">
                    <span className="text-slate-300">Learning Goals</span>
                    <input
                      type="text"
                      value={form.learningGoals}
                      placeholder="e.g. Graduation"
                      onChange={(e) => setForm({ ...form, learningGoals: e.target.value })}
                      className="bg-slate-950 text-orange-500 border border-slate-800 rounded px-2.5 py-0.5 text-[11px] font-semibold outline-none w-32 text-right"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "Preferences" && (
            <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl p-5 shadow-luxury-md">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-semibold p-1 hover:bg-slate-800/55 rounded-lg transition">
                  <span className="text-slate-300">Default Video Quality</span>
                  <select
                    value={form.videoQuality}
                    onChange={(e) => setForm({ ...form, videoQuality: e.target.value })}
                    className="bg-slate-950 text-orange-400 border border-slate-800 rounded px-2 py-0.5 text-[11px] font-bold outline-none cursor-pointer"
                  >
                    <option value="Auto">Auto</option>
                    <option value="1080p">1080p</option>
                    <option value="720p">720p</option>
                    <option value="360p">360p</option>
                  </select>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold p-1 hover:bg-slate-800/55 rounded-lg transition">
                  <span className="text-slate-300">Download Over</span>
                  <select
                    value={form.downloadOverWifi ? "wifi" : "all"}
                    onChange={(e) => setForm({ ...form, downloadOverWifi: e.target.value === "wifi" })}
                    className="bg-slate-950 text-orange-400 border border-slate-800 rounded px-2 py-0.5 text-[11px] font-bold outline-none cursor-pointer"
                  >
                    <option value="wifi">Wi-Fi Only</option>
                    <option value="all">All Networks</option>
                  </select>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold p-1 hover:bg-slate-800/55 rounded-lg transition">
                  <span className="text-slate-300">Content Language</span>
                  <select
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    className="bg-slate-950 text-orange-400 border border-slate-800 rounded px-2 py-0.5 text-[11px] font-bold outline-none cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold p-1 hover:bg-slate-800/55 rounded-lg transition">
                  <span className="text-slate-300">Timezone</span>
                  <select
                    value={form.timezone}
                    onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                    className="bg-slate-950 text-orange-400 border border-slate-800 rounded px-2 py-0.5 text-[11px] font-bold outline-none cursor-pointer"
                  >
                    <option value="GMT+05:30">GMT+05:30</option>
                    <option value="UTC">UTC</option>
                    <option value="EST">EST</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Account" && (
            <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-luxury-md space-y-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Account Subscription</h3>
                <p className="text-xs text-slate-400">Manage your active plans, pricing options, and billing cycle.</p>
              </div>

              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block">Current Plan</span>
                  <span className="text-base font-black text-white mt-1 block">{form.plan}</span>
                </div>
                <button type="button" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-xl text-xs font-bold text-white transition cursor-pointer">
                  Upgrade Plan
                </button>
              </div>

              <div className="border-t border-slate-800/80 pt-4 space-y-3 text-xs text-slate-400">
                <div className="flex justify-between"><span>Billing Cycle:</span><span className="text-white font-bold">Monthly</span></div>
                <div className="flex justify-between"><span>Next Payment Due:</span><span className="text-white font-bold">August 12, 2026</span></div>
                <div className="flex justify-between"><span>Account Status:</span><span className="text-emerald-500 font-bold">Active</span></div>
              </div>
            </div>
          )}

          {activeTab === "Notifications" && (
            <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-luxury-md space-y-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Notification Preferences</h3>
                <p className="text-xs text-slate-400">Choose when and how you want to be notified by LMS.</p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-slate-800/50 transition">
                  <input type="checkbox" defaultChecked className="accent-orange-500 h-4 w-4 rounded border-slate-800" />
                  <div>
                    <span className="text-xs font-bold text-white block">Email Notifications</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Receive summary updates, grades, and calendar shifts via email.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-slate-800/50 transition">
                  <input type="checkbox" defaultChecked className="accent-orange-500 h-4 w-4 rounded border-slate-800" />
                  <div>
                    <span className="text-xs font-bold text-white block">Push Notifications</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Get instant alerts about live classes, chats, and assignments.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-slate-800/50 transition">
                  <input type="checkbox" className="accent-orange-500 h-4 w-4 rounded border-slate-800" />
                  <div>
                    <span className="text-xs font-bold text-white block">SMS Notifications</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Get urgent updates on your phone.</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === "Privacy" && (
            <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-luxury-md space-y-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Privacy & Data</h3>
                <p className="text-xs text-slate-400">Control who can see your learning milestones and stats.</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-semibold p-1 hover:bg-slate-800/55 rounded-lg transition">
                  <span className="text-slate-300">Milestones visibility</span>
                  <select className="bg-slate-950 text-orange-400 border border-slate-800 rounded px-2 py-0.5 text-[11px] font-bold outline-none cursor-pointer">
                    <option>Show to Instructors only</option>
                    <option>Publicly Visible</option>
                    <option>Completely Private</option>
                  </select>
                </div>

                <div className="flex justify-between items-center text-xs font-semibold p-1 hover:bg-slate-800/55 rounded-lg transition">
                  <span className="text-slate-300">Allow direct messaging</span>
                  <select className="bg-slate-950 text-orange-400 border border-slate-800 rounded px-2 py-0.5 text-[11px] font-bold outline-none cursor-pointer">
                    <option>Everyone</option>
                    <option>Instructors Only</option>
                    <option>None</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Security" && (
            <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-luxury-md space-y-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Change Password</h3>
                <p className="text-xs text-slate-400">Ensure your account is using a long, secure random password.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-orange-500 transition" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-orange-500 transition" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "Connected Apps" && (
            <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-luxury-md space-y-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Connected Accounts</h3>
                <p className="text-xs text-slate-400">Link third-party accounts for faster single-sign-on access.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-2 hover:bg-slate-800/50 rounded-xl transition">
                  <span className="text-xs font-bold text-white">Google</span>
                  <button type="button" className="text-xs font-bold text-orange-400 hover:text-orange-500 cursor-pointer">Disconnect</button>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-slate-800/50 rounded-xl transition">
                  <span className="text-xs font-bold text-white">Github</span>
                  <button type="button" className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer">Connect Account</button>
                </div>
              </div>
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {updateProfileMutation.isPending && <Loader2 size={12} className="animate-spin" />}
              Save All Settings
            </button>
            {saved && (
              <span className="text-xs text-emerald-500 font-bold animate-pulse">Changes saved successfully! ✓</span>
            )}
            {errorMsg && (
              <span className="text-xs text-red-500 font-bold flex items-center gap-1"><AlertCircle size={12} /> {errorMsg}</span>
            )}
          </div>

        </div>

        {/* Right side summary & action widgets */}
        <div className="space-y-6">
          
          {/* Account Summary Banner card */}
          <div className="bg-gradient-to-br from-orange-600 to-pink-650 text-white rounded-2xl p-5 shadow-luxury-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="text-center">
              <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center font-bold text-lg border border-white/20 mx-auto mb-3">
                {form.name ? form.name.charAt(0).toUpperCase() : "U"}
              </div>
              <h4 className="text-sm font-black leading-none text-white">{form.name}</h4>
              <span className="text-[10px] text-orange-200 mt-2 block">Student Account</span>
              
              <div className="flex justify-between border-t border-white/10 pt-3.5 mt-4 text-[10px] text-orange-100 font-semibold">
                <span>Member since: {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "March 12, 2025"}</span>
                <span>Plan: {form.plan}</span>
              </div>

              <button type="button" className="w-full mt-4 py-2 bg-white text-orange-600 hover:bg-orange-50 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer">
                Upgrade to Premium
              </button>
            </div>
          </div>

          {/* Quick Settings list */}
          <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl p-5 shadow-luxury-md">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Quick Settings</h3>
            
            <div className="space-y-4">
              <div
                onClick={() => setActiveTab("Notifications")}
                className="flex justify-between items-center text-xs font-semibold p-1 hover:bg-slate-800/55 rounded-lg cursor-pointer transition"
              >
                <span className="text-slate-300 flex items-center gap-2">🔔 Notification Settings</span>
                <span className="text-orange-400 font-bold">&gt;</span>
              </div>

              <div
                onClick={() => setActiveTab("Security")}
                className="flex justify-between items-center text-xs font-semibold p-1 hover:bg-slate-800/55 rounded-lg cursor-pointer transition"
              >
                <span className="text-slate-300 flex items-center gap-2">🔒 Security Settings</span>
                <span className="text-orange-400 font-bold">&gt;</span>
              </div>

              <div className="flex justify-between items-center text-xs font-semibold p-1 hover:bg-slate-800/55 rounded-lg transition">
                <span className="text-slate-300 flex items-center gap-2">☀️ Theme Mode</span>
                <button
                  type="button"
                  onClick={() => setThemeMode(prev => prev === "Light Mode" ? "Dark Mode" : "Light Mode")}
                  className="text-orange-400 font-bold cursor-pointer"
                >
                  {themeMode} &gt;
                </button>
              </div>
            </div>
          </div>

          {/* Active Devices & Sessions */}
          <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl p-5 shadow-luxury-md">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Active Sessions</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 hover:bg-slate-800/55 rounded-xl transition cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-orange-500/10 text-orange-400 rounded"><Laptop size={14} /></div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-300 block">Windows • Chrome</span>
                    <span className="text-[8px] text-emerald-500 font-bold">Current Session • Pune</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 hover:bg-slate-800/55 rounded-xl transition cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-800 text-slate-400 rounded"><Smartphone size={14} /></div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-300 block">Android • Mobile App</span>
                    <span className="text-[8px] text-slate-500 font-semibold">Active 2 hrs ago • Mumbai</span>
                  </div>
                </div>
                <button type="button" className="text-[9px] text-red-400 font-bold hover:underline cursor-pointer">Logout</button>
              </div>

              <div className="flex items-center justify-between p-2 hover:bg-slate-800/55 rounded-xl transition cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-800 text-slate-400 rounded"><Laptop size={14} /></div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-300 block">MacOS • Safari</span>
                    <span className="text-[8px] text-slate-500 font-semibold">Active 1 day ago • Bengaluru</span>
                  </div>
                </div>
                <button type="button" className="text-[9px] text-red-400 font-bold hover:underline cursor-pointer">Logout</button>
              </div>
            </div>

            <button type="button" className="w-full mt-4 text-[10px] text-red-400 hover:text-red-500 font-bold transition hover:underline cursor-pointer">
              Log out from all other devices
            </button>
          </div>

        </div>

      </form>

    </div>
  );
}
