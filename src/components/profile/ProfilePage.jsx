"use client";

import { useState } from "react";
import { changePassword } from "@/services/auth.service";
import useAuth from "@/hooks/useAuth";

export default function ProfilePage() {
  const { user } = useAuth();

  const [formData, setFormData] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setError("");
      setMessage("");

      if (
        formData.newPassword !==
        formData.confirmPassword
      ) {
        setError(
          "Passwords do not match"
        );
        return;
      }

      try {
        const response =
          await changePassword({
            currentPassword:
              formData.currentPassword,
            newPassword:
              formData.newPassword,
          });

        setMessage(
          response.message
        );

        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Failed to change password"
        );
      }
    };

  return (
    <div className="max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">
        Profile
      </h1>

      <div className="bg-slate-900 p-6 rounded-xl mb-8">
        <p>
          <strong>Name:</strong>{" "}
          {user?.name}
        </p>

        <p>
          <strong>Email:</strong>{" "}
          {user?.email}
        </p>

        <p>
          <strong>Role:</strong>{" "}
          {user?.role}
        </p>
      </div>

      {message && (
        <div className="bg-green-600 p-3 rounded mb-4">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-600 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input
          type="password"
          name="currentPassword"
          placeholder="Current Password"
          value={
            formData.currentPassword
          }
          onChange={handleChange}
          className="w-full p-3 rounded bg-slate-800"
        />

        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          value={
            formData.newPassword
          }
          onChange={handleChange}
          className="w-full p-3 rounded bg-slate-800"
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={
            formData.confirmPassword
          }
          onChange={handleChange}
          className="w-full p-3 rounded bg-slate-800"
        />

        <button
          type="submit"
          className="
            bg-orange-600
            px-6
            py-3
            rounded
          "
        >
          Change Password
        </button>
      </form>
    </div>
  );
}