"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import useUpdateProfile from "@/hooks/queries/student/useUpdateProfile";
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

  if (!isOpen) return null;

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
