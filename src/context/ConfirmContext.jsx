"use client";

import { createContext, useContext, useState, useRef } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [dialogState, setDialogState] = useState({
    open: false,
    title: "Confirm Action",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
  });

  const [alertDialogState, setAlertDialogState] = useState({
    open: false,
    title: "Alert",
    message: "",
    confirmText: "OK",
  });

  const resolverRef = useRef(null);
  const alertResolverRef = useRef(null);

  const confirm = (options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;

      const config = typeof options === "string" 
        ? { message: options } 
        : options;

      setDialogState({
        open: true,
        title: config.title || "Confirm Action",
        message: config.message || "Are you sure?",
        confirmText: config.confirmText || "Confirm",
        cancelText: config.cancelText || "Cancel",
      });
    });
  };

  const alert = (options = {}) => {
    return new Promise((resolve) => {
      alertResolverRef.current = resolve;

      const config = typeof options === "string" 
        ? { message: options } 
        : options;

      setAlertDialogState({
        open: true,
        title: config.title || "Alert",
        message: config.message || "",
        confirmText: config.confirmText || "OK",
      });
    });
  };

  const handleConfirm = () => {
    setDialogState((prev) => ({ ...prev, open: false }));
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  };

  const handleCancel = () => {
    setDialogState((prev) => ({ ...prev, open: false }));
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  };

  const handleAlertClose = () => {
    setAlertDialogState((prev) => ({ ...prev, open: false }));
    if (alertResolverRef.current) {
      alertResolverRef.current(true);
      alertResolverRef.current = null;
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm, alert }}>
      {children}
      
      {/* Confirm Dialog */}
      <ConfirmDialog
        open={dialogState.open}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      {/* Alert Dialog */}
      <ConfirmDialog
        open={alertDialogState.open}
        title={alertDialogState.title}
        message={alertDialogState.message}
        confirmText={alertDialogState.confirmText}
        cancelText={null}
        onConfirm={handleAlertClose}
        onCancel={handleAlertClose}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context.confirm;
}

export function useAlert() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useAlert must be used within a ConfirmProvider");
  }
  return context.alert;
}
