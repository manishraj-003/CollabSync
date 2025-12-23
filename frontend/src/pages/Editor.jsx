import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { createWSConnection } from "../websocket/client";
import EditorCanvas from "../components/EditorCanvas";
import ChatPanel from "../components/ChatPanel";
import API from "../api"; // axios instance

export default function Editor() {
  const { token, user } = useContext(AuthContext);

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
      // ✅ JOIN DOCUMENT
      socket.send(
        JSON.stringify({
          type: "join",
          docId
        })
      );

      // ✅ PRESENCE: online
      socket.send(
        JSON.stringify({
          type: "presence",
          docId,
          status: "online"
        })
      );
    };

    socket.onmessage = (e) => {
      const msg = JSON.parse(e.data);

      switch (msg.type) {
        // 🟢 Presence
        case "presence":
          setUsers((prev) => ({
            ...prev,
            [msg.userId]: {
              name: msg.name,
              status: msg.status
            }
          }));
          break;

        // 🟡 Cursor
        case "cursor":
          if (msg.userId === user?.id) return; // avoid echo
          setCursors((prev) => ({
            ...prev,
            [msg.userId]: msg.position
          }));
          break;

        // 🔵 Editor text (OT simplified)
        case "op":
          setDocText((prev) =>
            typeof applyOperation === "function"
              ? applyOperation(prev, msg.op)
              : prev
          );
          break;

        default:
          console.log("Unknown WS msg", msg);
      }
    };

    socket.onclose = () => {
      console.log("WS disconnected");
    };

    return () => {
      // ✅ PRESENCE: offline
      try {
        socket.send(
          JSON.stringify({
            type: "presence",
            docId,
            status: "offline"
          })
        );
      } catch (_) {}

      socket.close();
    };
  }, [token, docId, user?.id]);

  /* ===============================
     RENDER
     =============================== */
  return (
    <div className="flex h-screen relative">
      {/* ONLINE USERS COUNT */}
      <div className="absolute top-4 right-4 bg-green-200 px-3 py-1 rounded-full z-10">
        Online:{" "}
        {
          Object.values(users).filter(
            (u) => u.status === "online"
          ).length
        }
      </div>

      <EditorCanvas
        ws={ws}
        docId={docId}
        text={docText}
        setText={setDocText}
        cursors={cursors}
      />

      <ChatPanel ws={ws} docId={docId} />
    </div>
  );
}
