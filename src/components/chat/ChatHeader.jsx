import { MessageSquare, MessageSquarePlus, Minus, X } from "lucide-react";
import useChat from "@/hooks/useChat";

export default function ChatHeader() {
  const { toggleChat, sidebarMode, setSidebarMode } = useChat();

  const handleToggleMode = () => {
    setSidebarMode((prev) => (prev === "chats" ? "users" : "chats"));
  };

  return (
    <div className="flex h-16 items-center justify-between border-b border-border/50 bg-background px-5">
      <div>
        <h2 className="text-sm font-semibold text-foreground">
          {sidebarMode === "chats" ? "Messages" : "Start New Chat"}
        </h2>

        <p className="text-[10px] text-muted-foreground">
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
                ? "bg-primary/10 text-primary shadow-[0_0_10px_rgba(249,115,22,0.15)]"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
          onClick={toggleChat}
          className="
          flex
          h-8
          w-8
          items-center
          justify-center

          rounded-lg

          text-muted-foreground

          transition

          hover:bg-muted
          hover:text-foreground
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

          text-muted-foreground

          transition

          hover:bg-red-500
          hover:text-foreground
          "
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}