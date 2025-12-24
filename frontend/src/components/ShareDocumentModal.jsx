import React from "react";
import API from "../api/gateway";
import { useState } from "react";

export default function ShareDocumentModal({ docId }) {
  const [email, setEmail] = useState("");

  async function share() {
    const user = await API.get(`/user/byEmail/${email}`);
    await API.post("/document/share", {
      userId: user.data.id,
      docId
    });
    alert("Shared!");
  }

  return (
    <div className="modal-box p-6">
      <h2 className="font-bold text-xl mb-4">Share Document</h2>

      <input
        className="border p-2 w-full mb-4 rounded"
        placeholder="Enter user email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button onClick={share} className="bg-green-600 p-2 text-white rounded">
        Share
      </button>
    </div>
  );
}
