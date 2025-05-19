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

      // when some user connects update, the active users count
      let count = 0;
      allSockets.forEach((allSocket) => {
        if (allSocket.room === parsedMessage.payload.room) {
          count += 1;
        }
      });

      allSockets.forEach(
        (allSocket) =>
          allSocket.room === parsedMessage.payload.room &&
          allSocket.socket.send(
            JSON.stringify({
              type: "info",
              info: {
                room: parsedMessage.payload.room,
                count,
              },
            })
          )
      );
    }

    if (parsedMessage.type === "chat") {
      const currentUserRoom = allSockets.find((x) => x.socket === socket);
      allSockets.forEach(
        (allSocket) =>
          currentUserRoom?.room === allSocket.room &&
          allSocket.socket.send(
            JSON.stringify({
              message: parsedMessage.payload.message,
              //this is to check if the message is for receiver or sender to apply styles
              type: socket === allSocket.socket ? "sender" : "receiver",
            })
          )
      );
    }
  });

  socket.on("close", () => {
    //update the active users count on frontend
    const currSocket = allSockets.find(
      (allSocket) => allSocket.socket === socket
    );
    // filter out the socket which is just disconnected
    allSockets = allSockets.filter((allSocket) => allSocket.socket !== socket);

    //update the active users count on frontend
    let count = 0;
    allSockets.forEach((allSocket) => {
      if (allSocket.room === currSocket?.room) {
        count += 1;
      }
    });

    allSockets.forEach(
      (allSocket) =>
        allSocket.room === currSocket?.room &&
        allSocket.socket.send(
          JSON.stringify({
            type: "info",
            info: {
              room: currSocket?.room,
              count,
            },
          })
        )
    );
  });
});
