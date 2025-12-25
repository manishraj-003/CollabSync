import React, { useRef, useEffect } from "react";

export default function EditorSurface({ ws, docId, text, setText, cursors }) {
  const editorRef = useRef(null);

  // Keep editor content in sync when remote updates arrive
  useEffect(() => {
    if (
      editorRef.current &&
      editorRef.current.innerText !== text
    ) {
      editorRef.current.innerText = text;
    }
  }, [text]);

  // HANDLE LOCAL TYPING → SEND FULL TEXT
  function onInput(e) {
    const newText = e.currentTarget.innerText;

    setText(newText);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "op",
          docId,
          content: newText
        })
      );
    }
  }

  return (
    <div className="h-full flex justify-center bg-gray-100 overflow-auto">
      {/* Editor paper */}
      <div className="w-full max-w-4xl my-6 bg-white rounded-lg shadow-sm border">
        {/* Toolbar (visual only for now) */}
        <div className="h-10 border-b flex items-center px-4 text-sm text-gray-500">
          Collaborative Editor
        </div>

        {/* Editable area */}
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
