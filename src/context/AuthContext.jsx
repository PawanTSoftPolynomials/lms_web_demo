"use client";

import { createContext, useContext, useEffect, useState } from "react";

import Cookies from "js-cookie";

import { loginUser, registerUser } from "@/services/auth.service";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("accessToken");

    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

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

    setUser(user);

    return user;
  };

  const logout = () => {
    Cookies.remove("accessToken");

    Cookies.remove("refreshToken");

    Cookies.remove("role");

    localStorage.removeItem("user");

    setUser(null);
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
