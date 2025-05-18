import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  socket: WebSocket;
  room: String;
}

let allSockets: User[] = [];

wss.on("connection", (socket) => {
  socket.on("message", (message) => {
    //@ts-ignore
    const parsedMessage = JSON.parse(message);

    if (parsedMessage.type === "join") {
      allSockets.push({ socket, room: parsedMessage.payload.room });
    }

    if (parsedMessage.type === "chat") {
      const currentUserRoom = allSockets.find((x) => x.socket === socket);
      allSockets.forEach(
        (allSocket) =>
          currentUserRoom?.room === parsedMessage.payload.room &&
          allSocket.socket.send(parsedMessage.payload.message)
      );
    }
  });

  socket.on("close", () => {
    allSockets = allSockets.filter((allSocket) => allSocket.socket !== socket);
  });
});
