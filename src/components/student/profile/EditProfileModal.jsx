"use client";

<<<<<<< HEAD
import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
=======
import { useEffect, useState } from "react";
import { X } from "lucide-react";
>>>>>>> 3a2a149af33ddab1101f22c815a2cdd8a794cd7e

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import useUpdateProfile from "@/hooks/queries/student/useUpdateProfile";
<<<<<<< HEAD
import DatePicker from "@/components/ui/DatePicker";

export default function EditProfileModal({ isOpen, onClose, profile }) {
  const updateProfileMutation = useUpdateProfile();
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    education: "",
    guardianName: "",
    dateOfBirth: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

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
        education: student.education || "",
        guardianName: student.guardianName || "",
        dateOfBirth: dobStr,
      });
    }
  }, [profile]);
=======

const EMPLOYMENT_STATUS_OPTIONS = ["STUDENT", "EMPLOYED", "UNEMPLOYED", "FREELANCER", "ENTREPRENEUR"];
const LEARNING_STYLE_OPTIONS = ["VISUAL", "AUDITORY", "READING_WRITING", "KINESTHETIC"];
const STUDY_TIME_OPTIONS = ["MORNING", "AFTERNOON", "EVENING", "NIGHT"];

const toDateInputValue = (value) => (value ? new Date(value).toISOString().slice(0, 10) : "");

const buildInitialForm = (profile) => {
    const student = profile?.studentProfile || {};
    return {
        phoneNumber: profile?.phoneNumber || "",
        address: profile?.address || "",
        education: student.education || "",
        guardianName: student.guardianName || "",

        gender: student.gender || "",
        dateOfBirth: toDateInputValue(student.dateOfBirth),
        country: student.country || "",
        state: student.state || "",
        city: student.city || "",

        highestQualification: student.highestQualification || "",
        currentQualification: student.currentQualification || "",
        collegeName: student.collegeName || "",
        branchOrStream: student.branchOrStream || "",
        graduationYear: student.graduationYear ?? "",
        semester: student.semester || "",
        cgpaOrPercentage: student.cgpaOrPercentage ?? "",

        employmentStatus: student.employmentStatus || "",
        yearsOfExperience: student.yearsOfExperience ?? "",
        currentJobRole: student.currentJobRole || "",
        careerGoalText: student.careerGoalText || "",

        learningGoals: student.learningGoals || "",
        preferredLearningStyle: student.preferredLearningStyle || "",
        weeklyStudyHours: student.weeklyStudyHours ?? "",
        preferredStudyTime: student.preferredStudyTime || "",
        language: student.language || "",
        technicalSkills: Array.isArray(student.technicalSkills) ? student.technicalSkills.join(", ") : "",
    };
};

