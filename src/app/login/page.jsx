"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import useAuth from "@/hooks/useAuth";

import Loader from "@/components/common/Loader";
import AuthLayout from "@/components/auth/AuthLayout";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const user =
        await login(formData);

      switch (user.role) {
        case "ADMIN":
          router.replace(
            "/admin/dashboard"
          );
          break;

        case "INSTRUCTOR":
          router.replace(
            "/instructor/dashboard"
          );
          break;

        default:
          router.replace(
            "/student/dashboard"
          );
      }
    } catch (error) {
      setLoading(false);

      alert(
        error.response?.data
          ?.message ||
          "Login failed"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader />
      </div>
    );
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2">
          Login
        </h1>

        <p className="text-slate-400 mb-6">
          Access your learning dashboard
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />

          <Button
            type="submit"
            className="w-full"
          >
            Login
          </Button>

          <p className="text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-orange-500"
            >
              Register
            </Link>
          </p>
        </form>
      </Card>
    </AuthLayout>
  );
}