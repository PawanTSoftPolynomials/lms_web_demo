import useChat from "@/hooks/useChat";
import { sendMessage as apiSendMessage } from "@/features/chat/api/chat.api";

export default function useSendMessage() {
  const { activeConversation, setMessages, setConversations } = useChat();

  return async (message, attachments = []) => {
    if (!activeConversation) return null;
    if (!message.trim() && attachments.length === 0) return null;
    
    try {
      const response = await apiSendMessage(activeConversation.id, {
        text: message.trim(),
        attachments,
      });
      
      const newMessage = response.data || response;
      
      // 1. Update active messages list if not already added by socket
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });

      // 2. Update sidebar conversations list instantly
      setConversations((prev) => {
        const convIndex = prev.findIndex((c) => c.id === activeConversation.id);
        if (convIndex === -1) return prev;
        
        const targetConv = { ...prev[convIndex] };
        
        // Format last message text
        let text = "";
        if (newMessage.content && newMessage.content.trim()) {
          text = newMessage.content;
        } else if (newMessage.messageAttachments && newMessage.messageAttachments.length > 0) {
          const type = newMessage.messageAttachments[0].type;
          if (type === "IMAGE") text = "📷 Photo";
          else if (type === "VIDEO") text = "🎥 Video";
          else if (type === "AUDIO") text = "🎵 Audio";
          else if (type === "DOCUMENT") text = "📄 Document";
          else text = "📎 Attachment";
        }
        
        targetConv.lastMessage = text;
        
        // Format last message timestamp
        const msgDate = new Date(newMessage.createdAt);
        targetConv.lastSeen = msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const updatedList = [...prev];
        updatedList.splice(convIndex, 1); // remove from old position
        return [targetConv, ...updatedList]; // insert at top
      });
      
      return newMessage;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };
}
