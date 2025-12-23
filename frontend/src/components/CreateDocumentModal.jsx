import { useState } from "react";
import API from "../api/gateway";

export default function CreateDocumentModal() {
  const [title, setTitle] = useState("");

  async function createDoc() {
    const res = await API.post("/document/create", { title });
    window.location.href = `/editor/${res.data.id}`;
  }

  return (
    <div className="modal-box bg-white p-6 rounded">
      <h2 className="text-xl font-bold mb-4">Create Document</h2>
      
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 w-full mb-4 rounded"
        placeholder="Document Title"
      />

      <button 
        onClick={createDoc} 
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Create
      </button>
    </div>
  );
}
