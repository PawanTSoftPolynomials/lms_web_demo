"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

import {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
} from "@/services/auth.service";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const token = Cookies.get("accessToken");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await getProfile();

      setUser(response.data);

      localStorage.setItem(
        "user",
        JSON.stringify(response.data)
      );
    } catch (error) {
      console.error("Authentication initialization failed:", error);

      logoutLocal();
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    return await registerUser(data);
  };

  const login = async (credentials) => {
    const response = await loginUser(credentials);

    const { accessToken, refreshToken, user } = response.data;

    Cookies.set("accessToken", accessToken, {
      expires: 1,
    });

    Cookies.set("refreshToken", refreshToken, {
      expires: 7,
    });

    Cookies.set("role", user.role, {
      expires: 1,
    });

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    setUser(user);

    return user;
  };

  const logoutLocal = () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("role");

    localStorage.removeItem("user");

    setUser(null);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      logoutLocal();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);