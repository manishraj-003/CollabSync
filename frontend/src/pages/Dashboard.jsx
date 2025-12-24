import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../websocket/api";
import { useAuth } from "../context/AuthContext";
import CreateDocumentModal from "../components/CreateDocumentModal";

export default function Dashboard() {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    API.get("/document/list").then((res) => setDocs(res.data));
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Documents</h1>
        <button
          onClick={() => document.getElementById("createModal").showModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          New Document
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        {docs.map((doc) => (
          <Link
            key={doc.id}
            to={`/editor/${doc.id}`}
            className="border p-4 shadow rounded hover:shadow-lg"
          >
            <h2 className="font-medium text-lg">{doc.title}</h2>
            <p className="text-sm text-gray-600">
              Updated: {new Date(doc.updated_at).toLocaleString()}
            </p>
          </Link>
        ))}
      </div>

      <dialog id="createModal" className="modal">
        <CreateDocumentModal />
      </dialog>
    </div>
  );
}