const SelectField = ({ label, value, onChange, options }) => (
    <div className="space-y-2">
        <label className="text-sm text-slate-300">{label}</label>
        <select
            value={value}
            onChange={onChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-orange-500"
        >
            <option value="">Not specified</option>
            {options.map((opt) => (
                <option key={opt} value={opt}>
                    {opt.replaceAll("_", " ")}
                </option>
            ))}
        </select>
    </div>
);

const SectionTitle = ({ children }) => (
    <h3 className="col-span-full text-xs font-bold uppercase tracking-widest text-orange-400/90 pt-2">{children}</h3>
);

export default function EditProfileModal({
                                              isOpen,
                                              onClose,
                                              profile,
                                          }) {
    const [form, setForm] = useState(() => buildInitialForm(profile));
    const updateProfile = useUpdateProfile();

    useEffect(() => {
        if (isOpen) setForm(buildInitialForm(profile));
    }, [isOpen, profile]);

    if (!isOpen) return null;

    const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSave = async () => {
        try {
            await updateProfile.mutateAsync({
                ...form,
                graduationYear: form.graduationYear === "" ? null : Number(form.graduationYear),
                cgpaOrPercentage: form.cgpaOrPercentage === "" ? null : Number(form.cgpaOrPercentage),
                yearsOfExperience: form.yearsOfExperience === "" ? 0 : Number(form.yearsOfExperience),
                weeklyStudyHours: form.weeklyStudyHours === "" ? null : Number(form.weeklyStudyHours),
                technicalSkills: form.technicalSkills.split(",").map((s) => s.trim()).filter(Boolean),
            });
            onClose();
        } catch (err) {
            console.error("Profile update failed:", err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="flex w-full max-w-3xl max-h-[90vh] flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                        <p className="mt-1 text-xs text-slate-500">
                            This information personalizes your AI entry assessments and learning path.
                        </p>
                    </div>
>>>>>>> 3a2a149af33ddab1101f22c815a2cdd8a794cd7e

  if (!isOpen) return null;

<<<<<<< HEAD
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      await updateProfileMutation.mutateAsync(formData);
      onClose();
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message || "Failed to update profile. Please try again."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="grid gap-5 p-6 md:grid-cols-2">
          {errorMsg && (
            <div className="md:col-span-2 p-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
              {errorMsg}
            </div>
          )}

          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <Input
            label="Email"
            value={profile?.email || ""}
            disabled
          />

          <Input
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Enter phone number"
          />

          <DatePicker
            label="Date of Birth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            placeholder="Select Date of Birth"
          />

          <Input
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter address"
          />

          <Input
            label="Education"
            name="education"
            value={formData.education}
            onChange={handleChange}
            placeholder="Enter education"
          />

          <Input
            label="Guardian Name"
            name="guardianName"
            value={formData.guardianName}
            onChange={handleChange}
            placeholder="Enter guardian name"
            className="md:col-span-2"
          />
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 px-6 py-5 flex justify-end gap-3">
          <Button
            type="button"
            onClick={onClose}
            className="bg-slate-700 hover:bg-slate-600 cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold cursor-pointer disabled:opacity-50"
          >
            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
=======
                {/* Body */}
                <div className="grid gap-5 overflow-y-auto p-6 md:grid-cols-2">
                    <SectionTitle>Basic</SectionTitle>
                    <Input label="Phone Number" value={form.phoneNumber} onChange={set("phoneNumber")} />
                    <Input label="Address" value={form.address} onChange={set("address")} />
                    <Input label="Education" value={form.education} onChange={set("education")} />
                    <Input label="Guardian Name" value={form.guardianName} onChange={set("guardianName")} />

                    <SectionTitle>Demographics</SectionTitle>
                    <SelectField label="Gender" value={form.gender} onChange={set("gender")} options={["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]} />
                    <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} />
                    <Input label="Country" value={form.country} onChange={set("country")} />
                    <Input label="State" value={form.state} onChange={set("state")} />
                    <Input label="City" value={form.city} onChange={set("city")} />

                    <SectionTitle>Academic Background</SectionTitle>
                    <Input label="Highest Qualification" value={form.highestQualification} onChange={set("highestQualification")} />
                    <Input label="Current Qualification" value={form.currentQualification} onChange={set("currentQualification")} />
                    <Input label="College / University" value={form.collegeName} onChange={set("collegeName")} />
                    <Input label="Branch / Stream" value={form.branchOrStream} onChange={set("branchOrStream")} />
                    <Input label="Graduation Year" type="number" value={form.graduationYear} onChange={set("graduationYear")} />
                    <Input label="Semester" value={form.semester} onChange={set("semester")} />
                    <Input label="CGPA / Percentage" type="number" step="0.01" value={form.cgpaOrPercentage} onChange={set("cgpaOrPercentage")} />

                    <SectionTitle>Career &amp; Employment</SectionTitle>
                    <SelectField label="Employment Status" value={form.employmentStatus} onChange={set("employmentStatus")} options={EMPLOYMENT_STATUS_OPTIONS} />
                    <Input label="Years of Experience" type="number" step="0.5" value={form.yearsOfExperience} onChange={set("yearsOfExperience")} />
                    <Input label="Current Job Role" value={form.currentJobRole} onChange={set("currentJobRole")} />
                    <Input label="Career Goal" value={form.careerGoalText} onChange={set("careerGoalText")} className="md:col-span-2" />

                    <SectionTitle>Learning Preferences</SectionTitle>
                    <Input label="Learning Goal" value={form.learningGoals} onChange={set("learningGoals")} className="md:col-span-2" />
                    <SelectField label="Preferred Learning Style" value={form.preferredLearningStyle} onChange={set("preferredLearningStyle")} options={LEARNING_STYLE_OPTIONS} />
                    <SelectField label="Preferred Study Time" value={form.preferredStudyTime} onChange={set("preferredStudyTime")} options={STUDY_TIME_OPTIONS} />
                    <Input label="Weekly Study Hours" type="number" value={form.weeklyStudyHours} onChange={set("weeklyStudyHours")} />
                    <Input label="Preferred Language" value={form.language} onChange={set("language")} />
                    <Input
                        label="Technical Skills (comma-separated)"
                        value={form.technicalSkills}
                        onChange={set("technicalSkills")}
                        className="md:col-span-2"
                        placeholder="e.g. JavaScript, React, SQL"
                    />
                </div>

                {/* Footer */}
                <div className="border-t border-slate-800 px-6 py-5">
                    {updateProfile.isError && (
                        <p className="mb-3 text-sm text-red-500">Failed to save changes. Please try again.</p>
                    )}

                    <div className="flex justify-end gap-3">
                        <Button onClick={onClose} className="bg-slate-700 hover:bg-slate-600">
                            Cancel
                        </Button>

                        <Button onClick={handleSave} loading={updateProfile.isPending} disabled={updateProfile.isPending}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
>>>>>>> 3a2a149af33ddab1101f22c815a2cdd8a794cd7e
