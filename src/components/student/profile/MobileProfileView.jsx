"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  User,
  ShieldCheck,
  Edit,
  KeyRound,
  Award,
  Phone,
  Mail,
  Calendar,
  MapPin,
  GraduationCap,
  Users,
  Clock,
  Lock,
  Bell,
} from "lucide-react";

import UserAvatar from "@/components/admin/users/UserAvatar";

function InfoRow({ icon: Icon, label, value, onClick }) {
  const content = (
    <>
      <Icon size={15} className="text-slate-500 shrink-0" />
      <span className="text-xs text-slate-400 flex-1 min-w-0">{label}</span>
      <span className="text-xs font-semibold text-white text-right truncate max-w-[42%]">{value || "Not Provided"}</span>
      <ChevronRight size={14} className="text-slate-600 shrink-0" />
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center gap-3 py-2.5 text-left active:opacity-70 transition"
      >
        {content}
      </button>
    );
  }

  return <div className="flex items-center gap-3 py-2.5">{content}</div>;
}

function QuickActionButton({ href, onClick, icon: Icon, label, disabled }) {
  const className = `flex flex-col items-center justify-center gap-1.5 rounded-xl bg-[#0D1021] border border-[#1A1F35] py-3 min-h-[44px] transition ${
    disabled ? "opacity-40" : "active:scale-95"
  }`;

  const content = (
    <>
      <Icon size={16} className="text-orange-400" />
      <span className="text-[10px] font-bold text-slate-300 text-center leading-tight">{label}</span>
    </>
  );

  if (disabled) {
    return (
      <div className={className} title="Coming soon" aria-disabled="true">
        {content}
      </div>
    );
  }

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

// Mobile-first "My Profile" screen — reuses the same `profile` data and
// `onEdit` action the desktop cards already use, just reorganized into a
// compact, single-column layout matching the dashboard's mobile design
// language (dark navy cards, orange accents, list rows).
export default function MobileProfileView({ profile, onEdit }) {
  const router = useRouter();
  const student = profile?.studentProfile || {};

  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "Not Available";

  const dob = student.dateOfBirth
    ? new Date(student.dateOfBirth).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : null;

  // Real, derived-from-actual-data completion score (no field is invented) —
  // counts how many of the fields shown below are actually filled in.
  const completionFields = [
    profile?.name,
    profile?.email,
    profile?.phoneNumber || student.phone,
    profile?.address,
    profile?.avatar,
    student.dateOfBirth,
    student.guardianName,
    student.education,
  ];
  const filledCount = completionFields.filter(Boolean).length;
  const completionPercent = Math.round((filledCount / completionFields.length) * 100);

  return (
    <div className="space-y-3">
      {/* Back control only — "My Profile" already shows as the current-page
          title in the nav bar above, so it isn't repeated here. */}
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="h-8 w-8 -ml-1.5 flex items-center justify-center rounded-lg text-slate-300 active:bg-white/5 transition"
      >
        <ChevronLeft size={22} />
      </button>

      {/* Profile Summary Card — horizontal layout */}
      <div className="rounded-2xl bg-[#0D1021] border border-[#1A1F35] p-4">
        <div className="flex items-center gap-3">
          <UserAvatar name={profile?.name} avatar={profile?.avatar} size="lg" />
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-black text-white truncate">{profile?.name}</h2>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{profile?.email}</p>
            <div className="flex items-center flex-wrap gap-x-1.5 gap-y-1 mt-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-400">
                <User size={11} /> {profile?.role}
              </span>
              <span className="text-slate-600">•</span>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                  profile?.status === "ACTIVE" ? "text-emerald-400" : "text-red-400"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {profile?.status === "ACTIVE" ? "Active" : profile?.status}
              </span>
            </div>
            {profile?.isVerified && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 mt-1">
                <ShieldCheck size={11} /> Verified Account
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2 mt-3.5">
          <QuickActionButton onClick={onEdit} icon={Edit} label="Edit Profile" />
          <QuickActionButton icon={KeyRound} label="Change Password" disabled />
          <QuickActionButton href="/student/certificates" icon={Award} label="Certificates" />
        </div>
      </div>

      {/* Profile Completion */}
      <div className="rounded-xl bg-[#0D1021] border border-[#1A1F35] p-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-white">Profile Completion</h3>
          <span className="text-xs font-black text-orange-400">{completionPercent}% Complete</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
          <div
            className="h-full rounded-full bg-orange-500 transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-500 mt-2">Complete your profile to get the best learning experience.</p>
      </div>

      {/* Personal Information */}
      <div className="rounded-xl bg-[#0D1021] border border-[#1A1F35] p-3">
        <h3 className="text-xs font-black text-white mb-1 flex items-center gap-2">
          <span className="h-6 w-6 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <User size={12} className="text-orange-400" />
          </span>
          Personal Information
        </h3>
        <div className="divide-y divide-[#1A1F35]">
          <InfoRow icon={Phone} label="Phone Number" value={profile?.phoneNumber || student.phone} onClick={onEdit} />
          <InfoRow icon={Mail} label="Email Address" value={profile?.email} onClick={onEdit} />
          <InfoRow icon={Calendar} label="Date of Birth" value={dob} onClick={onEdit} />
          <InfoRow icon={MapPin} label="Address" value={profile?.address} onClick={onEdit} />
        </div>
      </div>

      {/* Academic Information */}
      <div className="rounded-xl bg-[#0D1021] border border-[#1A1F35] p-3">
        <h3 className="text-xs font-black text-white mb-1 flex items-center gap-2">
          <span className="h-6 w-6 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <GraduationCap size={12} className="text-orange-400" />
          </span>
          Academic Information
        </h3>
        <div className="divide-y divide-[#1A1F35]">
          <InfoRow icon={GraduationCap} label="Education" value={student.education} onClick={onEdit} />
          <InfoRow icon={Users} label="Guardian Name" value={student.guardianName} onClick={onEdit} />
          <InfoRow icon={Clock} label="Member Since" value={joinedDate} />
        </div>
      </div>

      {/* Security & Preferences */}
      <div className="rounded-xl bg-[#0D1021] border border-[#1A1F35] p-3">
        <h3 className="text-xs font-black text-white mb-1 flex items-center gap-2">
          <span className="h-6 w-6 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <ShieldCheck size={12} className="text-orange-400" />
          </span>
          Security & Preferences
        </h3>
        <div className="divide-y divide-[#1A1F35]">
          <div className="flex items-center gap-3 py-2.5 opacity-40" title="Coming soon" aria-disabled="true">
            <Lock size={15} className="text-slate-500 shrink-0" />
            <span className="text-xs text-slate-400 flex-1">Change Password</span>
            <ChevronRight size={14} className="text-slate-600 shrink-0" />
          </div>
          <Link href="/student/settings" className="flex items-center gap-3 py-2.5 active:opacity-70 transition">
            <ShieldCheck size={15} className="text-slate-500 shrink-0" />
            <span className="text-xs text-slate-400 flex-1">Privacy Settings</span>
            <ChevronRight size={14} className="text-slate-600 shrink-0" />
          </Link>
          <Link href="/student/settings" className="flex items-center gap-3 py-2.5 active:opacity-70 transition">
            <Bell size={15} className="text-slate-500 shrink-0" />
            <span className="text-xs text-slate-400 flex-1">Notification Preferences</span>
            <ChevronRight size={14} className="text-slate-600 shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
