import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { createWSConnection } from "../websocket/client";
import EditorSurface from "../components/EditorSurface";
import ChatPanel from "../components/ChatPanel";
import API from "../websocket/api";

/* ===============================
   HELPERS
   =============================== */

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
  const [showChat, setShowChat] = useState(false);

  /* 🔥 FIX: source of truth for dark mode */
  const [dark, setDark] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const wsRef = useRef(null);
  const docId = window.location.pathname.split("/").pop();

  /* ===============================
     SYNC DARK MODE → DOM
     =============================== */
  useEffect(() => {
    const root = document.documentElement;

    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  function toggleDarkMode() {
    setDark((prev) => !prev);
  }

  /* ===============================
     LOAD DOCUMENT
     =============================== */
  useEffect(() => {
    API.get(`/document/${docId}`).then((res) => {
      setDocText(res.data.content || "");
    });
  }, [docId]);

  /* ===============================
     WEBSOCKET
     =============================== */
  useEffect(() => {
    if (!token) return;

    const socket = createWSConnection(token);
    wsRef.current = socket;
    setWS(socket);

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "join", docId }));
      socket.send(
        JSON.stringify({ type: "presence", docId, status: "online" })
      );
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

    return () => socket.close();
  }, [token, docId, user?.id]);

  const onlineUsers = Object.entries(users).filter(
    ([, u]) => u.status === "online"
  );

  /* ===============================
     RENDER
     =============================== */
  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* HEADER */}
      <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            CollabSync
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Document · {docId}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Avatars */}
          <div className="flex -space-x-2">
            {onlineUsers.map(([id, u]) => (
              <div
                key={id}
                title={u.name}
                className={`${getUserColor(
                  id
                )} w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ring-2 ring-white dark:ring-gray-800`}
              >
                {getInitials(u.name)}
              </div>
            ))}
          </div>

          <span className="text-sm text-gray-600 dark:text-gray-400">
            {onlineUsers.length} online
          </span>

          {/* 🌙 DARK MODE BUTTON */}
          <button
            onClick={toggleDarkMode}
            className="px-2 py-1 rounded-md border text-sm
                       border-gray-300 dark:border-gray-600
                       text-gray-700 dark:text-gray-200
                       hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {dark ? "☀️" : "🌙"}
          </button>

          <button
            onClick={() => setShowChat((p) => !p)}
            className="px-3 py-1 text-sm border rounded-md
                       border-gray-300 dark:border-gray-600
                       hover:bg-gray-100 dark:hover:bg-gray-700
                       text-gray-700 dark:text-gray-200"
          >
            {showChat ? "Hide Chat" : "Show Chat"}
          </button>
        </div>
      </header>

      {/* MAIN */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 bg-white dark:bg-gray-900 relative">
          {ws && (
            <EditorSurface
              ws={ws}
              docId={docId}
              text={docText}
              setText={setDocText}
              cursors={cursors}
              users={users}
            />
          )}
        </main>

        {showChat && ws && (
          <aside className="w-80 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
            <ChatPanel ws={ws} docId={docId} />
          </aside>
        )}
      </div>
    </div>
  );
}
