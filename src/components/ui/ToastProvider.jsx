"use client";

import {
  createContext,
  useContext,
  useState,
} from "react";

const ToastContext =
  createContext();

export function ToastProvider({
  children,
}) {
  const [toast, setToast] =
    useState(null);

  const showToast = (
    message,
    type = "success"
  ) => {
    setToast({
      message,
      type,
    });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  return (
    <ToastContext.Provider
      value={{ showToast }}
    >
      {children}

      {toast && (
        <div
          className={`
            fixed
            top-5
            right-5
            z-[9999]
            rounded-lg
            px-5
            py-3
            shadow-xl
            text-white
            transition-all
            ${
              toast.type === "success"
                ? "bg-green-600"
                : toast.type === "error"
                ? "bg-red-600"
                : "bg-orange-600"
            }
          `}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () =>
  useContext(ToastContext);