"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

  const logoutLocal = () => {
    // 1. Clear all authentication cookies across root and default paths
    Cookies.remove("accessToken", { path: "/" });
    Cookies.remove("refreshToken", { path: "/" });
    Cookies.remove("role", { path: "/" });

    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("role");

    // 2. Clear all local and session storage
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.clear();
      sessionStorage.clear();
    }

    // 3. Clear all React Query cached data
    try {
      if (queryClient) {
        queryClient.clear();
      }
    } catch (e) {
      console.warn("React query cache clear notice:", e);
    }

    // 4. Reset auth state
    setUser(null);
    setLoading(false);
  };

  const initializeAuth = async () => {
    const token = Cookies.get("accessToken");

    if (!token) {
      logoutLocal();
      setLoading(false);
      return;
    }

    // Restore cached user from localStorage synchronously to prevent layout flashes
    const cachedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
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
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(response.data));
      }
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
      path: "/",
    });

    Cookies.set("refreshToken", refreshToken, {
      expires: 7,
      path: "/",
    });

    Cookies.set("role", user.role, {
      expires: 1,
      path: "/",
    });

    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
      sessionStorage.setItem("fresh_login", "true");
    }

    setUser(user);
    return user;
  };

  const logout = async () => {
    try {
      const refreshToken = Cookies.get("refreshToken");
      await logoutUser(refreshToken).catch((err) => {
        console.warn("Logout API call notice:", err?.message || err);
      });
    } catch (error) {
      console.warn("Logout error handled gracefully:", error?.message || error);
    } finally {
      logoutLocal();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
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
        logoutLocal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);