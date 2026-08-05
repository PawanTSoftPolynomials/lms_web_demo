"use client";

import { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Building,
  Shield,
  ShieldCheck,
  Lock,
  Key,
  Check,
  X,
  ChevronRight,
  Camera,
  Upload,
  UserCheck,
  Bell,
  Monitor,
  HelpCircle,
  Sparkles,
  Zap,
  Trash2,
  CheckCircle2,
  Smartphone,
  Globe,
  Sliders,
  Save,
} from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";
import useUpdateProfile from "@/hooks/queries/student/useUpdateProfile";
import { changePassword } from "@/services/auth.service";
import { uploadAvatar, removeAvatar, updateProfile } from "@/services/profile.service";

const EDUCATION_OPTIONS = [
  "B.Tech in Artificial Intelligence & ML",
  "B.Tech in Computer Science & Engineering",
  "B.Tech in Information Technology",
  "Bachelor of Science (B.Sc)",
  "Master of Technology (M.Tech)",
  "Master of Computer Applications (MCA)",
  "Bachelor of Business Administration (BBA)",
  "High School / Secondary Education",
  "Other / Self-Taught",
];

const GENDER_OPTIONS = [
  "Male",
  "Female",
  "Non-binary",
  "Prefer not to say",
];

export default function DesktopEditProfileView({ profile, onRefresh }) {
  const updateProfileMutation = useUpdateProfile();
  const fileInputRef = useRef(null);
  const dobRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    education: "",
    institution: "",
    graduationYear: "",
    guardianName: "",
    gender: "Male",
    dateOfBirth: "",
  });

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState("");

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'password' | '2fa' | 'sessions' | 'privacy' | 'notifications' | null
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, error: "", success: "" });

  // Security features state
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState("Public");
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailAnnouncements: true,
    courseUpdates: true,
    quizReminders: true,
  });

  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [saveErrorMsg, setSaveErrorMsg] = useState("");

  useEffect(() => {
    if (profile) {
      const student = profile.studentProfile || {};
      let dobStr = "";
      if (student.dateOfBirth) {
        try {
          dobStr = new Date(student.dateOfBirth).toISOString().split("T")[0];
        } catch (e) {
          dobStr = "";
        }
      }

      setFormData({
        name: profile.name || "",
        phoneNumber: profile.phoneNumber || "",
        address: profile.address || "",
        education: student.education || "B.Tech in Artificial Intelligence & ML",
        institution: student.institution || "Dr. Babasaheb Ambedkar Technological University",
        graduationYear: student.graduationYear || "2026",
        guardianName: student.guardianName || "Manohar Tiwari",
        gender: student.gender || "Male",
        dateOfBirth: dobStr || "2001-06-28",
      });

      if (profile.avatar) {
        setAvatarPreview(profile.avatar);
      }
      if (student.profileVisibility) {
        setProfileVisibility(student.profileVisibility);
      }
    }
  }, [profile]);

  // Calculate dynamic profile completion percentage
  const checkList = [
    { label: "Full Name", key: "name", isFilled: !!formData.name.trim() },
    { label: "Phone Number", key: "phoneNumber", isFilled: !!formData.phoneNumber.trim() },
    { label: "Email Address", key: "email", isFilled: !!profile?.email },
    { label: "Date of Birth", key: "dateOfBirth", isFilled: !!formData.dateOfBirth },
    { label: "Address", key: "address", isFilled: !!formData.address.trim() },
    { label: "Education", key: "education", isFilled: !!formData.education },
    { label: "Institution", key: "institution", isFilled: !!formData.institution.trim() },
    { label: "Profile Photo", key: "avatar", isFilled: !!(avatarPreview || profile?.avatar) },
  ];

  const completedCount = checkList.filter((item) => item.isFilled).length;
  const completionPercentage = Math.round((completedCount / checkList.length) * 100);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Avatar Upload Handlers
  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarMessage("Error: Only image files (JPG, PNG, WebP) are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarMessage("Error: Image size must be less than 5MB.");
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setAvatarMessage("");
      
      // Local preview immediately
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);

      // Upload to backend API
      const result = await uploadAvatar(file);
      setAvatarMessage("Profile photo uploaded successfully!");
      if (onRefresh) onRefresh();
    } catch (err) {
      setAvatarMessage(err?.response?.data?.message || "Failed to upload photo.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setIsUploadingAvatar(true);
      setAvatarMessage("");
      setAvatarPreview(null);
      await removeAvatar();
      setAvatarMessage("Profile photo removed.");
      if (onRefresh) onRefresh();
    } catch (err) {
      setAvatarMessage("Failed to remove photo.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Profile Form Save Handler
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaveSuccessMsg("");
    setSaveErrorMsg("");

    try {
      await updateProfileMutation.mutateAsync(formData);
      setSaveSuccessMsg("Profile changes saved successfully!");
      if (onRefresh) onRefresh();
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    } catch (err) {
      setSaveErrorMsg(err?.response?.data?.message || "Failed to save profile changes.");
    }
  };

  // Password Change Handler
  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setPasswordStatus({ loading: false, error: "", success: "" });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({ loading: false, error: "New passwords do not match.", success: "" });
      return;
    }

    try {
      setPasswordStatus({ loading: true, error: "", success: "" });
      const res = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordStatus({
        loading: false,
        error: "",
        success: res?.message || "Password changed successfully!",
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        setActiveModal(null);
        setPasswordStatus({ loading: false, error: "", success: "" });
      }, 1500);
    } catch (err) {
      setPasswordStatus({
        loading: false,
        error: err?.response?.data?.message || "Failed to change password. Please check current password.",
        success: "",
      });
    }
  };

  // Privacy Settings Update Handler
  const handleTogglePrivacy = async (visibility) => {
    setProfileVisibility(visibility);
    try {
      await updateProfile({ profileVisibility: visibility });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to update privacy settings:", err);
    }
  };

  const memberSinceStr = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "03 Aug 2026";

  const initials = (profile?.name || "Pawan Tiwari")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 text-slate-100">
      {/* Hidden File Input for Avatar */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <span className="hover:text-white transition cursor-pointer">Profile</span>
        <ChevronRight size={12} className="text-slate-600" />
        <span className="text-orange-400 font-bold">Edit Profile</span>
      </div>

      {/* 1. HERO PROFILE HEADER CARD */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-[#0B0F17] to-slate-950 p-6 md:p-8 shadow-2xl">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          {/* Avatar & Identifiers */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            {/* Avatar block */}
            <div className="relative group">
              <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-orange-500 via-amber-500 to-pink-500 p-1 shadow-xl shadow-orange-500/10">
                <div className="h-full w-full rounded-full bg-slate-950 flex items-center justify-center text-3xl font-black text-white overflow-hidden relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={profile?.name || "Avatar"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}

                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {/* Camera Icon Trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-orange-500 hover:bg-orange-600 text-slate-950 flex items-center justify-center shadow-lg transition active:scale-90 cursor-pointer"
                title="Upload Profile Photo"
              >
                <Camera size={15} className="stroke-[2.5]" />
              </button>
            </div>

            {/* Name & Metadata Badges */}
            <div className="space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                  {formData.name || profile?.name || "Pawan Manoharprasad Tiwari"}
                </h1>
                <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40" title="Verified Account">
                  <Check size={12} className="stroke-[3]" />
                </div>
              </div>

              <p className="text-sm font-medium text-slate-400">
                {profile?.email || "pt349031@gmail.com"}
              </p>

              {/* Status Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <span className="inline-flex items-center gap-1 rounded-lg bg-orange-500/15 border border-orange-500/30 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-orange-400">
                  <User size={12} />
                  <span>{profile?.role || "STUDENT"}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Active</span>
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800/80 border border-slate-700 px-2.5 py-1 text-[11px] font-bold text-slate-300">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>Verified Account</span>
                </span>

                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 ml-1">
                  <Calendar size={13} />
                  <span>Member since {memberSinceStr}</span>
                </span>
              </div>

              {avatarMessage && (
                <p className="text-xs font-semibold text-orange-400 animate-in fade-in pt-1">
                  {avatarMessage}
                </p>
              )}
            </div>
          </div>

          {/* Quick Hero Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-slate-950 font-black text-xs px-5 py-2.5 transition shadow-lg shadow-orange-500/15 cursor-pointer"
            >
              <Upload size={14} className="stroke-[2.5]" />
              <span>Upload Photo</span>
            </button>

            {avatarPreview && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs px-5 py-2 transition active:scale-95 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Remove Photo</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveModal("password")}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs px-5 py-2.5 transition active:scale-95 cursor-pointer"
            >
              <Lock size={14} />
              <span>Change Password</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModal("privacy")}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs px-5 py-2.5 transition active:scale-95 cursor-pointer"
            >
              <Shield size={14} />
              <span>Privacy Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2-COLUMN MAIN CONTENT GRID */}
      <div className="grid gap-6 lg:grid-cols-10">
        {/* LEFT COLUMN (70% = 7 cols on lg grid) */}
        <div className="lg:col-span-7 space-y-6">
          {/* A. PERSONAL INFORMATION CARD */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 md:p-7 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
                  <User size={18} />
                </div>
                <h2 className="text-lg font-bold text-white">Personal Information</h2>
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-700 hover:border-orange-500 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-50"
              >
                <Save size={13} />
                <span>Save</span>
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              {/* Email Address (Read-only) */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3 text-slate-600" />
                  <input
                    type="email"
                    value={profile?.email || "pt349031@gmail.com"}
                    disabled
                    className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              {/* Date of Birth Picker */}
              <div ref={dobRef}>
                <DatePicker
                  label="Date of Birth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  placeholder="Select Date of Birth"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Gender
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3 text-slate-500" />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-8 py-2.5 text-sm text-white outline-none focus:border-orange-500 transition appearance-none cursor-pointer"
                  >
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g} className="bg-slate-900 text-white">
                        {g}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3.5 top-3.5 text-slate-400 text-xs pointer-events-none">
                    ▼
                  </span>
                </div>
              </div>

              {/* Address (Spans Full Width) */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Address
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                  <textarea
                    name="address"
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Near kalaram mandir, Samadhi ward, Chandrapur, Maharashtra, India"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white outline-none focus:border-orange-500 transition resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* B. EDUCATION DETAILS CARD */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 md:p-7 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
                  <GraduationCap size={18} />
                </div>
                <h2 className="text-lg font-bold text-white">Education Details</h2>
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-700 hover:border-orange-500 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-50"
              >
                <Save size={13} />
                <span>Save</span>
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Education (Select Dropdown) */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Education Degree
                </label>
                <div className="relative">
                  <GraduationCap size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-8 py-2.5 text-sm text-white outline-none focus:border-orange-500 transition appearance-none cursor-pointer"
                  >
                    {EDUCATION_OPTIONS.map((edu) => (
                      <option key={edu} value={edu} className="bg-slate-900 text-white">
                        {edu}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3.5 top-3.5 text-slate-400 text-xs pointer-events-none">
                    ▼
                  </span>
                </div>
              </div>

              {/* Institution / University */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Institution / University
                </label>
                <div className="relative">
                  <Building size={16} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              {/* Year of Graduation */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Year of Graduation
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              {/* Guardian Name */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Guardian Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              {/* Member Since (Read-only) */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Member Since
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-3 text-slate-600" />
                  <input
                    type="text"
                    value={memberSinceStr}
                    disabled
                    className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* C. SECURITY & PRIVACY CARD */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 md:p-7 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
                  <Shield size={18} />
                </div>
                <h2 className="text-lg font-bold text-white">Security & Privacy</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal("password")}
                className="px-3.5 py-1.5 rounded-lg border border-slate-700 hover:border-orange-500 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
              >
                Edit Section
              </button>
            </div>

            {/* 5 Security Cards Grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {/* Tile 1: Change Password */}
              <div
                onClick={() => setActiveModal("password")}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-orange-500/50 hover:bg-slate-900/80 transition cursor-pointer group flex items-start justify-between"
              >
                <div className="space-y-1.5 min-w-0 pr-2">
                  <div className="h-7 w-7 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center group-hover:scale-105 transition">
                    <Lock size={14} />
                  </div>
                  <h3 className="text-xs font-bold text-white group-hover:text-orange-400 transition truncate">
                    Change Password
                  </h3>
                  <p className="text-[10px] text-slate-400 line-clamp-2">
                    Update your account password
                  </p>
                </div>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition shrink-0 mt-1" />
              </div>

              {/* Tile 2: Two-Factor Authentication */}
              <div
                onClick={() => setActiveModal("2fa")}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-orange-500/50 hover:bg-slate-900/80 transition cursor-pointer group flex items-start justify-between"
              >
                <div className="space-y-1.5 min-w-0 pr-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition">
                    <ShieldCheck size={14} />
                  </div>
                  <h3 className="text-xs font-bold text-white group-hover:text-orange-400 transition truncate">
                    Two-Factor Auth
                  </h3>
                  <p className="text-[10px] text-slate-400 line-clamp-2">
                    {is2FAEnabled ? "Enabled (Secure)" : "Disabled (Click to configure)"}
                  </p>
                </div>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition shrink-0 mt-1" />
              </div>

              {/* Tile 3: Active Sessions */}
              <div
                onClick={() => setActiveModal("sessions")}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-orange-500/50 hover:bg-slate-900/80 transition cursor-pointer group flex items-start justify-between"
              >
                <div className="space-y-1.5 min-w-0 pr-2">
                  <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-105 transition">
                    <Monitor size={14} />
                  </div>
                  <h3 className="text-xs font-bold text-white group-hover:text-orange-400 transition truncate">
                    Active Sessions
                  </h3>
                  <p className="text-[10px] text-slate-400 line-clamp-2">
                    Manage current active logins
                  </p>
                </div>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition shrink-0 mt-1" />
              </div>

              {/* Tile 4: Privacy Settings */}
              <div
                onClick={() => setActiveModal("privacy")}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-orange-500/50 hover:bg-slate-900/80 transition cursor-pointer group flex items-start justify-between"
              >
                <div className="space-y-1.5 min-w-0 pr-2">
                  <div className="h-7 w-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-105 transition">
                    <Globe size={14} />
                  </div>
                  <h3 className="text-xs font-bold text-white group-hover:text-orange-400 transition truncate">
                    Privacy Settings
                  </h3>
                  <p className="text-[10px] text-slate-400 line-clamp-2">
                    Visibility: {profileVisibility}
                  </p>
                </div>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition shrink-0 mt-1" />
              </div>

              {/* Tile 5: Notification Preferences */}
              <div
                onClick={() => setActiveModal("notifications")}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-orange-500/50 hover:bg-slate-900/80 transition cursor-pointer group flex items-start justify-between"
              >
                <div className="space-y-1.5 min-w-0 pr-2">
                  <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-105 transition">
                    <Bell size={14} />
                  </div>
                  <h3 className="text-xs font-bold text-white group-hover:text-orange-400 transition truncate">
                    Notification Prefs
                  </h3>
                  <p className="text-[10px] text-slate-400 line-clamp-2">
                    Configure alert preferences
                  </p>
                </div>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition shrink-0 mt-1" />
              </div>
            </div>
          </div>

          {/* D. SAVE / CANCEL ACTIONS BAR */}
          <div className="flex items-center justify-between pt-2">
            {saveSuccessMsg ? (
              <p className="text-xs font-bold text-emerald-400 animate-in fade-in">
                ✓ {saveSuccessMsg}
              </p>
            ) : saveErrorMsg ? (
              <p className="text-xs font-bold text-red-400 animate-in fade-in">
                ✕ {saveErrorMsg}
              </p>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (profile) {
                    const student = profile.studentProfile || {};
                    setFormData({
                      name: profile.name || "",
                      phoneNumber: profile.phoneNumber || "",
                      address: profile.address || "",
                      education: student.education || "B.Tech in Artificial Intelligence & ML",
                      institution: student.institution || "Dr. Babasaheb Ambedkar Technological University",
                      graduationYear: student.graduationYear || "2026",
                      guardianName: student.guardianName || "Manohar Tiwari",
                      gender: student.gender || "Male",
                      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split("T")[0] : "2001-06-28",
                    });
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs px-5 py-3 transition active:scale-95 cursor-pointer"
              >
                <X size={14} />
                <span>Cancel</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
                className="flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-slate-950 font-black text-xs px-6 py-3 transition shadow-lg shadow-orange-500/15 cursor-pointer disabled:opacity-50"
              >
                <Check size={15} className="stroke-[3]" />
                <span>{updateProfileMutation.isPending ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (30% = 3 cols on lg grid) */}
        <div className="lg:col-span-3 space-y-6">
          {/* 1. DYNAMIC PROFILE COMPLETION CARD */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Profile Completion</h3>
              <span className="text-xs font-black text-orange-400">
                {completionPercentage}% Complete
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Complete missing fields to get full access and personalized recommendation features.
            </p>

            {/* Dynamic Checklist */}
            <div className="space-y-2.5 pt-1 text-xs">
              {checkList.map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  {item.isFilled ? (
                    <div className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                      <Check size={10} className="stroke-[3]" />
                    </div>
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-orange-500/80 shrink-0" />
                  )}
                  <span className={item.isFilled ? "text-slate-300 font-medium" : "text-slate-400 font-normal"}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={() => {
                if (dobRef.current) {
                  dobRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
              className="w-full py-2.5 rounded-xl border border-orange-500/40 text-orange-400 hover:bg-orange-500/10 font-bold text-xs transition cursor-pointer"
            >
              Complete Missing Fields
            </button>
          </div>

          {/* 2. QUICK ACTIONS CARD */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Zap size={16} className="text-orange-400 fill-orange-400" />
              <h3 className="text-sm font-bold">Quick Actions</h3>
            </div>

            <div className="divide-y divide-slate-800/80 text-xs">
              <div
                onClick={() => setActiveModal("password")}
                className="py-3 flex items-center justify-between text-slate-300 hover:text-orange-400 transition cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Lock size={14} className="text-slate-500 group-hover:text-orange-400" />
                  <span>Change Password</span>
                </div>
                <ChevronRight size={13} className="text-slate-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition" />
              </div>

              <div
                onClick={() => setActiveModal("2fa")}
                className="py-3 flex items-center justify-between text-slate-300 hover:text-orange-400 transition cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={14} className="text-slate-500 group-hover:text-orange-400" />
                  <span>Two-Factor Auth</span>
                </div>
                <ChevronRight size={13} className="text-slate-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition" />
              </div>

              <div
                onClick={() => setActiveModal("sessions")}
                className="py-3 flex items-center justify-between text-slate-300 hover:text-orange-400 transition cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Monitor size={14} className="text-slate-500 group-hover:text-orange-400" />
                  <span>Active Sessions</span>
                </div>
                <ChevronRight size={13} className="text-slate-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition" />
              </div>

              <div
                onClick={() => setActiveModal("privacy")}
                className="py-3 flex items-center justify-between text-slate-300 hover:text-orange-400 transition cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Globe size={14} className="text-slate-500 group-hover:text-orange-400" />
                  <span>Privacy Settings</span>
                </div>
                <ChevronRight size={13} className="text-slate-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition" />
              </div>

              <div
                onClick={() => setActiveModal("notifications")}
                className="py-3 flex items-center justify-between text-slate-300 hover:text-orange-400 transition cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Bell size={14} className="text-slate-500 group-hover:text-orange-400" />
                  <span>Notification Preferences</span>
                </div>
                <ChevronRight size={13} className="text-slate-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition" />
              </div>
            </div>
          </div>

          {/* 3. NEED HELP? / SUPPORT CARD */}
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-white">
              <HelpCircle size={17} className="text-orange-400" />
              <h3 className="text-sm font-bold">Need Help?</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              If you need any assistance with your account or profile, our support team is available 24/7.
            </p>

            <a
              href="mailto:support@orangetree.com"
              className="block text-center w-full py-2.5 rounded-xl border border-orange-500/40 text-orange-400 hover:bg-orange-500/10 font-bold text-xs transition cursor-pointer"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECURITY & PRIVACY MODALS */}
      {/* ========================================================================= */}

      {/* 1. CHANGE PASSWORD MODAL */}
      {activeModal === "password" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <form
            onSubmit={handlePasswordChangeSubmit}
            className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
                  <Key size={15} />
                </div>
                <h3 className="text-base font-bold text-white">Change Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {passwordStatus.error && (
              <div className="p-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
                {passwordStatus.error}
              </div>
            )}

            {passwordStatus.success && (
              <div className="p-3 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                {passwordStatus.success}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={passwordStatus.loading}
                className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs transition shadow-lg shadow-orange-500/10 cursor-pointer disabled:opacity-50"
              >
                {passwordStatus.loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. TWO-FACTOR AUTHENTICATION MODAL */}
      {activeModal === "2fa" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
                <h3 className="text-base font-bold text-white">Two-Factor Authentication</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <p>
                Two-Factor Authentication (2FA) adds an extra layer of security to your Orange Tree LMS account by requiring an OTP code during sign in.
              </p>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">2FA Status</h4>
                  <p className="text-[11px] text-slate-400">
                    {is2FAEnabled ? "Active — Account Protected" : "Inactive — Standard Login"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                    is2FAEnabled
                      ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                      : "bg-orange-500 text-slate-950 hover:bg-orange-400"
                  }`}
                >
                  {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ACTIVE SESSIONS MODAL */}
      {activeModal === "sessions" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Monitor size={16} />
                </div>
                <h3 className="text-base font-bold text-white">Active Sessions</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Monitor size={18} className="text-emerald-400" />
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      <span>Windows PC — Chrome</span>
                      <span className="text-[10px] font-black text-emerald-400 uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Current</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">192.168.1.9 • Active now</p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone size={18} className="text-slate-400" />
                  <div>
                    <h4 className="font-bold text-slate-300">Android Device — Chrome Mobile</h4>
                    <p className="text-[11px] text-slate-500">192.168.1.9 • Last active 2h ago</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. PRIVACY SETTINGS MODAL */}
      {activeModal === "privacy" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Globe size={16} />
                </div>
                <h3 className="text-base font-bold text-white">Privacy Settings</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-400">Control who can view your learning profile and achievements.</p>

              <div className="space-y-2">
                <label
                  onClick={() => handleTogglePrivacy("Public")}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    profileVisibility === "Public"
                      ? "bg-orange-500/10 border-orange-500 text-white"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-sm">Public Profile</h4>
                    <p className="text-[11px] text-slate-400">Visible to instructors, fellow students, and leaderboards</p>
                  </div>
                  {profileVisibility === "Public" && <Check size={16} className="text-orange-400 stroke-[3]" />}
                </label>

                <label
                  onClick={() => handleTogglePrivacy("Private")}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    profileVisibility === "Private"
                      ? "bg-orange-500/10 border-orange-500 text-white"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-sm">Private Profile</h4>
                    <p className="text-[11px] text-slate-400">Only visible to administrators and system instructors</p>
                  </div>
                  {profileVisibility === "Private" && <Check size={16} className="text-orange-400 stroke-[3]" />}
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs transition cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. NOTIFICATION PREFERENCES MODAL */}
      {activeModal === "notifications" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Bell size={16} />
                </div>
                <h3 className="text-base font-bold text-white">Notification Preferences</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">Email Announcements</h4>
                  <p className="text-[11px] text-slate-400">Receive course and platform announcements</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.emailAnnouncements}
                  onChange={(e) => setNotificationPrefs({ ...notificationPrefs, emailAnnouncements: e.target.checked })}
                  className="h-4 w-4 accent-orange-500 cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">Course & Assignment Reminders</h4>
                  <p className="text-[11px] text-slate-400">Notifications when assignments or quizzes are due</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.courseUpdates}
                  onChange={(e) => setNotificationPrefs({ ...notificationPrefs, courseUpdates: e.target.checked })}
                  className="h-4 w-4 accent-orange-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs transition cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
