"use client";

export default function EmptyConversation() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-white">
          Select a conversation
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Choose a user to start chatting.
        </p>
      </div>
    </div>
  );
}