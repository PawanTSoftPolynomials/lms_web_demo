"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import useAuth from "@/hooks/useAuth";
import Loader from "@/components/common/Loader";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";

export default function LoginPage() {
  const router = useRouter();

  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const user = await login(formData);

      if (user.role === "ADMIN") {
        router.replace("/admin/dashboard");
      } else if (user.role === "INSTRUCTOR") {
        router.replace("/instructor/dashboard");
      } else {
        router.replace("/student/dashboard");
      }
    } catch (error) {
      setLoading(false);

      alert(error.response?.data?.message || "Login failed");
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-950">
        <Loader />
      </div>
    );
  }
  return (
    <AuthLayout title="Login" subtitle="Access your learning dashboard">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          type="email"
          name="email"
          placeholder="Enter your email"
          onChange={handleChange}
        />

        <AuthInput
          type="password"
          name="password"
          placeholder="Enter your password"
          onChange={handleChange}
        />
        
        <button
          type="submit"
          disabled={loading}
          className="
    w-full
    rounded-lg
    bg-orange-600
    py-3
    font-semibold
    text-white
    disabled:opacity-50
  "
        >
          {loading ? <Loader /> : "Login"}
        </button>

        <p className="text-center text-slate-400 text-sm">
          Don't have an account?{" "}
          <a href="/register" className="text-orange-500">
            Register
          </a>
        </p>
      </form>
    </AuthLayout>
  );
}
