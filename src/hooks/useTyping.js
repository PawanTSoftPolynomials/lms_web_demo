import useChat from "@/hooks/useChat";

export default function useTyping() {
  const { activeConversation } = useChat();

  const startTyping = async () => {
    if (!activeConversation) return;
    
    try {
      // TODO: Implement typing indicator to API
      // const response = await chatService.setTyping(activeConversation.id, true);
    } catch (error) {
      console.error("Error starting typing indicator:", error);
    }
  };

  const stopTyping = async () => {
    if (!activeConversation) return;
    
    try {
      // TODO: Implement stop typing indicator to API
      // const response = await chatService.setTyping(activeConversation.id, false);
    } catch (error) {
      console.error("Error stopping typing indicator:", error);
    }
  };

  return { startTyping, stopTyping };
}
