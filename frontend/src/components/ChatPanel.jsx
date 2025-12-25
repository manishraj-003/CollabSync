import React, { useEffect, useState } from "react";

export default function ChatPanel({ ws, docId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!ws) return;

    const handleMessage = (e) => {
      const msg = JSON.parse(e.data);

      if (msg.type === "chat") {
        setMessages((prev) => [...prev, msg]);
      }
    };

    ws.addEventListener("message", handleMessage);
    return () => ws.removeEventListener("message", handleMessage);
  }, [ws]);

  function sendChat() {
    if (!input.trim()) return;

    ws.send(
      JSON.stringify({
        type: "chat",
        docId,
        text: input
      })
    );

    setInput("");
  }

  return (
    <div>
      <h2>Chat</h2>

      <div>
        {messages.map((m, i) => (
          <div key={i}>
            <strong>{m.user?.name || "User"}:</strong> {m.text}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Message..."
      />
      <button onClick={sendChat}>Send</button>
    </div>
  );
}
