import useChat from "@/hooks/useChat";
import { sendMessage as apiSendMessage } from "@/features/chat/api/chat.api";

export default function useSendMessage() {
  const { activeConversation, setMessages } = useChat();

  return async (message) => {
    if (!activeConversation || !message.trim()) return null;
    
    try {
      const response = await apiSendMessage(activeConversation.id, {
        text: message.trim(),
      });
      
      const newMessage = response.data || response;
      
      // Update local state if not already added by socket
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
      
      return newMessage;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };
}
