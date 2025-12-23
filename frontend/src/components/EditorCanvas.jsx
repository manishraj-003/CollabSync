import { sendOperation } from "../websocket/client";
import { useEffect, useRef } from "react";

export default function EditorCanvas({ ws, docId, text, setText, cursors }) {
  const ref = useRef(null);

  // JOIN ROOM ON CONNECT
  useEffect(() => {
    if (!ws) return;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: "join",
        docId
      }));
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);

      if (msg.type === "init") {
        setText(msg.text || "");
      }

      if (msg.type === "op") {
        applyRemoteOp(msg.op);
      }

      if (msg.type === "cursor") {
        // Update cursor overlay data
      }
    };
  }, [ws]);

  // APPLY REMOTE OT OPERATIONS
  function applyRemoteOp(op) {
    if (op.type === "insert") {
      const newText =
        text.slice(0, op.index) + op.text + text.slice(op.index);
      setText(newText);
    }
    if (op.type === "delete") {
      const newText =
        text.slice(0, op.index) +
        text.slice(op.index + op.length);
      setText(newText);
    }
  }

  // HANDLE LOCAL TYPING → SEND OP
  function onInput(e) {
    const newText = e.target.innerText;
    const oldText = text;

    const op = detectOperation(oldText, newText);
    if (!op) return;

    setText(newText);

    ws.send(JSON.stringify({
      type: "op",
      docId,
      op
    }));
  }

  // BASIC OP DETECTOR
  function detectOperation(oldText, newText) {
    // Insert
    if (newText.length > oldText.length) {
      const index = findDiffIndex(oldText, newText);
      const inserted = newText.slice(index, index + (newText.length - oldText.length));

      return {
        type: "insert",
        index,
        text: inserted
      };
    }

    // Delete
    if (newText.length < oldText.length) {
      const index = findDiffIndex(newText, oldText);
      const length = oldText.length - newText.length;

      return {
        type: "delete",
        index,
        length
      };
    }

    return null;
  }

  function findDiffIndex(a, b) {
    let i = 0;
    while (i < a.length && a[i] === b[i]) i++;
    return i;
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
