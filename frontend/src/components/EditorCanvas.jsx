import { useRef } from "react";

export default function EditorCanvas({ ws, docId, text, setText, cursors }) {
  const ref = useRef(null);

  // HANDLE LOCAL TYPING → SEND FULL TEXT
  function onInput(e) {
    const newText = e.target.innerText;

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
    <div className="flex-1 p-6 bg-white">
      <div
        ref={ref}
        contentEditable
        className="border p-4 min-h-[80vh] outline-none"
        onInput={onInput}
        suppressContentEditableWarning={true}
      >
        {text}
      </div>
    </div>
  );
}
