import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const wsRef = useRef();
  let room = "";

  useEffect(() => {
    const ws = new WebSocket("http://localhost:8080");
    wsRef.current = ws;
    const room = prompt("Room Id ?");
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join",
          payload: {
            room,
          },
        })
      );
    };

    ws.onmessage = (event) => {
      console.log(event.data);
      setMessages((prev) => [...prev, event.data]);
    };
  }, []);

  const sendMessage = () => {
    const message: HTMLInputElement = document.getElementById("inputId")?.value;
    wsRef.current.send(
      JSON.stringify({ type: "chat", payload: { message, room } })
    );
    if (document.getElementById("inputId").value) {
      document.getElementById("inputId").value = "";
    }
  };
  return (
    <div className="container">
      <div className="card">
        <header>
          <h1 style={{ marginBottom: "10px" }}>Real Time Chat</h1>
          <p>Temporary room that expires after both users exit</p>
        </header>
        <div className="card-text">
          <span>Room Code: Red</span>
          <span>Users: 2/2</span>
        </div>
        <div className="card-body">
          {messages.map((message) => (
            <div key={message}>{message}</div>
          ))}
        </div>

        <div className="card-footer">
          <input type="text" id="inputId" placeholder="Type a message..." />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
// 128
