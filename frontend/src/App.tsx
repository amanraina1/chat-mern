import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [info, setInfo] = useState("");
  const [showRoomInput, setShowRoomInput] = useState(false);
  const wsRef = useRef();
  const scrollRef = useRef();

  useEffect(() => {
    const ws = new WebSocket("http://localhost:8080");
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);

      if (parsedData.type === "info") {
        setInfo(parsedData.info);
      } else {
        setMessages((prev) => [...prev, parsedData]);
      }
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    const message: HTMLInputElement = document.getElementById("inputId")?.value;
    if (!message) return;
    wsRef.current.send(JSON.stringify({ type: "chat", payload: { message } }));
    if (document.getElementById("inputId").value) {
      document.getElementById("inputId").value = "";
    }
  };

  const sendRoomId = () => {
    const val = document.getElementById("roomInput").value;
    if (val === "") {
      alert("Please Enter room Id");
      return;
    }
    wsRef.current.send(
      JSON.stringify({
        type: "join",
        payload: {
          room: val,
        },
      })
    );

    setShowRoomInput(true);
  };

  return (
    <div className="container">
      {showRoomInput ? (
        <>
          <div className="card">
            <header>
              <h1 style={{ marginBottom: "10px" }}>Real Time Chat</h1>
              <p>Temporary room that expires after both users exit</p>
            </header>
            <div className="card-text">
              <span>Room Code: {info.room}</span>
              <span>Users: {info.count}</span>
            </div>
            <div className="card-body">
              <div className="body-text" ref={scrollRef}>
                {messages.map((msg) => (
                  <div className={msg.type} key={msg?.message}>
                    {msg?.message}
                  </div>
                ))}
              </div>
            </div>
            <div className="card-footer">
              <input type="text" id="inputId" placeholder="Type a message..." />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        </>
      ) : (
        <div className="room-box">
          <label htmlFor="roomInput">Enter Room Id</label>
          <input type="text" id="roomInput" placeholder="Type something" />
          <button onClick={sendRoomId}>Send</button>
        </div>
      )}
    </div>
  );
}

export default App;
// 128
