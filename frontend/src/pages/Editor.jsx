import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { createWSConnection } from "../websocket/client";
import EditorSurface from "../components/EditorSurface";
import ChatPanel from "../components/ChatPanel";
import API from "../websocket/api";

/* ===============================
   HELPERS
   =============================== */

// Consistent color per user
function getUserColor(userId) {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-indigo-500",
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Get initials from name
function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

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
            docId,
          })
        );

        socket.send(
          JSON.stringify({
            type: "presence",
            docId,
            status: "online",
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
              status: msg.status,
            },
          }));
          break;

        case "cursor":
          if (msg.userId === user?.id) return;
          setCursors((prev) => ({
            ...prev,
            [msg.userId]: msg.position,
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
              status: "offline",
            })
          );
        }
      } catch (_) {}

      socket.close();
    };
  }, [token, docId, user?.id]);

  const onlineUsers = Object.entries(users).filter(
    ([, u]) => u.status === "online"
  );

  /* ===============================
     RENDER
     =============================== */
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* ================= HEADER ================= */}
      <header className="h-14 bg-white border-b flex items-center justify-between px-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <span className="font-semibold text-lg">CollabSync</span>
          <span className="text-sm text-gray-500 truncate">
            Document · {docId}
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* Presence Avatars */}
          <div className="flex -space-x-2">
            {onlineUsers.slice(0, 5).map(([userId, u]) => (
              <div
                key={userId}
                title={u.name}
                className={`
                  ${getUserColor(userId)}
                  w-8 h-8 rounded-full
                  flex items-center justify-center
                  text-white text-xs font-semibold
                  ring-2 ring-white
                `}
              >
                {getInitials(u.name)}
              </div>
            ))}

            {onlineUsers.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-gray-300 text-xs flex items-center justify-center ring-2 ring-white">
                +{onlineUsers.length - 5}
              </div>
            )}
          </div>

          <span className="text-sm text-gray-600">
            🟢 {onlineUsers.length}
          </span>

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

