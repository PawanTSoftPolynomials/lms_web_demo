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

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      phoneNumber: "",
      address: "",
      password: "",
      confirmPassword: "",
      role: "STUDENT",
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

    setError("");

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError(
        "Passwords do not match"
      );
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phoneNumber:
          formData.phoneNumber,
        address: formData.address,
        password:
          formData.password,
        role: formData.role,
      });

      router.replace("/login");
    } catch (error) {
      setLoading(false);

      setError(
        error.response?.data
          ?.message ||
          "Registration failed"
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
          Register
        </h1>

        <p className="text-slate-400 mb-6">
          Create your account
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg">
              {error}
            </div>
          )}

          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />

          <Input
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
          />

          <Input
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={
              formData.confirmPassword
            }
            onChange={handleChange}
          />

          <Button
            type="submit"
            className="w-full"
          >
            Register
          </Button>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-orange-500"
            >
              Login
            </Link>
          </p>
        </form>
      </Card>
    </AuthLayout>
  );
}