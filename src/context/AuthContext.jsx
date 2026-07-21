"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  const router = useRouter();
  const pathname = usePathname();

  const logoutLocal = () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("role");

    localStorage.removeItem("user");

    setUser(null);
  };

  const initializeAuth = async () => {
    const token = Cookies.get("accessToken");

    if (!token) {
      logoutLocal();
      setLoading(false);
      return;
    }

    // Restore cached user from localStorage synchronously to prevent layout flashes
    const cachedUser = localStorage.getItem("user");
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) {
        console.warn("Authentication recovery from cache failed:", e);
      }
    }

    try {
      const response = await getProfile();
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch (error) {
      console.error("Authentication initialization failed:", error);
      logoutLocal();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  // Automatic startup dashboard redirects for authenticated users on guest pages
  useEffect(() => {
    if (!loading && user) {
      const guestRoutes = [
        "/",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/verify-otp"
      ];
      if (guestRoutes.includes(pathname)) {
        const dashboardPath =
          user.role === "ADMIN"
            ? "/admin/dashboard"
            : user.role === "INSTRUCTOR"
            ? "/instructor/dashboard"
            : "/student/dashboard";
        router.replace(dashboardPath);
      }
    }
  }, [user, loading, pathname, router]);

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

    localStorage.setItem("user", JSON.stringify(user));

    if (typeof window !== "undefined") {
      sessionStorage.setItem("fresh_login", "true");
    }

    setUser(user);
    return user;
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