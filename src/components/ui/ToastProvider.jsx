"use client";

import { createContext, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success", title = null) => {
    setToast({
      message,
      type,
      title,
    });

    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast && (
        <div
          className={`
            fixed
            top-5
            right-5
            z-[9999]
            rounded-2xl
            p-4
            shadow-2xl
            text-white
            transition-all
            border
            min-w-[280px]
            max-w-[360px]
            animate-in
            fade-in
            slide-in-from-top-4
            duration-200
            ${
              toast.type === "success"
                ? "bg-slate-900 border-green-500/20 shadow-green-950/20"
                : toast.type === "error"
                ? "bg-slate-900 border-red-500/20 shadow-red-950/20"
                : "bg-slate-900 border-orange-500/20 shadow-orange-950/20"
            }
          `}
        >
          <div className="flex gap-3 items-start">
            <div className={`p-1.5 rounded-lg shrink-0 ${
              toast.type === "success"
                ? "text-green-500 bg-green-500/10"
                : toast.type === "error"
                ? "text-red-500 bg-red-500/10"
                : "text-orange-500 bg-orange-500/10"
            }`}>
              {toast.type === "success" ? (
                <CheckCircle2 size={16} />
              ) : toast.type === "error" ? (
                <AlertCircle size={16} />
              ) : (
                <Info size={16} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              {toast.title && (
                <h4 className="font-extrabold text-xs text-white leading-tight uppercase tracking-wider mb-1">
                  {toast.title}
                </h4>
              )}
              <p className="text-xs text-slate-300 leading-relaxed font-medium break-words">
                {toast.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);