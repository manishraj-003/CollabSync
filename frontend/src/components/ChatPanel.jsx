import React, { useEffect, useState } from "react";

export default function ChatPanel({ ws, docId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!ws) return;

    const handleMessage = (e) => {
      const msg = JSON.parse(e.data);

      if (msg.type === "chat") {
        setMessages((prev) => {
          // 🔥 de-duplicate using message id
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    };

    ws.addEventListener("message", handleMessage);

    // 🔥 cleanup to prevent duplicate listeners
    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  }, [ws]);

  function sendChat() {
    if (!input.trim()) return;

    const id = crypto.randomUUID(); // 🔥 unique message id

    // 🔥 optimistic UI update
    setMessages((prev) => [
      ...prev,
      {
        id,
        text: input,
        mine: true
      }
    ]);

    ws.send(
      JSON.stringify({
        type: "chat",
        docId,
        id,
        text: input
      })
    );

    setInput("");
  }

  return (
    <div className="w-80 border-l p-4 bg-gray-50 flex flex-col">
      <h2 className="text-lg font-semibold mb-3">Chat</h2>

      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-2 rounded shadow ${
              m.mine ? "bg-blue-100 self-end" : "bg-white"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="mt-3 flex">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border p-2 rounded"
          placeholder="Message..."
        />
        <button
          onClick={sendChat}
          className="ml-2 bg-blue-600 text-white px-3 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
