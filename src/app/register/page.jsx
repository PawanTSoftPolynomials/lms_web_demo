"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import useAuth from "@/hooks/useAuth";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthAlert from "@/components/auth/AuthAlert";
import AuthInput from "@/components/auth/AuthInput";
import PasswordFields from "@/components/auth/PasswordFields";
import AuthFooter from "@/components/auth/AuthFooter";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  // state & handlers...

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Create Account"
          description="Create your Orange Tree LMS account."
        />

        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthAlert type="error" message={error} />

          <AuthInput
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
          />

          <AuthInput
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />

          <AuthInput
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Enter your phone number"
          />

          <AuthInput
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter your address"
          />

          <PasswordFields
            password={formData.password}
            confirmPassword={formData.confirmPassword}
            onPasswordChange={(e) =>
              handleChange({
                target: {
                  name: "password",
                  value: e.target.value,
                },
              })
            }
            onConfirmPasswordChange={(e) =>
              handleChange({
                target: {
                  name: "confirmPassword",
                  value: e.target.value,
                },
              })
            }
            passwordLabel="Password"
            confirmPasswordLabel="Confirm Password"
            passwordPlaceholder="Enter your password"
            confirmPasswordPlaceholder="Confirm your password"
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Register"}
          </Button>

          <AuthFooter
            question="Already have an account?"
            actionHref="/login"
            actionText="Login"
          />
        </form>
      </AuthCard>
    </AuthLayout>
  );
}