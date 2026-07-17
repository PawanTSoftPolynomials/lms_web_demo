"use client";

import { useState } from "react";
import { User, Shield, Mail, Key, UserCheck, Lock } from "lucide-react";
import { changePassword } from "@/services/auth.service";
import useAuth from "@/hooks/useAuth";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

export default function ProfilePage() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setMessage(response.message || "Password changed successfully.");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to change password. Please verify current password."
      );
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-8 animate-fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">My Profile</h1>
        <p className="mt-1.5 text-xs text-slate-400">View your account details and update security settings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Profile Card (1/3 size) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 flex flex-col items-center text-center relative overflow-hidden group shadow-xl">
            {/* Design accents */}
            <div className="absolute top-0 right-0 h-28 w-28 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition duration-500" />
            
            {/* Avatar block */}
            <div className="relative mt-4 mb-5">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500 p-0.5 shadow-lg shadow-orange-500/10">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950 text-2xl font-black text-white">
                  {getInitials(user?.name)}
                </div>
              </div>
              <div className="absolute bottom-0 right-0 rounded-full bg-emerald-500 p-1.5 border-4 border-slate-950 text-white" title="Account Status Active">
                <UserCheck size={12} className="stroke-[3]" />
              </div>
            </div>

            {/* Profile info details */}
            <h2 className="text-xl font-bold text-white leading-tight mb-1">{user?.name || "LMS User"}</h2>
            
            <span className="inline-flex rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/25 px-3 py-1 text-[10px] font-black uppercase tracking-wider mb-6">
              {user?.role || "STUDENT"}
            </span>

            <div className="w-full border-t border-slate-800/80 pt-5 space-y-4 text-left text-xs">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                  <Mail size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Email Address</p>
                  <p className="text-slate-300 font-medium truncate mt-0.5">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                  <Shield size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Verification Status</p>
                  <p className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                    <span>Verified Account</span>
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Change Password Card (2/3 size) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border border-slate-800 bg-slate-900/60 shadow-lg">
            <div className="flex items-center gap-2.5 mb-6 border-b border-slate-800/80 pb-4">
              <div className="h-8 w-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
                <Lock size={15} />
              </div>
              <div>
                <h3 className="text-md font-bold text-white leading-none">Security Settings</h3>
                <p className="text-[10px] text-slate-400 mt-1">Change your account password regularly to keep it secure</p>
              </div>
            </div>

            {message && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold p-3.5 rounded-xl mb-6 animate-in fade-in">
                {message}
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold p-3.5 rounded-xl mb-6 animate-in fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="password"
                name="currentPassword"
                label="Current Password"
                placeholder="••••••••"
                value={formData.currentPassword}
                onChange={handleChange}
                required
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  type="password"
                  name="newPassword"
                  label="New Password"
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                />

                <Input
                  type="password"
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-extrabold text-xs px-6 py-3 transition shadow-lg shadow-orange-500/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Key size={13} />
                  <span>{loading ? "Changing..." : "Change Password"}</span>
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}