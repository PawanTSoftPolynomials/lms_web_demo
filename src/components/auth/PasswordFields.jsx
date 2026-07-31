"use client";

import AuthInput from "./AuthInput";

export default function PasswordFields({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  passwordLabel = "New Password",
  passwordPlaceholder = "Enter new password",
  confirmPasswordLabel = "Confirm Password",
  confirmPasswordPlaceholder = "Confirm new password",
}) {
  return (
    <>
      <AuthInput
        label={passwordLabel}
        type="password"
        value={password}
        placeholder={passwordPlaceholder}
        onChange={onPasswordChange}
        required
      />

      <AuthInput
        label={confirmPasswordLabel}
        type="password"
        value={confirmPassword}
        placeholder={confirmPasswordPlaceholder}
        onChange={onConfirmPasswordChange}
        required
      />
    </>
  );
}