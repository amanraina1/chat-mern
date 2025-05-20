import { useEffect, useRef, useState } from "react";
import "./App.css";

type info = {
  count: number;
  room: string;
};

interface ResponseType {
  type: string;
  message: string;
  info: info;
}

function App() {
  const [messages, setMessages] = useState<ResponseType[]>([]);
  const [info, setInfo] = useState<ResponseType["info"]>();
  const [showRoomInput, setShowRoomInput] = useState(true);
  const wsRef = useRef<WebSocket>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ws = new WebSocket("http://localhost:8080");
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const parsedData: ResponseType = JSON.parse(event.data);

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
    const message = (document.getElementById("inputId") as HTMLInputElement)
      .value;
    if (!message) return;
    wsRef.current?.send(JSON.stringify({ type: "chat", payload: { message } }));

    (document.getElementById("inputId") as HTMLInputElement).value = "";
  };

  const sendRoomId = () => {
    const elem = document.getElementById("roomInput") as HTMLInputElement;
    const val = elem.value;
    if (val === "") {
      alert("Please Enter room Id");
      return;
    }
    wsRef.current?.send(
      JSON.stringify({
        type: "join",
        payload: {
          room: val,
        },
      })
    );

    setShowRoomInput(false);
  };

  return (
    <div className="container">
      {showRoomInput ? (
        <>
          <div className="room-box">
            <label htmlFor="roomInput">Enter Room Id</label>
            <input type="text" id="roomInput" placeholder="Type something" />
            <button onClick={sendRoomId}>Send</button>
          </div>
        </>
      ) : (
        <div className="card">
          <header>
            <h1 style={{ marginBottom: "10px" }}>Real Time Chat</h1>
            <p>Temporary room that expires after both users exit</p>
          </header>
          <div className="card-text">
            <span>Room Code: {info?.room}</span>
            <span>Users: {info?.count}</span>
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
      )}
    </div>
  );
}

export default App;
