import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { createWSConnection } from "../websocket/client";
import EditorCanvas from "../components/EditorCanvas";
import ChatPanel from "../components/ChatPanel";
import API from "../api";

export default function Editor() {
  const { token, user } = useAuth();

  const [ws, setWS] = useState(null);
  const [docText, setDocText] = useState("");
  const [cursors, setCursors] = useState({});
  const [users, setUsers] = useState({});

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

  /* ===============================
     RENDER
     =============================== */
  return (
    <div className="flex h-screen relative">
      <div className="absolute top-4 right-4 bg-green-200 px-3 py-1 rounded-full z-10">
        Online:{" "}
        {Object.values(users).filter((u) => u.status === "online").length}
      </div>

      {ws && (
        <>
          <EditorCanvas
            ws={ws}
            docId={docId}
            text={docText}
            setText={setDocText}
            cursors={cursors}
          />

          <ChatPanel ws={ws} docId={docId} />
        </>
      )}
    </div>
  );
}
