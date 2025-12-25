import React, { useRef, useEffect, useState } from "react";

/* ===============================
   HELPERS
   =============================== */

// Stable color per user
function getUserColor(userId) {
  const colors = [
    "#3b82f6", // blue
    "#22c55e", // green
    "#a855f7", // purple
    "#ec4899", // pink
    "#f97316", // orange
    "#14b8a6", // teal
    "#6366f1", // indigo
  ];

  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function EditorSurface({ ws, docId, text, setText, cursors }) {
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const [cursorRects, setCursorRects] = useState({});

  /* ===============================
     KEEP TEXT IN SYNC
     =============================== */
  useEffect(() => {
    if (
      editorRef.current &&
      editorRef.current.innerText !== text
    ) {
      editorRef.current.innerText = text;
    }
  }, [text]);

  /* ===============================
     HANDLE LOCAL INPUT
     =============================== */
  function onInput(e) {
    const newText = e.currentTarget.innerText;
    setText(newText);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "op",
          docId,
          content: newText,
        })
      );
    }
  }

  /* ===============================
     CALCULATE CURSOR POSITIONS
     =============================== */
  useEffect(() => {
    if (!editorRef.current) return;

    const rects = {};
    const editor = editorRef.current;

    Object.entries(cursors).forEach(([userId, position]) => {
      try {
        const range = document.createRange();
        const selection = editor.firstChild;

        if (!selection || !selection.textContent) return;

        const pos = Math.min(position, selection.textContent.length);
        range.setStart(selection, pos);
        range.setEnd(selection, pos);

        const rect = range.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        rects[userId] = {
          top: rect.top - containerRect.top,
          left: rect.left - containerRect.left,
        };
      } catch (_) {}
    });

    setCursorRects(rects);
  }, [cursors, text]);

  return (
    <div
      ref={containerRef}
      className="h-full flex justify-center bg-gray-100 overflow-auto relative"
    >
      {/* Editor paper */}
      <div className="w-full max-w-4xl my-6 bg-white rounded-lg shadow-sm border relative">
        {/* Toolbar */}
        <div className="h-10 border-b flex items-center px-4 text-sm text-gray-500">
          Collaborative Editor
        </div>

        {/* Cursor Layer */}
        <div className="absolute inset-0 pointer-events-none">
          {Object.entries(cursorRects).map(([userId, pos]) => (
            <div
              key={userId}
              style={{
                top: pos.top,
                left: pos.left,
                borderColor: getUserColor(userId),
              }}
              className="absolute h-5 border-l-2"
            >
              <div
                style={{ backgroundColor: getUserColor(userId) }}
                className="absolute -top-5 left-0 text-[10px] text-white px-1 py-0.5 rounded"
              >
                User
              </div>
            </div>
          ))}
        </div>

        {/* Editable Area */}
        <div
          ref={editorRef}
          contentEditable
          onInput={onInput}
          suppressContentEditableWarning
          className="
            min-h-[70vh]
            px-6 py-4
            outline-none
            text-sm
            font-mono
            leading-relaxed
            whitespace-pre-wrap
            focus:bg-gray-50
          "
        />
      </div>
    </div>
  );
}
