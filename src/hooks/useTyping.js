import useChat from "@/hooks/useChat";
import socketService from "@/services/socket.service";

export default function useTyping() {
  const { activeConversation } = useChat();

  const startTyping = async () => {
    if (!activeConversation) return;
    socketService.emit("typing_start", { conversationId: activeConversation.id });
  };

  const stopTyping = async () => {
    if (!activeConversation) return;
    socketService.emit("typing_stop", { conversationId: activeConversation.id });
  };

  return { startTyping, stopTyping };
}
