"use client";

import { AnimatePresence, motion } from "framer-motion";

import useChat from "@/hooks/useChat";

import ChatHeader from "./ChatHeader";
import ChatSidebar from "./ChatSidebar";
import ChatConversation from "./ChatConversation";

export default function ChatWindow() {
  const { isOpen, confirmDialog, setConfirmDialog, activeConversation } = useChat();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{
            opacity: 0,
            x: 40,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          exit={{
            opacity: 0,
            x: 40,
          }}
          transition={{
            duration: 0.25,
          }}
          className="
          fixed
          top-0
          right-0
          z-[9999]

          flex
          h-screen
          w-full
          max-w-[800px]
          flex-col

          border-l
          border-border/80

          bg-background
          shadow-luxury-md
          "
        >
          <ChatHeader />

          <div className="flex flex-1 overflow-hidden">

            <div
              className={`
              w-full
              md:w-[280px]
              border-r
              border-border/80

              bg-background/40
              ${activeConversation ? "hidden md:block" : "block"}
              `}
            >
              <ChatSidebar />
            </div>

            <div className={`flex-1 bg-background/40 ${activeConversation ? "block" : "hidden md:block"}`}>
              <ChatConversation />
            </div>

          </div>

          {/* Custom Confirm Dialog Overlay */}
          {confirmDialog?.isOpen && (
            <div className="absolute inset-0 bg-background/85 flex items-center justify-center p-6 z-[10005] animate-in fade-in duration-200 rounded-2xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-popover border border-border/80 rounded-2xl p-6 shadow-luxury-md max-w-sm w-full text-center"
              >
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {confirmDialog.title || "Confirmation"}
                </h3>
                <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                  {confirmDialog.message || "Are you sure you want to proceed?"}
                </p>
                <div className="flex gap-3 justify-center text-xs font-semibold">
                  <button
                    onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                    className="px-4 py-2.5 rounded-xl bg-muted text-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                      setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                    }}
                    className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}