"use client";

import { MessageCircleMore } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import useChat from "@/hooks/useChat";

export default function ChatButton() {
  const { isOpen, toggleChat, unreadCount } = useChat();

  return (
    <AnimatePresence>

      {!isOpen && (

        <motion.button
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            scale: 0.8,
          }}
          whileHover={{
            scale: 1.08,
          }}
          whileTap={{
            scale: 0.95,
          }}
          onClick={toggleChat}
          className="
          fixed

          bottom-6
          right-6

          z-[9999]

          flex
          h-16
          w-16

          items-center
          justify-center

          rounded-full

          bg-gradient-to-br
          from-orange-500
          to-orange-600

          text-white

          shadow-[0_15px_35px_rgba(249,115,22,0.45)]
          "
        >

          <MessageCircleMore size={30} />

          {unreadCount > 0 && (

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="
              absolute

              -right-1
              -top-1

              flex
              h-6
              min-w-[24px]

              items-center
              justify-center

              rounded-full

              bg-red-500

              px-1

              text-[11px]
              font-bold

              text-white
              "
            >
              {unreadCount}
            </motion.div>

          )}

        </motion.button>

      )}

    </AnimatePresence>
  );
}