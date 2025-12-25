import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { createWSConnection } from "../websocket/client";
import EditorSurface from "../components/EditorSurface";
import ChatPanel from "../components/ChatPanel";
import API from "../websocket/api";

export default function Editor() {
  const { token, user } = useAuth();

  const [ws, setWS] = useState(null);
  const [docText, setDocText] = useState("");
  const [cursors, setCursors] = useState({});
  const [users, setUsers] = useState({});
  const [showChat, setShowChat] = useState(true);

  const wsRef = useRef(null);
  const docId = window.location.pathname.split("/").pop();

  /* ===============================
     LOAD INITIAL DOCUMENT (HTTP)
     =============================== */
  useEffect(() => {
    API.get(`/document/${docId}`).then((res) => {
      setDocText(res.data.content || "");
    });
  }, [docId]);

  /* ===============================
     WEBSOCKET CONNECTION
     =============================== */
  useEffect(() => {
    if (!token) return;

    const socket = createWSConnection(token);
    wsRef.current = socket;
    setWS(socket);

    socket.onopen = () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "join",
            docId
          })
        );

        socket.send(
          JSON.stringify({
            type: "presence",
            docId,
            status: "online"
          })
        );
      }
    };

    socket.onmessage = (e) => {
      const msg = JSON.parse(e.data);

      switch (msg.type) {
        case "presence":
          setUsers((prev) => ({
            ...prev,
            [msg.userId]: {
              name: msg.name,
              status: msg.status
            }
          }));
          break;

        case "cursor":
          if (msg.userId === user?.id) return;
          setCursors((prev) => ({
            ...prev,
            [msg.userId]: msg.position
          }));
          break;

        case "op":
          if (typeof msg.content === "string") {
            setDocText(msg.content);
          }
          break;

        default:
          console.log("Unknown WS msg", msg);
      }
    };

    socket.onclose = () => {
      console.log("WS disconnected");
    };

    return () => {
      try {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              type: "presence",
              docId,
              status: "offline"
            })
          );
        }
      } catch (_) {}

      socket.close();
    };
  }, [token, docId, user?.id]);

  const onlineCount = Object.values(users).filter(
    (u) => u.status === "online"
  ).length;

  /* ===============================
     RENDER
     =============================== */
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* ================= HEADER ================= */}
      <header className="h-14 bg-white border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-lg">CollabSync</span>
          <span className="text-sm text-gray-500 truncate">
            Document · {docId}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            🟢 {onlineCount} online
          </div>

          <span className="text-sm font-medium text-gray-700">
            {user?.name}
          </span>

          <button
            onClick={() => setShowChat((p) => !p)}
            className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100"
          >
            {showChat ? "Hide Chat" : "Show Chat"}
          </button>

          <button className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
            Share
          </button>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <div className="flex flex-1 overflow-hidden">
        {/* EDITOR */}
        <main className="flex-1 bg-white relative">
          {ws && (
            <EditorSurface
              ws={ws}
              docId={docId}
              text={docText}
              setText={setDocText}
              cursors={cursors}
            />
          )}
        </main>

        {/* CHAT */}
        {showChat && ws && (
          <aside className="w-80 border-l bg-gray-50">
            <ChatPanel ws={ws} docId={docId} />
          </aside>
        )}
      </div>
    </div>
  );
}
