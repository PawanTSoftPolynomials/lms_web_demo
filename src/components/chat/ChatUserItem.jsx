"use client";

import ChatAvatar from "./ChatAvatar";
import OnlineBadge from "./OnlineBadge";

export default function ChatUserItem({
  conversation,
  active,
  onClick,
}) {
  const lastMessage =
    conversation.messages?.length > 0
      ? conversation.messages[conversation.messages.length - 1]
      : null;

  return (
    <button
      onClick={onClick}
      className={`
        group
        w-full
        border-b
        border-slate-800
        px-4
        py-4
        transition-all
        duration-200

        ${
          active
            ? "bg-slate-800"
            : "hover:bg-slate-800/60"
        }
      `}
    >
      <div className="flex items-start gap-3">

        <div className="relative">

          <ChatAvatar
            name={conversation.name}
            image={conversation.avatar}
          />

          <OnlineBadge
            online={conversation.online}
          />

        </div>

        <div className="min-w-0 flex-1 text-left">

          <div className="flex items-center justify-between">

            <h3
              className="
              truncate

              text-sm
              font-semibold

              text-white
              "
            >
              {conversation.name}
            </h3>

            <span
              className="
              ml-2

              whitespace-nowrap

              text-[11px]

              text-slate-500
              "
            >
              {conversation.lastSeen}
            </span>

          </div>

          <p
            className="
            mt-1

            text-xs

            font-medium

            text-orange-400
            "
          >
            {conversation.role}
          </p>

          <div className="mt-2 flex items-center justify-between">

            <p
              className="
              flex-1

              truncate

              text-xs

              text-slate-400
              "
            >
              {lastMessage
                ? lastMessage.text
                : "No messages"}
            </p>

            {conversation.unread > 0 && (
              <div
                className="
                ml-2

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
                "
              >
                {conversation.unread}
              </div>
            )}

          </div>

        </div>

      </div>
    </button>
  );
}