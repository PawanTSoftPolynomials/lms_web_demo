import { MessageSquare, MessageSquarePlus, Minus, X } from "lucide-react";
import useChat from "@/hooks/useChat";

export default function ChatHeader() {
  const { toggleChat, sidebarMode, setSidebarMode } = useChat();

  const handleToggleMode = () => {
    setSidebarMode((prev) => (prev === "chats" ? "users" : "chats"));
  };

  return (
    <div className="flex h-16 items-center justify-between border-b border-slate-800/50 bg-slate-950 px-5">
      <div>
        <h2 className="text-sm font-semibold text-white">
          {sidebarMode === "chats" ? "Messages" : "Start New Chat"}
        </h2>

        <p className="text-[10px] text-slate-400">
          {sidebarMode === "chats" ? "Orange LMS Messenger" : "Select a user to chat"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleToggleMode}
          title={sidebarMode === "chats" ? "New conversation" : "Back to chats"}
          className={`
            flex
            h-8
            w-8
            items-center
            justify-center

            rounded-lg
            transition-all
            duration-200

            ${
              sidebarMode === "users"
                ? "bg-orange-500/10 text-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.15)]"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }
          `}
        >
          {sidebarMode === "users" ? (
            <MessageSquare size={16} />
          ) : (
            <MessageSquarePlus size={16} />
          )}
        </button>

        <button
          className="
          flex
          h-8
          w-8
          items-center
          justify-center

          rounded-lg

          text-slate-400

          transition

          hover:bg-slate-800
          hover:text-white
          "
        >
          <Minus size={16} />
        </button>

        <button
          onClick={toggleChat}
          className="
          flex
          h-8
          w-8
          items-center
          justify-center

          rounded-lg

          text-slate-400

          transition

          hover:bg-red-500
          hover:text-white
          "
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}