import ChatAvatar from "./ChatAvatar";
import OnlineBadge from "./OnlineBadge";
import { useAuth } from "@/context/AuthContext";

export default function ChatUserCard({ conversation, active, onClick }) {
  const { user: currentUser } = useAuth();
  
  // Get initials or fallback
  const name = conversation?.name || "Unknown User";
  
  // Find other participant (recipient)
  const recipient = conversation?.participants?.find((p) => {
    const pId = p?.userId || p?.user?.id || p?.id;
    const pEmail = p?.user?.email || p?.email;
    const currentUserId = currentUser?.id || currentUser?._id;
    return p && pId !== currentUserId && pEmail !== currentUser?.email;
  });
  const role = recipient?.role || recipient?.user?.role || conversation?.role || (conversation?.isGroup ? "GROUP" : "STUDENT");

  // Format last message text
  const lastMessage = conversation?.lastMessage || 
                      conversation?.messages?.[conversation?.messages?.length - 1]?.text || 
                      conversation?.messages?.[conversation?.messages?.length - 1]?.content;

  const getRoleBadgeStyle = (userRole) => {
    const formatted = (userRole || "").toUpperCase();
    if (formatted.includes("INSTRUCTOR")) {
      return "bg-orange-500/10 text-orange-400 border border-orange-500/25";
    }
    if (formatted.includes("ADMIN")) {
      return "bg-purple-500/10 text-purple-400 border border-purple-500/25";
    }
    if (formatted.includes("GROUP")) {
      return "bg-teal-500/10 text-teal-400 border border-teal-500/25";
    }
    return "bg-blue-500/10 text-blue-400 border border-blue-500/25";
  };

  return (
    <button
      onClick={onClick}
      className={`
        relative
        w-full
        flex
        items-start
        gap-3.5
        px-4
        py-3.5
        text-left
        transition-all
        duration-300
        border-b
        border-slate-800/40

        ${
          active
            ? "bg-slate-800/30 border-l-[3px] border-l-orange-500 pl-[13px] bg-gradient-to-r from-orange-500/5 to-transparent"
            : "hover:bg-slate-800/20 border-l-[3px] border-l-transparent"
        }
      `}
    >
      <div className="relative flex-shrink-0">
        <ChatAvatar name={name} image={conversation?.avatar} />
        <OnlineBadge online={conversation?.online} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-semibold text-sm text-slate-100 truncate group-hover:text-white transition-colors flex items-center gap-1.5">
            <span>{name}</span>
            {role && (
              <span className={`
                rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider
                ${getRoleBadgeStyle(role)}
              `}>
                {role}
              </span>
            )}
          </h3>
          
          {conversation?.lastSeen && (
            <span className="text-[10px] text-slate-500 whitespace-nowrap">
              {conversation.lastSeen}
            </span>
          )}
        </div>

        <p className="mt-1 text-xs text-slate-400 truncate pr-4">
          {lastMessage || "No messages yet"}
        </p>
      </div>

      {conversation?.unread > 0 && (
        <div className="
          absolute
          right-4
          bottom-4
          flex
          h-5
          min-w-[20px]
          items-center
          justify-center
          rounded-full
          bg-orange-500
          px-1.5
          text-[10px]
          font-bold
          text-white
          shadow-[0_0_10px_rgba(249,115,22,0.4)]
        ">
          {conversation.unread}
        </div>
      )}
    </button>
  );
}