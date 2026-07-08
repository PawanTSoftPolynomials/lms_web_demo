"use client";

import { AnimatePresence, motion } from "framer-motion";

import useChat from "@/hooks/useChat";

import ChatHeader from "./ChatHeader";
import ChatSidebar from "./ChatSidebar";
import ChatConversation from "./ChatConversation";

export default function ChatWindow() {
  const { isOpen, confirmDialog, setConfirmDialog } = useChat();

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
          border-slate-800/80

          bg-slate-950/90
          backdrop-blur-xl

          shadow-[-10px_0_50px_rgba(0,0,0,0.6)]
          "
        >
          {/* Top Neon Glow Bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-500 via-pink-500 to-indigo-500 z-[10000]" />
          
          <ChatHeader />

          <div className="flex flex-1 overflow-hidden">

            <div
              className="
              w-[280px]
              border-r
              border-slate-800/80

              bg-slate-900/40
              "
            >
              <ChatSidebar />
            </div>

            <div className="flex-1 bg-slate-950/40">
              <ChatConversation />
            </div>

          </div>

          {/* Custom Confirm Dialog Overlay */}
          {confirmDialog?.isOpen && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-6 z-[10005] animate-in fade-in duration-200 rounded-2xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-2xl max-w-sm w-full text-center backdrop-blur-lg"
              >
                <h3 className="text-lg font-bold text-white mb-2">
                  {confirmDialog.title || "Confirmation"}
                </h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  {confirmDialog.message || "Are you sure you want to proceed?"}
                </p>
                <div className="flex gap-3 justify-center text-xs font-semibold">
                  <button
                    onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                      setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 text-white shadow-md shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
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