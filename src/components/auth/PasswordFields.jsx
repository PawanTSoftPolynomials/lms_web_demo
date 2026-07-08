"use client";

import AuthInput from "./AuthInput";

export default function PasswordFields({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
}) {
  return (
    <>
      <AuthInput
        label="New Password"
        type="password"
        value={password}
        placeholder="Enter new password"
        onChange={onPasswordChange}
      />

      <AuthInput
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        placeholder="Confirm new password"
        onChange={onConfirmPasswordChange}
      />
    </>
  );
}