import { io } from "socket.io-client";

class SocketService {
  socket = null;

  connect(token) {
    if (this.socket) return this.socket;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL;
    this.socket = io(
      socketUrl,
      {
        auth: {
          token,
        },
        transports: ["websocket", "polling"],
      }
    );

    return this.socket;
  }

  disconnect() {
    if (!this.socket) return;

    this.socket.disconnect();
    this.socket = null;
  }

  on(event, callback) {
    this.socket?.on(event, callback);
  }

  off(event, callback) {
    this.socket?.off(event, callback);
  }

  emit(event, payload) {
    this.socket?.emit(event, payload);
  }
}

const socketService = new SocketService();

export default socketService;